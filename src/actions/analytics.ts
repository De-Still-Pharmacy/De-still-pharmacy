"use server";

import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

export async function getDashboardStats() {
  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
  };
}

export async function getRevenueChartData(days: number = 30) {
  const startDate = startOfDay(subDays(new Date(), days));

  const payments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: startDate },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: { paidAt: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), days - i), "MMM dd");
    grouped[date] = 0;
  }

  for (const payment of payments) {
    if (payment.paidAt) {
      const date = format(payment.paidAt, "MMM dd");
      if (grouped[date] !== undefined) {
        grouped[date] += Number(payment.amount);
      }
    }
  }

  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export async function getOrderStatusBreakdown() {
  const orders = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return orders.map((o) => ({
    status: o.status,
    count: o._count.status,
  }));
}

export async function getRecentOrders(limit: number = 10) {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payment: true,
      user: { select: { name: true, email: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user?.name || o.guestFirstName || "Guest",
    customerEmail: o.user?.email || o.guestEmail || "",
    total: Number(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.payment?.status || "PENDING",
    itemCount: o.items.length,
    createdAt: o.createdAt,
  }));
}

export async function getTopSellingProducts(limit: number = 5) {
  const products = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const productDetails = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.productId) } },
    select: { id: true, name: true, slug: true },
  });

  return products.map((p) => {
    const detail = productDetails.find((d) => d.id === p.productId);
    return {
      productId: p.productId,
      name: detail?.name || "Unknown",
      slug: detail?.slug || "",
      totalSold: p._sum.quantity || 0,
      totalRevenue: Number(p._sum.totalPrice || 0),
    };
  });
}
