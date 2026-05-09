import { MessageCircle, Music4, Play, Share2, Heart } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function ReelsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Reels</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Short videos from your network.</p>
      </section>

      {app.data.reels.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">No reels yet.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Reels will appear here when the backend returns video content.
          </p>
        </Card>
      ) : (
        <section className="grid gap-5 md:grid-cols-2">
          {app.data.reels.map((reel) => (
            <Card key={reel.id} className="overflow-hidden p-0">
              <div className="relative">
                {reel.thumbnail ? (
                  <img src={reel.thumbnail} alt={reel.caption} className="h-[420px] w-full object-cover" />
                ) : (
                  <div className="flex h-[420px] w-full items-end bg-[linear-gradient(160deg,#0f172a,#0ea5e9,#22c55e)] p-5">
                    <p className="line-clamp-5 text-lg font-semibold text-white">{reel.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{reel.user.name}</p>
                    <p className="truncate text-xs text-white/75">@{reel.user.username}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{reel.caption}</p>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Music4 className="h-4 w-4" />
                  <span>{reel.audioName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {reel.likes}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {reel.comments}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    {reel.shares}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
