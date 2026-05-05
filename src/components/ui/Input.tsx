import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, id, ...props },
  ref,
) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span> : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-12 w-full rounded-2xl border border-white/70 bg-white/80 px-4 text-sm text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:focus:ring-sky-500/20',
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  );
});
