import { CalendarDays } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function EventsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Events</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Meetups, workshops, and live gatherings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Event listings synced from the backend event system.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {app.data.events.map((event) => (
          <Card key={event.id}>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">{event.title}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{event.description}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-700 dark:text-slate-300">{event.location}</p>
              <p className="text-slate-500 dark:text-slate-400">{event.startsAt}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                {event.status}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{event.attendeeCount} attending</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
