import { BellRing } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { NotificationItem } from '../components/social/NotificationItem';

export function NotificationsPage() {
  const { app } = useAppOutlet();
  const unreadCount = app.data.notifications.filter((item) => item.unread).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-sky-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Notifications</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
          One clean notification center
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {unreadCount} unread updates from your network, with no extra duplicate counters on the page.
        </p>
      </div>

      {app.data.notifications.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">No notifications yet.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            When likes, messages, follows, or mentions arrive, they will appear here.
          </p>
        </Card>
      ) : (
        <section className="space-y-4">
          {app.data.notifications.map((item) => (
            <NotificationItem key={item.id} item={item} onRead={app.markNotificationRead} />
          ))}
        </section>
      )}
    </div>
  );
}
