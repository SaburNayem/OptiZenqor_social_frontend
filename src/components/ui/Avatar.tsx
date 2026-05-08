import { cn } from '../../lib/utils';
import { useMemo, useState } from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

export function Avatar({ src, alt, size = 'md', ring = false }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => {
    const words = alt.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('') || '?';
  }, [alt]);

  if (!src || failed) {
    return (
      <div
        aria-label={alt}
        className={cn(
          'flex items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200',
          sizeClasses[size],
          ring && 'ring-2 ring-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] dark:ring-slate-900',
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn(
        'rounded-2xl object-cover',
        sizeClasses[size],
        ring && 'ring-2 ring-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] dark:ring-slate-900',
      )}
    />
  );
}
