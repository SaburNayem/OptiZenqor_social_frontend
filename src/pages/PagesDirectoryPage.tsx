import { PanelsTopLeft } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function PagesDirectoryPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <PanelsTopLeft className="h-5 w-5 text-cyan-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Pages</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Public pages directory</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Brand, creator, and organization pages from the live backend.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {app.data.pages.map((page) => (
          <Card key={page.id}>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">{page.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{page.category}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{page.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{page.followers} followers</span>
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                {page.actionLabel}
              </span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
