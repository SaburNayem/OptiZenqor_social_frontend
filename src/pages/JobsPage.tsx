import { BriefcaseBusiness } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function JobsPage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-sky-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Jobs</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Career and hiring hub</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Jobs and networking roles connected to the same backend as the mobile app.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {app.data.jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{job.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {job.company} • {job.location}
                </p>
              </div>
              {job.featured ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-950 dark:text-white">{job.salary}</span>
              <span className="text-slate-500 dark:text-slate-400">{job.postedTime}</span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
