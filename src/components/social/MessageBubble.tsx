import { ChatMessage, ViewerUser } from '../../types';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  viewer: ViewerUser;
}

export function MessageBubble({ message, viewer }: MessageBubbleProps) {
  const isSelf = message.authorId === viewer.id;

  return (
    <div className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-[24px] px-4 py-3 text-sm shadow-sm',
          isSelf
            ? 'bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-white'
            : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100',
        )}
      >
        <p>{message.body}</p>
        <p className={cn('mt-2 text-[11px]', isSelf ? 'text-white/70' : 'text-slate-400')}>
          {message.createdAt}
        </p>
      </div>
    </div>
  );
}
