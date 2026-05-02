"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import { FloatingSelect } from "@/components/ui/floating-select";
import { FloatingInput } from "@/components/ui/floating-input";
import { updateOrderStatus, approveBankTransfer, rejectBankTransfer } from "@/actions/admin-orders";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  paymentId?: string;
  paymentMethod: string;
  paymentStatus: string;
}

export function OrderActions({ orderId, currentStatus, paymentId, paymentMethod, paymentStatus }: OrderActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  async function handleStatusUpdate() {
    setIsUpdating(true);
    const result = await updateOrderStatus(orderId, status, note || undefined);
    if (result.success) {
      toast.success("Order status updated");
      router.refresh();
    }
    setIsUpdating(false);
  }

  async function handleApprove() {
    if (!paymentId) return;
    setIsApproving(true);
    const result = await approveBankTransfer(paymentId);
    if (result.success) {
      toast.success("Payment approved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsApproving(false);
  }

  async function handleReject() {
    if (!paymentId || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsRejecting(true);
    const result = await rejectBankTransfer(paymentId, rejectReason);
    if (result.success) {
      toast.success("Payment rejected");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsRejecting(false);
  }

  return (
    <div className="space-y-4">
      {/* Bank Transfer Approval */}
      {paymentMethod === "BANK_TRANSFER" && paymentStatus === "PENDING" && paymentId && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader><CardTitle className="text-sm">Bank Transfer Approval</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={handleApprove} disabled={isApproving} className="flex-1" variant="default">
                {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Approve
              </Button>
            </div>
            <div className="space-y-2">
              <FloatingInput
                id="rejectReason"
                label="Reason for rejection"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button onClick={handleReject} disabled={isRejecting} variant="destructive" className="w-full">
                {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Update */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Update Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <FloatingSelect label="Status" value={status} onValueChange={(val) => val && setStatus(val)}>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </FloatingSelect>
          <FloatingInput
            id="note"
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button onClick={handleStatusUpdate} disabled={isUpdating || status === currentStatus} className="w-full">
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
