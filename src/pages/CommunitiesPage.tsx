import { Users } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function CommunitiesPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Communities</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Groups and communities</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Browse community spaces, tags, and membership-driven activity.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {app.data.communities.map((community) => (
          <Card key={community.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{community.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {community.category} • {community.location}
                </p>
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {community.privacy}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{community.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {community.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{community.memberCount} members</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
