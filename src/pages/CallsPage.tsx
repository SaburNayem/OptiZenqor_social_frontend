import { PhoneCall } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function CallsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Calls</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Recent call activity</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Call history and live session state from the realtime backend.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {app.data.calls.map((call) => (
          <Card key={call.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{call.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{call.type}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {call.state}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{call.time}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
