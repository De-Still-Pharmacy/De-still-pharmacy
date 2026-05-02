import { Suspense } from "react";
import { getAdminPayments } from "@/actions/admin-orders";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentActions } from "@/components/admin/payment-actions";
import { PaymentsToolbar } from "@/components/admin/payments-toolbar";
import { Pagination } from "@/components/admin/pagination";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const currentPage = Number(params.page) || 1;
  const currentMethod = typeof params.method === "string" ? params.method : undefined;
  const currentStatus = typeof params.status === "string" ? params.status : undefined;
  const currentSearch = typeof params.search === "string" ? params.search : undefined;

  const result = await getAdminPayments({
    page: currentPage,
    limit: 20,
    method: currentMethod,
    status: currentStatus,
    search: currentSearch,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments ({result.total})</h1>

      <Suspense>
        <PaymentsToolbar
          currentMethod={currentMethod || "all"}
          currentStatus={currentStatus || "all"}
          currentSearch={currentSearch || ""}
        />
      </Suspense>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.orderNumber}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{PAYMENT_METHOD_LABELS[payment.method]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "PAID" ? "default" : payment.status === "FAILED" ? "destructive" : "secondary"}>
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(payment.createdAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <PaymentActions
                      paymentId={payment.id}
                      status={payment.status}
                      method={payment.method}
                      orderNumber={payment.orderNumber}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {result.payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Suspense>
        <Pagination
          currentPage={currentPage}
          totalPages={result.totalPages}
          basePath="/admin/payments"
        />
      </Suspense>
    </div>
  );
}
