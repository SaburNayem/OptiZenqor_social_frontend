import { PanelsTopLeft } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { createPage as createPageApi } from '../lib/api';
import { canCreatePage } from '../lib/profileCapabilities';

export function PagesDirectoryPage() {
  const { app } = useAppOutlet();
  const viewer = app.session?.user ?? null;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [followingId, setFollowingId] = useState<string | null>(null);

  async function handleCreatePage() {
    if (!app.session?.accessToken || !viewer?.id || !name.trim() || !about.trim() || !category.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await createPageApi(
        {
          ownerId: viewer.id,
          name: name.trim(),
          about: about.trim(),
          category: category.trim(),
        },
        app.session.accessToken,
      );
      setOpen(false);
      setName('');
      setAbout('');
      setCategory('');
      await app.refresh({ silent: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleFollow(pageId: string) {
    if (!app.session?.accessToken) {
      return;
    }
    setFollowingId(pageId);
    try {
      await app.togglePageFollow(pageId);
    } finally {
      setFollowingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <PanelsTopLeft className="h-5 w-5 text-cyan-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Pages</p>
        </div>
        {canCreatePage(viewer) ? <Button onClick={() => setOpen(true)}>Create page</Button> : null}
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Public pages directory</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Brand, creator, and organization pages from the live backend.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {app.data.pages.map((page) => (
          <Card key={page.id}>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">{page.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{page.category}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{page.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{page.followers} followers</span>
              <Button
                size="sm"
                variant={page.followed ? 'secondary' : 'primary'}
                disabled={!app.session?.accessToken || followingId === page.id}
                onClick={() => void handleToggleFollow(page.id)}
              >
                {followingId === page.id
                  ? 'Updating...'
                  : page.followed
                    ? 'Following'
                    : app.session?.accessToken
                      ? page.actionLabel
                      : 'Login to follow'}
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create page"
        description="Creator profiles can create pages."
      >
        <div className="grid gap-4">
          <Input label="Page name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Category" value={category} onChange={(event) => setCategory(event.target.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">About</span>
            <textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-500/20"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreatePage()} disabled={submitting || !name.trim() || !about.trim() || !category.trim()}>
            {submitting ? 'Creating...' : 'Create page'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
