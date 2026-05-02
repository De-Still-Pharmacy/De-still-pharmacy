import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const result = await verifyTransaction(reference);

    if (!result.status || result.data.status !== "success") {
      return NextResponse.json(
        { error: result.message || "Payment verification failed" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "PAID") {
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

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
