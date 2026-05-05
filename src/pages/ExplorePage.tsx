import { Compass, Sparkles, TrendingUp } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { UserSuggestion } from '../components/social/UserSuggestion';

export function ExplorePage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <Card className="bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92),rgba(8,47,73,0.88))] text-white">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-100">Explore</p>
        </div>
        <h1 className="mt-4 text-4xl font-semibold">See what your network is leaning toward next.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-50/80">
          Dive into trending topics, people worth following, and premium visual clusters curated to feel more like a real product than a placeholder directory.
        </p>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {app.data.explore.map((cluster) => (
          <Card key={cluster.id} className="overflow-hidden p-0">
            <img src={cluster.image} alt={cluster.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{cluster.stat}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{cluster.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{cluster.description}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Trending topics</p>
          </div>
          <div className="mt-4 space-y-4">
            {app.data.trends.map((trend) => (
              <div key={trend.id} className="rounded-[24px] border border-slate-200/70 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{trend.topic}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {trend.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{trend.detail}</p>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{trend.volume}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-500" />
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Suggested people</p>
          </div>
          <div className="mt-4 space-y-3">
            {app.data.suggestions.map((suggestion) => (
              <UserSuggestion
                key={suggestion.id}
                suggestion={suggestion}
                onToggle={app.toggleFollowSuggestion}
              />
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
