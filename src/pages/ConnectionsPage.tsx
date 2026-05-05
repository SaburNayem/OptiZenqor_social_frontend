import { Users2 } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ConnectionsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-sky-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Connections</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
          Relationships that move your work forward
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Follow mentors, teammates, and trusted collaborators across the OptiZenqor network.
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {app.data.connections.map((connection) => (
          <Card key={connection.id}>
            <div className="flex items-center gap-3">
              <Avatar src={connection.user.avatar} alt={connection.user.name} size="lg" />
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">
                  {connection.user.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {connection.user.role} · {connection.relationship}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{connection.note}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {connection.sharedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Button size="sm">Message</Button>
              <Button variant="secondary" size="sm">
                View profile
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
