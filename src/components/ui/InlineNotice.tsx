import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InlineNoticeProps {
  tone?: 'info' | 'success' | 'error';
  message: string;
  className?: string;
}

const toneClasses: Record<NonNullable<InlineNoticeProps['tone']>, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
  error:
    'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200',
};

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
} satisfies Record<NonNullable<InlineNoticeProps['tone']>, typeof Info>;

export function InlineNotice({ tone = 'info', message, className }: InlineNoticeProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm',
        toneClasses[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
