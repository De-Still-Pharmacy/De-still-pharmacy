import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookSignature } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    if (!validateWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const payment = await prisma.payment.findUnique({
        where: { paystackReference: reference },
        include: { order: true },
      });

      if (payment && payment.status !== "PAID") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: "PAID", paidAt: new Date() },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "CONFIRMED" },
          }),
          prisma.orderStatusHistory.create({
            data: {
              orderId: payment.orderId,
              status: "CONFIRMED",
              note: "Payment confirmed via Paystack",
            },
          }),
          prisma.notification.create({
            data: {
              type: "PAYMENT_RECEIVED",
              title: "Payment Received",
              message: `Payment confirmed for order #${payment.order.orderNumber}`,
              metadata: { orderId: payment.orderId },
            },
          }),
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Handle receipt upload for bank transfer
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, receiptUrl } = await req.json();

    if (!orderId || !receiptUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.payment.update({
      where: { orderId },
      data: { bankTransferReceipt: receiptUrl },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Receipt upload error:", error);
    return NextResponse.json({ error: "Failed to save receipt" }, { status: 500 });
  }
}
