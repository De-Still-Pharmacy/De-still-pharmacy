import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.isRead ? "opacity-60" : ""}>
            <CardContent className="p-4 flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{notification.title}</p>
                  {!notification.isRead && <Badge className="text-xs">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(notification.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No notifications yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
