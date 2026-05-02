import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/store/price-display";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">No orders yet</h1>
        <p className="text-muted-foreground mt-2">Start shopping to see your orders here.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(order.createdAt, "MMM d, yyyy")} &middot; {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <PriceDisplay amount={Number(order.total)} size="sm" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
