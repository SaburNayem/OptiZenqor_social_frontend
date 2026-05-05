import { BriefcaseBusiness, MapPin, Sparkles } from 'lucide-react';
import { JobView } from '../types';

interface JobsPanelProps {
  jobs: JobView[];
}

const JobsPanel = ({ jobs }: JobsPanelProps) => {
  return (
    <section className="panel-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Jobs API</p>
          <h2 className="section-title mt-1">LinkedIn-style career cards</h2>
        </div>
        <BriefcaseBusiness className="h-5 w-5 text-slate-400" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <article key={job.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                </div>
                {job.featured ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span>{job.type}</span>
                <span>{job.salary}</span>
                <span>{job.postedTime}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {job.saved ? <span>Saved</span> : null}
                {job.applied ? <span>Applied</span> : null}
                {!job.saved && !job.applied ? <span>Open to apply</span> : null}
                <Sparkles className="h-4 w-4" />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No jobs were returned by `/jobs-networking`.
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsPanel;
