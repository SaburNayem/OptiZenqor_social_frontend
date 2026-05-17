import { Circle, Phone, Search, SendHorizonal, Video, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChatList } from '../components/social/ChatList';
import { MessageBubble } from '../components/social/MessageBubble';
import { Avatar } from '../components/ui/Avatar';
import { InlineNotice } from '../components/ui/InlineNotice';

export function MessagesPage() {
  const { app } = useAppOutlet();
  const [draft, setDraft] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );

  const filteredChats = useMemo(() => {
    const query = chatQuery.trim().toLowerCase();
    if (!query) {
      return app.data.chats;
    }

    return app.data.chats.filter((chat) =>
      [chat.participant.name, chat.participant.username, chat.roleLabel, chat.preview].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  }, [app.data.chats, chatQuery]);

  const selectedChat = useMemo(
    () => filteredChats.find((chat) => chat.id === app.selectedChatId) ?? filteredChats[0],
    [filteredChats, app.selectedChatId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Messages</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          A cleaner web messenger with a dedicated thread list and focused conversation panel.
        </p>
      </div>

      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}

      <section className="grid min-h-[720px] gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit xl:h-full">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-4 dark:border-slate-800">
            <div>
              <p className="text-lg font-semibold text-slate-950 dark:text-white">Inbox</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredChats.length} active conversations
              </p>
            </div>
            {isSearchOpen ? (
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={chatQuery}
                  onChange={(event) => setChatQuery(event.target.value)}
                  placeholder="Search messages"
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setChatQuery('');
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-4">
            <ChatList
              chats={filteredChats}
              selectedChatId={app.selectedChatId}
              onSelect={app.setSelectedChatId}
            />
            {filteredChats.length === 0 ? (
              <div className="mt-3 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                No conversations match this search yet.
              </div>
            ) : null}
          </div>
        </Card>

        {selectedChat ? (
          <Card className="flex min-h-[620px] flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative">
                  <Avatar
                    src={selectedChat.participant.avatar}
                    alt={selectedChat.participant.name}
                    size="lg"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-950 dark:text-white">
                    {selectedChat.participant.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Circle className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                    <span>Active now</span>
                    <span>&middot;</span>
                    <span>{selectedChat.roleLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 bg-[linear-gradient(180deg,rgba(248,250,252,0.72),rgba(255,255,255,0.98))] px-6 py-6 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.64),rgba(15,23,42,0.96))]">
              {selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    viewer={app.session?.user ?? app.data.profile.user}
                  />
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-5 py-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="text-base font-semibold text-slate-950 dark:text-white">
                      Start the conversation
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Say hello first. New chats will keep a starter note here so the thread never feels empty.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/70 px-6 py-5 dark:border-slate-800">
              <div className="flex items-center gap-3 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${selectedChat.participant.name}`}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <Button
                  onClick={async () => {
                    try {
                      await app.sendMessage(selectedChat.id, draft);
                      setDraft('');
                      setFeedback({ tone: 'success', message: 'Message sent.' });
                    } catch (error) {
                      setFeedback({
                        tone: 'error',
                        message:
                          error instanceof Error ? error.message : 'Unable to send this message right now.',
                      });
                    }
                  }}
                  disabled={!draft.trim()}
                >
                  <SendHorizonal className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex min-h-[620px] items-center justify-center">
            <div className="max-w-sm text-center">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">
                Select a conversation
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Pick someone from the left list or the active people rail to open the thread.
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
