import { Circle, MessageSquareMore, Radar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SocialAppData } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { UserSuggestion } from './UserSuggestion';

interface RightSidebarProps {
  data: SocialAppData;
  selectedChatId: string;
  onSelectChat: (id: string) => void;
  onToggleSuggestion: (id: string) => void;
}

export function RightSidebar({
  data,
  selectedChatId,
  onSelectChat,
  onToggleSuggestion,
}: RightSidebarProps) {
  const activeChats = data.chats.filter((chat) => chat.online);
  const recentChats = data.chats.slice(0, 6);

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <Card>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Active people</p>
          </div>
          <div className="mt-4 space-y-3">
            {activeChats.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No one is active right now.</p>
            ) : (
              activeChats.map((chat) => (
                <Link
                  key={chat.id}
                  to="/messages"
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-3 rounded-[22px] bg-slate-50/80 p-3 transition hover:bg-slate-100 dark:bg-slate-950/45 dark:hover:bg-slate-900"
                >
                  <div className="relative">
                    <Avatar src={chat.participant.avatar} alt={chat.participant.name} />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {chat.participant.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {chat.roleLabel}
                    </p>
                  </div>
                  <Circle className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <MessageSquareMore className="h-4 w-4 text-sky-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick messages</p>
          </div>
          <div className="mt-4 space-y-3">
            {recentChats.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No chats yet.</p>
            ) : (
              recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  to="/messages"
                  onClick={() => onSelectChat(chat.id)}
                  className={`block rounded-[22px] border p-4 transition ${
                    selectedChatId === chat.id
                      ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : 'border-slate-200/70 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{chat.participant.name}</p>
                    <span className="text-[11px] opacity-70">{chat.lastActive}</span>
                  </div>
                  <p className="mt-2 truncate text-sm opacity-80">{chat.preview}</p>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Suggested people</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.suggestions.slice(0, 4).map((suggestion) => (
              <UserSuggestion
                key={suggestion.id}
                suggestion={suggestion}
                onToggle={onToggleSuggestion}
              />
            ))}
          </div>
          {data.suggestions.length > 4 ? (
            <Button variant="secondary" className="mt-4 w-full">
              View more
            </Button>
          ) : null}
        </Card>
      </div>
    </aside>
  );
}
