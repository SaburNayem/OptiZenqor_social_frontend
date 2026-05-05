import { SendHorizonal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChatList } from '../components/social/ChatList';
import { MessageBubble } from '../components/social/MessageBubble';
import { Avatar } from '../components/ui/Avatar';

export function MessagesPage() {
  const { app } = useAppOutlet();
  const [draft, setDraft] = useState('');

  const selectedChat = useMemo(
    () => app.data.chats.find((chat) => chat.id === app.selectedChatId) ?? app.data.chats[0],
    [app.data.chats, app.selectedChatId],
  );

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Messages</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Private conversations for collaboration, community check-ins, and launch planning.
        </p>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <ChatList chats={app.data.chats} selectedChatId={app.selectedChatId} onSelect={app.setSelectedChatId} />
        </Card>

        {selectedChat ? (
          <Card className="flex min-h-[620px] flex-col">
            <div className="flex items-center gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800">
              <Avatar src={selectedChat.participant.avatar} alt={selectedChat.participant.name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">
                  {selectedChat.participant.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedChat.roleLabel} · {selectedChat.online ? 'Online now' : selectedChat.lastActive}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 py-6">
              {selectedChat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  viewer={app.session?.user ?? app.data.profile.user}
                />
              ))}
            </div>

            <div className="mt-auto flex items-center gap-3 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <Button
                onClick={() => {
                  if (!selectedChat) {
                    return;
                  }
                  app.sendMessage(selectedChat.id, draft);
                  setDraft('');
                }}
                disabled={!draft.trim() || !app.session}
              >
                <SendHorizonal className="h-4 w-4" />
                Send
              </Button>
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
