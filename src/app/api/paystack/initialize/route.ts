import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, amount, orderId, orderNumber } = await req.json();

    if (!email || !amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reference = `PS_${crypto.randomBytes(12).toString("hex")}`;

    const result = await initializeTransaction({
      email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderNumber=${orderNumber}`,
      metadata: { orderId, orderNumber },
    });

    if (!result.status) {
      console.error("Paystack API error:", result);
      return NextResponse.json({ error: result.message || "Paystack initialization failed" }, { status: 400 });
    }

    await prisma.payment.update({
      where: { orderId },
      data: {
        paystackReference: reference,
        paystackAccessCode: result.data.access_code,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Paystack init error:", error);
    const message = error instanceof Error ? error.message : "Failed to initialize payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
