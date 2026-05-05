import { cn } from '../../lib/utils';

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
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-2xl object-cover',
        sizeClasses[size],
        ring && 'ring-2 ring-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] dark:ring-slate-900',
      )}
    />
  );
}
