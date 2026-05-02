"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, Upload, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getBankDetails } from "@/actions/settings";

function BankTransferContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [bankDetails, setBankDetails] = useState<{
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    getBankDetails().then(setBankDetails);
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const form = new FormData(e.currentTarget);
    const file = form.get("receipt") as File;
    if (!file || file.size === 0) {
      toast.error("Please select a file");
      setUploading(false);
      return;
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("folder", "receipts");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: uploadForm,
    });
    const data = await res.json();

    if (data.url) {
      // Update payment with receipt URL
      await fetch("/api/paystack/webhook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, receiptUrl: data.url }),
      });

      setUploaded(true);
      toast.success("Receipt uploaded successfully");
    } else {
      toast.error("Upload failed. Please try again.");
    }
    setUploading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Bank Transfer</CardTitle>
          {orderNumber && (
            <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Transfer to:</h3>
            {bankDetails?.bankName && bankDetails?.bankAccountNumber && bankDetails?.bankAccountName ? (
              <>
                <CopyRow label="Bank" value={bankDetails.bankName} copiedField={copiedField} onCopy={setCopiedField} />
                <CopyRow label="Account Number" value={bankDetails.bankAccountNumber} copiedField={copiedField} onCopy={setCopiedField} />
                <CopyRow label="Account Name" value={bankDetails.bankAccountName} copiedField={copiedField} onCopy={setCopiedField} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Bank details not available. Please contact support.
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            After making the transfer, upload your payment receipt below for verification.
          </p>

          {uploaded ? (
            <div className="text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="font-medium">Receipt uploaded successfully!</p>
              <p className="text-sm text-muted-foreground">
                Your order is pending approval. You will be notified once payment is confirmed.
              </p>
              <Link href="/" className={buttonVariants()}>Return to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="receipt">Upload Receipt</Label>
                <input
                  id="receipt"
                  name="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  required
                  className="mt-1 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Upload Receipt</>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CopyRow({
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

export default function BankTransferPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-lg text-center">Loading...</div>}>
      <BankTransferContent />
    </Suspense>
  );
}
