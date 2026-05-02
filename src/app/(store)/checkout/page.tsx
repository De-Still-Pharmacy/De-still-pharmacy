"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/hooks/use-cart";
import { useSession } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { FloatingSelect } from "@/components/ui/floating-select";
import { processCheckout } from "@/actions/checkout";
import { getBankDetails } from "@/actions/settings";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { NIGERIAN_STATES } from "@/lib/constants";
import {
  Loader2, Building2, Copy, Check, CreditCard, Landmark,
  Truck, Store, Upload, FileText, X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const { format } = useCurrency();
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<"PAYSTACK" | "BANK_TRANSFER">("PAYSTACK");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<{
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    getBankDetails().then(setBankDetails);
  }, []);

  const subtotal = getSubtotal();

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className={cn(buttonVariants(), "mt-4")}>Browse Products</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      firstName: form.get("firstName") as string,
      lastName: form.get("lastName") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      deliveryMethod,
      paymentMethod,
      street: (form.get("street") as string) || undefined,
      city: (form.get("city") as string) || undefined,
      state: (form.get("state") as string) || undefined,
      zipCode: (form.get("zipCode") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    };

    const cartData = items.map((item) => ({ id: item.id, quantity: item.quantity }));
    const result = await processCheckout(data, cartData);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    if (result.paymentMethod === "BANK_TRANSFER") {
      if (!receiptFile) {
        toast.error("Please upload a receipt");
        setIsLoading(false);
        return;
      }

      const uploadForm = new FormData();
      uploadForm.append("file", receiptFile);
      uploadForm.append("folder", "receipts");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        await fetch("/api/paystack/webhook", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: result.orderId, receiptUrl: uploadData.url }),
        });

        setIsCompleted(true);
        clearCart();
        router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
      } else {
        toast.error("Failed to upload receipt");
        setIsLoading(false);
      }
    } else {
      // Initialize Paystack inline popup
      const paystackRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          amount: Math.round(result.total! * 100),
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        }),
      });
      const paystackData = await paystackRes.json();

      if (paystackData.data?.access_code) {
        if (!window.PaystackPop) {
          toast.error("Payment system is still loading, please try again");
          setIsLoading(false);
          return;
        }

        const paystackReference = paystackData.data.reference;
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: data.email,
          amount: Math.round(result.total! * 100),
          access_code: paystackData.data.access_code,
          callback: async () => {
            // Verify payment server-side to update status to PAID
            try {
              await fetch("/api/paystack/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: paystackReference }),
              });
            } catch {
              // Webhook will handle it as fallback
            }
            setIsCompleted(true);
            clearCart();
            router.push(`/checkout/success?orderNumber=${result.orderNumber}`);
          },
          onClose: () => {
            toast.info("Payment was cancelled");
            setIsLoading(false);
          },
        });
        handler.openIframe();
      } else {
        toast.error(paystackData.error || paystackData.message || "Failed to initialize payment");
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Script src="https://js.paystack.co/v1/inline.js" />
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingInput id="firstName" name="firstName" label="First Name" required defaultValue={session?.user?.name?.split(" ")[0] || ""} />
                <FloatingInput id="lastName" name="lastName" label="Last Name" required defaultValue={session?.user?.name?.split(" ").slice(1).join(" ") || ""} />
                <FloatingInput id="email" name="email" type="email" label="Email" required defaultValue={session?.user?.email || ""} />
                <FloatingInput id="phone" name="phone" type="tel" label="Phone" required />
              </CardContent>
            </Card>

            {/* Delivery Method */}
            <Card>
              <CardHeader><CardTitle>Delivery Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <RadioOption
                  selected={deliveryMethod === "DELIVERY"}
                  onSelect={() => setDeliveryMethod("DELIVERY")}
                  icon={<Truck className="size-5" />}
                  title="Delivery"
                  description="We deliver to your address"
                />
                <RadioOption
                  selected={deliveryMethod === "PICKUP"}
                  onSelect={() => setDeliveryMethod("PICKUP")}
                  icon={<Store className="size-5" />}
                  title="Pickup"
                  description="Pickup from our pharmacy"
                />
              </CardContent>
            </Card>

            {/* Address (shown only for delivery) */}
            {deliveryMethod === "DELIVERY" && (
              <Card>
                <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FloatingInput id="street" name="street" label="Street Address" required />
                  </div>
                  <FloatingInput id="city" name="city" label="City" required />
                  <FloatingSelect name="state" label="State" required>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </FloatingSelect>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <RadioOption
                  selected={paymentMethod === "PAYSTACK"}
                  onSelect={() => setPaymentMethod("PAYSTACK")}
                  icon={<CreditCard className="size-5" />}
                  title="Pay Online (Paystack)"
                  description="Card, bank transfer, USSD"
                />
                <RadioOption
                  selected={paymentMethod === "BANK_TRANSFER"}
                  onSelect={() => setPaymentMethod("BANK_TRANSFER")}
                  icon={<Landmark className="size-5" />}
                  title="Direct Bank Transfer"
                  description="Transfer and upload receipt"
                >
                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="mt-3 ml-10 space-y-4">
                      {bankDetails?.bankName && bankDetails?.bankAccountNumber && bankDetails?.bankAccountName ? (
                        <div className="bg-background border rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Building2 className="size-4 text-muted-foreground" />
                            Transfer to:
                          </div>
                          <BankDetailRow label="Bank" value={bankDetails.bankName} copiedField={copiedField} onCopy={setCopiedField} />
                          <BankDetailRow label="Account Number" value={bankDetails.bankAccountNumber} copiedField={copiedField} onCopy={setCopiedField} />
                          <BankDetailRow label="Account Name" value={bankDetails.bankAccountName} copiedField={copiedField} onCopy={setCopiedField} />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Bank details not available. Please contact support.
                        </p>
                      )}

                      {/* Receipt Upload */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload your payment receipt after making the transfer
                        </p>
                        {receiptFile ? (
                          <div className="flex items-center gap-3 border rounded-xl p-3 bg-primary/5">
                            <FileText className="size-5 text-primary shrink-0" />
                            <span className="text-sm font-medium flex-1 truncate">{receiptFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setReceiptFile(null)}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                            <Upload className="size-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Choose file (PNG, JPG, PDF)
                            </span>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf"
                              className="hidden"
                              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </RadioOption>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader><CardTitle>Order Notes (Optional)</CardTitle></CardHeader>
              <CardContent>
                <Textarea name="notes" placeholder="Any special instructions..." />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="h-fit sticky top-20">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{format(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span><span>{format(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment will be processed in NGN (Nigerian Naira)
              </p>
              {paymentMethod === "PAYSTACK" ? (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pay Now
                </Button>
              ) : receiptFile ? (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Payment
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

function RadioOption({
  selected,
  onSelect,
  icon,
  title,
  description,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex flex-col rounded-lg border p-4 cursor-pointer transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-primary" : "border-muted-foreground/40"
          )}
        >
          {selected && (
            <div className="size-2.5 rounded-full bg-primary" />
          )}
        </div>
        <div className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function BankDetailRow({
  label,
  value,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  copiedField: string | null;
  onCopy: (field: string | null) => void;
}) {
  const isCopied = copiedField === label;

  function handleCopy() {
    navigator.clipboard.writeText(value);
    onCopy(label);
    setTimeout(() => onCopy(null), 2000);
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-medium">{value}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground p-1"
      >
        {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
