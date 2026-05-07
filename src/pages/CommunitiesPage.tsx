import { Users } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { canCreateCommunity } from '../lib/profileCapabilities';
import { createCommunity as createCommunityApi } from '../lib/api';

export function CommunitiesPage() {
  const { app } = useAppOutlet();
  const viewer = app.session?.user ?? null;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateCommunity() {
    if (!app.session?.accessToken || !name.trim() || !description.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await createCommunityApi(
        {
          name: name.trim(),
          description: description.trim(),
          category: category.trim() || undefined,
        },
        app.session.accessToken,
      );
      setOpen(false);
      setName('');
      setDescription('');
      setCategory('');
      await app.refresh({ silent: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Communities</p>
        </div>
        {canCreateCommunity(viewer) ? (
          <Button onClick={() => setOpen(true)}>Create community</Button>
        ) : null}
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Groups and communities</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse community spaces and membership-driven activity.</p>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create community"
        description="Anyone with an account can create a community."
      >
        <div className="grid gap-4">
          <Input label="Community name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Category" value={category} onChange={(event) => setCategory(event.target.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-500/20"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreateCommunity()} disabled={submitting || !name.trim() || !description.trim()}>
            {submitting ? 'Creating...' : 'Create community'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
