"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations/order";

interface CartItemInput {
  id: string;
  quantity: number;
}

export async function processCheckout(
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    deliveryMethod: "PICKUP" | "DELIVERY";
    paymentMethod: "PAYSTACK" | "BANK_TRANSFER";
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    notes?: string;
  },
  cartItems: CartItemInput[]
) {
  const validated = checkoutSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const session = await auth();
  const userId = session?.user?.id || null;

  // Verify products and calculate totals
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((item) => item.id) } },
    include: { images: { take: 1, orderBy: { position: "asc" } } },
  });

  if (products.length !== cartItems.length) {
    return { error: "Some products are no longer available" };
  }

  let subtotal = 0;
  const orderItemsData: {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productName: string;
    productImage: string | null;
  }[] = [];

  for (const cartItem of cartItems) {
    const product = products.find((p) => p.id === cartItem.id);
    if (!product) return { error: `Product not found` };
    if (product.stock < cartItem.quantity) {
      return { error: `${product.name} has insufficient stock` };
    }

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * cartItem.quantity;
    subtotal += totalPrice;

    orderItemsData.push({
      productId: product.id,
      quantity: cartItem.quantity,
      unitPrice: (unitPrice),
      totalPrice: (totalPrice),
      productName: product.name,
      productImage: product.images[0]?.url || null,
    });
  }

  const total = subtotal;

  const orderNumber = generateOrderNumber();

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create address if delivery
    let addressId: string | null = null;
    if (formData.deliveryMethod === "DELIVERY" && formData.street) {
      const address = await tx.address.create({
        data: {
          userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          street: formData.street,
          city: formData.city || "",
          state: formData.state || "",
          zipCode: formData.zipCode,
        },
      });
      addressId = address.id;
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        status: "PENDING",
        subtotal: (subtotal),
        deliveryFee: 0,
        total: (total),
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        guestEmail: !userId ? formData.email : null,
        guestFirstName: !userId ? formData.firstName : null,
        guestLastName: !userId ? formData.lastName : null,
        guestPhone: !userId ? formData.phone : null,
        notes: formData.notes,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            amount: (total),
            method: formData.paymentMethod,
            status: "PENDING",
          },
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: "Order placed",
          },
        },
      },
    });

    // Decrement stock
    for (const cartItem of cartItems) {
      await tx.product.update({
        where: { id: cartItem.id },
        data: { stock: { decrement: cartItem.quantity } },
      });
    }

    // Create notification
    await tx.notification.create({
      data: {
        type: "NEW_ORDER",
        title: "New Order",
        message: `New order #${orderNumber} from ${formData.firstName} ${formData.lastName}`,
        metadata: { orderId: newOrder.id, orderNumber },
      },
    });

    return newOrder;
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentMethod: formData.paymentMethod,
    total,
  };
}
