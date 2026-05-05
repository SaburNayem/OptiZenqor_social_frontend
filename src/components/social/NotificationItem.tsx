import { BriefcaseBusiness, Heart, MessageCircleMore, Sparkles, UserRoundPlus } from 'lucide-react';
import { AppNotification } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const iconMap = {
  heart: Heart,
  message: MessageCircleMore,
  'user-plus': UserRoundPlus,
  sparkles: Sparkles,
  briefcase: BriefcaseBusiness,
};

interface NotificationItemProps {
  item: AppNotification;
  onRead: (id: string) => void;
}

export function NotificationItem({ item, onRead }: NotificationItemProps) {
  const Icon = iconMap[item.icon];

  return (
    <div
      className={cn(
        'rounded-[24px] border p-4 transition',
        item.unread
          ? 'border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/20'
          : 'border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40',
      )}
    >
      <div className="flex gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
          <Icon className="h-4 w-4 text-sky-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{item.createdAt}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
          <div className="mt-3 flex gap-2">
            {item.cta ? <Button size="sm">{item.cta}</Button> : null}
            {item.unread ? (
              <Button variant="ghost" size="sm" onClick={() => onRead(item.id)}>
                Mark read
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
