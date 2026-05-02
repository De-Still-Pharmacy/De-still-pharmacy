"use client";

import { useState } from "react";
import { approveBankTransfer, rejectBankTransfer, refundPayment } from "@/actions/admin-orders";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, CheckCircle2, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
  method: string;
  orderNumber: string;
}

type ActionType = "confirm" | "cancel" | "refund" | null;

export function PaymentActions({ paymentId, status, method, orderNumber }: PaymentActionsProps) {
  const [action, setAction] = useState<ActionType>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showConfirm = status === "PENDING" && method === "BANK_TRANSFER";
  const showCancel = status === "PENDING" && method === "BANK_TRANSFER";
  const showRefund = status === "PAID";

  if (!showConfirm && !showCancel && !showRefund) return null;

  async function handleAction() {
    setIsLoading(true);
    let result: { success?: boolean; error?: string } = {};

    if (action === "confirm") {
      result = await approveBankTransfer(paymentId, note || undefined);
    } else if (action === "cancel") {
      if (!note.trim()) {
        toast.error("Please provide a reason for cancellation");
        setIsLoading(false);
        return;
      }
      result = await rejectBankTransfer(paymentId, note);
    } else if (action === "refund") {
      result = await refundPayment(paymentId, note || undefined);
    }

    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        action === "confirm"
          ? "Payment confirmed"
          : action === "cancel"
            ? "Payment cancelled"
            : "Payment refunded"
      );
      setAction(null);
      setNote("");
    }
  }

  const dialogConfig = {
    confirm: {
      title: "Confirm Payment",
      description: `Mark payment for order #${orderNumber} as paid?`,
      buttonLabel: "Confirm Payment",
      buttonVariant: "default" as const,
    },
    cancel: {
      title: "Cancel Payment",
      description: `Cancel payment for order #${orderNumber}? This will also cancel the order and restore stock.`,
      buttonLabel: "Cancel Payment",
      buttonVariant: "destructive" as const,
    },
    refund: {
      title: "Refund Payment",
      description: `Refund payment for order #${orderNumber}? This will mark the order as refunded and restore stock.`,
      buttonLabel: "Refund Payment",
      buttonVariant: "destructive" as const,
    },
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showConfirm && (
            <DropdownMenuItem onClick={() => setAction("confirm")}>
              <CheckCircle2 className="size-4 mr-2 text-green-600" />
              Confirm
            </DropdownMenuItem>
          )}
          {showCancel && (
            <DropdownMenuItem onClick={() => setAction("cancel")}>
              <XCircle className="size-4 mr-2 text-destructive" />
              Cancel
            </DropdownMenuItem>
          )}
          {showRefund && (
            <DropdownMenuItem onClick={() => setAction("refund")}>
              <RotateCcw className="size-4 mr-2 text-orange-500" />
              Refund
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {action && (
        <Dialog open={!!action} onOpenChange={(open) => { if (!open) { setAction(null); setNote(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogConfig[action].title}</DialogTitle>
              <DialogDescription>{dialogConfig[action].description}</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder={action === "cancel" ? "Reason for cancellation (required)" : "Add a note (optional)"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAction(null); setNote(""); }} disabled={isLoading}>
                Close
              </Button>
              <Button
                variant={dialogConfig[action].buttonVariant}
                onClick={handleAction}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {dialogConfig[action].buttonLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
