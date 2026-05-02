"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const clearCart = useCartStore((s) => s.clearCart);
  const orderNumber = searchParams.get("orderNumber");
  const [countdown, setCountdown] = useState(5);

  // Clear cart on mount as a safety measure
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Auto-redirect after countdown
  useEffect(() => {
    if (status === "loading") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(session?.user ? "/orders" : "/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, session, router]);

  const redirectPath = session?.user ? "/orders" : "/";
  const redirectLabel = session?.user ? "My Orders" : "Home";

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg text-center">
      <Card>
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderNumber && (
            <p className="text-muted-foreground">
              Order Number: <span className="font-mono font-bold">{orderNumber}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase. You will receive an email confirmation shortly.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to {redirectLabel} in {countdown}s...
          </p>
          <div className="flex flex-col gap-2">
            <Link href={redirectPath} className={buttonVariants()}>
              Go to {redirectLabel}
            </Link>
            <Link href="/products" className={buttonVariants({ variant: "outline" })}>
              Continue Shopping
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 max-w-lg text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
