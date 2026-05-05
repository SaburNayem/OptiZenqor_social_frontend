import { BellRing } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { NotificationItem } from '../components/social/NotificationItem';

export function NotificationsPage() {
  const { app } = useAppOutlet();
  const unreadCount = app.data.notifications.filter((item) => item.unread).length;

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-sky-500" />
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Notifications</p>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
            Keep up with the right moments
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Likes, comments, invitations, and key updates from your network.
          </p>
        </div>
        <div className="rounded-[24px] bg-slate-950 px-5 py-4 text-white dark:bg-sky-500 dark:text-slate-950">
          <p className="text-xs uppercase tracking-[0.24em] opacity-70">Unread</p>
          <p className="mt-2 text-3xl font-semibold">{unreadCount}</p>
        </div>
      </Card>

      <section className="space-y-4">
        {app.data.notifications.map((item) => (
          <NotificationItem key={item.id} item={item} onRead={app.markNotificationRead} />
        ))}
      </section>
    </div>
  );
}
