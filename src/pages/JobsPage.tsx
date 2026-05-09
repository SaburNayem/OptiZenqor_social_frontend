import { BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { InlineNotice } from '../components/ui/InlineNotice';
import { Modal } from '../components/ui/Modal';
import { createJob as createJobApi } from '../lib/api';
import { canCreateJob } from '../lib/profileCapabilities';

export function JobsPage() {
  const { app } = useAppOutlet();
  const viewer = app.session?.user ?? null;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState('fullTime');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );

  async function handleCreateJob() {
    if (!app.session?.accessToken || !title.trim() || !company.trim() || !location.trim() || !salary.trim()) {
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await createJobApi(
        {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          salary: salary.trim(),
          type,
          experienceLevel,
        },
        app.session.accessToken,
      );
      setOpen(false);
      setTitle('');
      setCompany('');
      setLocation('');
      setSalary('');
      await app.refresh({ silent: true });
      setFeedback({ tone: 'success', message: 'Job posted and refreshed from the backend.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to create this job right now.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-5 w-5 text-sky-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Jobs</p>
        </div>
        {canCreateJob(viewer) ? <Button onClick={() => setOpen(true)}>Create job</Button> : null}
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Career and hiring hub</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Jobs and networking roles connected to the same backend as the mobile app.
        </p>
      </div>

      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {app.data.jobs.length === 0 ? (
          <Card className="md:col-span-2">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">No jobs yet.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Open roles will appear here when the backend returns them.
            </p>
          </Card>
        ) : (
          app.data.jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {job.company} · {job.location}
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
          ))
        )}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create job"
        description="Business profiles can create jobs."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Job title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Company" value={company} onChange={(event) => setCompany(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Salary" value={salary} onChange={(event) => setSalary(event.target.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Job type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="fullTime">Full-time</option>
              <option value="partTime">Part-time</option>
              <option value="remote">Remote</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Experience level</span>
            <select
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreateJob()}
            disabled={submitting || !title.trim() || !company.trim() || !location.trim() || !salary.trim()}
          >
            {submitting ? 'Creating...' : 'Create job'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
