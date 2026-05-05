import { Radio } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function LiveStreamsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-rose-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Live streams</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Broadcast and stream surfaces</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Ongoing and scheduled live sessions from the realtime streaming backend.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {app.data.liveStreams.map((stream) => (
          <Card key={stream.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{stream.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stream.hostName}</p>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                {stream.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{stream.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{stream.category}</span>
              <span className="font-semibold text-slate-950 dark:text-white">{stream.viewerCount} viewers</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
