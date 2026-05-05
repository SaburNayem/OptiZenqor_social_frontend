import { BriefcaseBusiness, Flame, Radar, Waves } from 'lucide-react';
import { SocialAppData } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { UserSuggestion } from './UserSuggestion';

interface RightSidebarProps {
  data: SocialAppData;
  onToggleSuggestion: (id: string) => void;
}

export function RightSidebar({ data, onToggleSuggestion }: RightSidebarProps) {
  return (
    <aside className="hidden 2xl:block">
      <div className="sticky top-24 space-y-4">
        <Card>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Trending now</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.trends.map((trend) => (
              <div key={trend.id} className="rounded-[22px] bg-slate-50/80 p-4 dark:bg-slate-950/45">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {trend.category}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{trend.topic}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trend.detail}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{trend.volume}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-sky-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">People to follow</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.suggestions.map((suggestion) => (
              <UserSuggestion
                key={suggestion.id}
                suggestion={suggestion}
                onToggle={onToggleSuggestion}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Opportunity lane</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.jobs.map((job) => (
              <div key={job.id} className="rounded-[22px] border border-slate-200/70 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {job.company} · {job.location}
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{job.salary}</p>
              </div>
            ))}
            <Button variant="secondary" className="w-full">
              View roles
            </Button>
          </div>
        </Card>

        <Card className="bg-[linear-gradient(135deg,rgba(14,165,233,0.1),rgba(240,249,255,0.8))] dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(15,23,42,0.9))]">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-sky-500" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Community pulse</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.communities.map((community) => (
              <div key={community.id} className="rounded-[22px] bg-white/70 p-4 dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{community.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{community.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  );
}
