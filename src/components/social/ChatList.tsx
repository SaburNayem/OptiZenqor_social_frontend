import { ChatThread } from '../../types';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

interface ChatListProps {
  chats: ChatThread[];
  selectedChatId: string;
  onSelect: (id: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelect }: ChatListProps) {
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <button
          key={chat.id}
          type="button"
          onClick={() => onSelect(chat.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-[24px] border p-3 text-left transition',
            selectedChatId === chat.id
              ? 'border-slate-950 bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:border-white dark:bg-white dark:text-slate-950'
              : 'border-slate-200/70 bg-white/60 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-white dark:hover:bg-slate-900',
          )}
        >
          <div className="relative">
            <Avatar src={chat.participant.avatar} alt={chat.participant.name} />
            {chat.online ? (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{chat.participant.name}</p>
              <span className="text-[11px] opacity-70">{chat.lastActive}</span>
            </div>
            <p className="mt-1 text-xs opacity-70">{chat.roleLabel}</p>
            <p className="truncate text-sm opacity-80">{chat.preview}</p>
          </div>
          {chat.unreadCount > 0 ? (
            <span className="rounded-full bg-sky-500 px-2 py-1 text-[11px] font-semibold text-white">
              {chat.unreadCount}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
