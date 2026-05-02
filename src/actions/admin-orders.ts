"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAdminOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  await requireAdmin();
  const { page = 1, limit = 20, status, search } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { guestEmail: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        payment: true,
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || `${o.guestFirstName || ""} ${o.guestLastName || ""}`.trim() || "Guest",
      customerEmail: o.user?.email || o.guestEmail || "",
      total: Number(o.total),
      status: o.status,
      deliveryMethod: o.deliveryMethod,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.payment?.status || "PENDING",
      itemCount: o.items.length,
      createdAt: o.createdAt,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminOrderDetail(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: { include: { product: { select: { slug: true } } } },
      payment: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    tax: Number(order.tax),
    total: Number(order.total),
    items: order.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    payment: order.payment ? {
      ...order.payment,
      amount: Number(order.payment.amount),
    } : null,
  };
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  await requireAdmin();

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: status as any,
        note,
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function approveBankTransfer(paymentId: string, note?: string) {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) return { error: "Payment not found" };

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "PAID", adminNote: note, paidAt: new Date() },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: "CONFIRMED",
        note: "Bank transfer approved",
      },
    }),
    prisma.notification.create({
      data: {
        type: "PAYMENT_APPROVED",
        title: "Payment Approved",
        message: `Payment for order #${payment.order.orderNumber} has been approved`,
        metadata: { orderId: payment.orderId },
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${payment.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function rejectBankTransfer(paymentId: string, note: string) {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { items: true } } },
  });

  if (!payment) return { error: "Payment not found" };

  const stockUpdates = payment.order.items.map((item) =>
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  );

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED", adminNote: note },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CANCELLED" },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: "CANCELLED",
        note: `Bank transfer rejected: ${note}`,
      },
    }),
    ...stockUpdates,
  ]);

  revalidatePath(`/admin/orders/${payment.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function refundPayment(paymentId: string, note?: string) {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { items: true } } },
  });

  if (!payment) return { error: "Payment not found" };
  if (payment.status !== "PAID") return { error: "Only paid payments can be refunded" };

  const stockUpdates = payment.order.items.map((item) =>
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  );

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED", adminNote: note },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "REFUNDED" },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        status: "REFUNDED",
        note: note || "Payment refunded by admin",
      },
    }),
    prisma.notification.create({
      data: {
        type: "PAYMENT_REFUNDED",
        title: "Payment Refunded",
        message: `Payment for order #${payment.order.orderNumber} has been refunded`,
        metadata: { orderId: payment.orderId },
      },
    }),
    ...stockUpdates,
  ]);

  revalidatePath(`/admin/orders/${payment.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  search?: string;
}) {
  await requireAdmin();
  const { page = 1, limit = 20, status, method, search } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (search) {
    where.order = {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { guestFirstName: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true } },
            guestEmail: true,
            guestFirstName: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments: payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      orderNumber: p.order.orderNumber,
      customerName: p.order.user?.name || p.order.guestFirstName || "Guest",
      bankTransferReceipt: p.bankTransferReceipt,
      paystackReference: p.paystackReference,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}
