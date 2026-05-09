import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { createEvent as createEventApi } from '../lib/api';

export function EventsPage() {
  const { app } = useAppOutlet();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eventActionId, setEventActionId] = useState<string | null>(null);

  async function handleCreateEvent() {
    if (!app.session?.accessToken || !title.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await createEventApi(
        {
          title: title.trim(),
          location: location.trim() || undefined,
          date: date.trim() || undefined,
        },
        app.session.accessToken,
      );
      setOpen(false);
      setTitle('');
      setLocation('');
      setDate('');
      await app.refresh({ silent: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRsvp(eventId: string) {
    setEventActionId(`rsvp:${eventId}`);
    try {
      await app.toggleEventRsvp(eventId);
    } finally {
      setEventActionId(null);
    }
  }

  async function handleSave(eventId: string) {
    setEventActionId(`save:${eventId}`);
    try {
      await app.toggleEventSave(eventId);
    } finally {
      setEventActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
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
        {app.session?.accessToken ? <Button onClick={() => setOpen(true)}>Create event</Button> : null}
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
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant={event.rsvped ? 'secondary' : 'primary'}
                disabled={!app.session?.accessToken || eventActionId === `rsvp:${event.id}`}
                onClick={() => void handleRsvp(event.id)}
              >
                {eventActionId === `rsvp:${event.id}`
                  ? 'Updating...'
                  : event.rsvped
                    ? 'RSVPed'
                    : app.session?.accessToken
                      ? 'RSVP'
                      : 'Login to RSVP'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!app.session?.accessToken || eventActionId === `save:${event.id}`}
                onClick={() => void handleSave(event.id)}
              >
                {eventActionId === `save:${event.id}`
                  ? 'Saving...'
                  : event.saved
                    ? 'Saved'
                    : app.session?.accessToken
                      ? 'Save'
                      : 'Login to save'}
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create event"
        description="Create a live event using the backend event service."
      >
        <div className="grid gap-4">
          <Input label="Event title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Start date" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreateEvent()} disabled={submitting || !title.trim()}>
            {submitting ? 'Creating...' : 'Create event'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
