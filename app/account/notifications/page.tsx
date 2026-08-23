'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2, Check, Package, Truck, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMyNotifications, markNotificationRead } from '@/lib/orders/notification-service';

interface Notification {
  id: string;
  orderId: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  order_placed: Package,
  order_confirmed: Check,
  order_dispatched: Truck,
  order_out_for_delivery: Truck,
  order_delivered: Check,
  payment_received: CreditCard,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getMyNotifications();
      setNotifications(data);
      setLoading(false);
    })();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <Loader2 className="text-primary size-6 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading notifications…</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="text-muted-foreground size-8" />
            <h3 className="font-medium">No notifications yet</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              You&apos;ll see order updates, delivery status, and promotions here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] ?? Bell;
            const isUnread = !notif.readAt;
            return (
              <Card
                key={notif.id}
                className={isUnread ? 'border-primary/30 bg-primary/5' : ''}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`grid size-10 shrink-0 place-items-center rounded-full ${isUnread ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`size-5 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <Check className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    {notif.body && (
                      <p className="text-muted-foreground mt-0.5 text-xs">{notif.body}</p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
