import { getAdminOrderDetail } from "@/actions/admin-orders";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, DELIVERY_METHOD_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { OrderActions } from "@/components/admin/order-actions";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {format(order.createdAt, "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge variant={order.status === "DELIVERED" ? "default" : order.status === "CANCELLED" ? "destructive" : "secondary"} className="text-sm">
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                  <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                    {item.productImage && <Image src={item.productImage} alt="" width={48} height={48} className="object-cover h-full w-full" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery Fee</span><span>{formatCurrency(order.deliveryFee)}</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.statusHistory.map((entry) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{ORDER_STATUS_LABELS[entry.status]}</p>
                      {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                      <p className="text-xs text-muted-foreground">{format(entry.createdAt, "MMM d, yyyy h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">
                {order.user?.name || `${order.guestFirstName || ""} ${order.guestLastName || ""}`.trim() || "Guest"}
              </p>
              <p className="text-muted-foreground">{order.user?.email || order.guestEmail}</p>
              <p className="text-muted-foreground">{order.user?.phone || order.guestPhone}</p>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card>
            <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <Badge variant="outline">{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</Badge>
              {order.address && (
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Method</span>
                <Badge variant="outline">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant={order.payment?.status === "PAID" ? "default" : "secondary"}>
                  {PAYMENT_STATUS_LABELS[order.payment?.status || "PENDING"]}
                </Badge>
              </div>
              {order.payment?.bankTransferReceipt && (
                <div className="mt-3">
                  <p className="font-medium mb-2">Transfer Receipt:</p>
                  <Image
                    src={order.payment.bankTransferReceipt}
                    alt="Transfer receipt"
                    width={200}
                    height={200}
                    className="rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            paymentId={order.payment?.id}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.payment?.status || "PENDING"}
          />
        </div>
      </div>
    </div>
  );
}
