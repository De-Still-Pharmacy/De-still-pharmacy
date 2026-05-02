import { getDashboardStats, getRevenueChartData, getRecentOrders, getTopSellingProducts } from "@/actions/analytics";
import { StatsCard } from "@/components/admin/stats-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingBag, Package, Users, Clock, ArrowRight, TrendingUp, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [stats, chartData, recentOrders, topProducts] = await Promise.all([
    getDashboardStats(),
    getRevenueChartData(30),
    getRecentOrders(5),
    getTopSellingProducts(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your pharmacy store
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="green" />
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="blue" />
        <StatsCard title="Products" value={stats.totalProducts} icon={Package} color="purple" />
        <StatsCard title="Customers" value={stats.totalUsers} icon={Users} color="orange" />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} color="pink" />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={chartData} />

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-base">Recent Orders</span>
              <Link href="/admin/orders" className="text-sm font-normal text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 flex-shrink-0">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topProducts.map((product, i) => {
                const rankColors = [
                  "bg-amber-50 text-amber-600",
                  "bg-slate-50 text-slate-500",
                  "bg-orange-50 text-orange-600",
                  "bg-blue-50 text-blue-500",
                  "bg-purple-50 text-purple-500",
                ];
                return (
                  <div key={product.productId} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${rankColors[i] || rankColors[4]}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-emerald-600">{formatCurrency(product.totalRevenue)}</span>
                  </div>
                );
              })}
              {topProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No sales data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
