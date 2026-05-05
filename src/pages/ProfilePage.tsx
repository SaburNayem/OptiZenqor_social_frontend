import { Globe2, MapPin, PenSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/social/PostCard';

export function ProfilePage() {
  const { app } = useAppOutlet();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(app.data.profile.user.name);
  const [headline, setHeadline] = useState(app.data.profile.user.headline ?? app.data.profile.headline);
  const [location, setLocation] = useState(app.data.profile.location);
  const [website, setWebsite] = useState(app.data.profile.website);
  const [about, setAbout] = useState(app.data.profile.about);

  const viewerPosts = app.data.posts.filter((post) => post.user.id === app.data.profile.user.id);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <img
          src={app.data.profile.coverImage}
          alt={app.data.profile.user.name}
          className="h-52 w-full object-cover md:h-72"
        />
        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={app.data.profile.user.avatar} alt={app.data.profile.user.name} size="xl" ring />
              <div className="pb-2">
                <p className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {app.data.profile.user.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  @{app.data.profile.user.username}
                </p>
              </div>
            </div>
            <Button onClick={() => setOpen(true)}>
              <PenSquare className="h-4 w-4" />
              Edit profile
            </Button>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            {app.data.profile.headline}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {app.data.profile.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              {app.data.profile.website}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {app.data.profile.joinedLabel}
            </span>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">About</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{app.data.profile.about}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Profile metrics</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {app.data.profile.metrics.map((metric) => (
                <div key={metric.label} className="rounded-[24px] bg-slate-50/80 p-4 dark:bg-slate-950/45">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Highlights</h2>
            <div className="mt-4 grid gap-3">
              {app.data.profile.highlights.map((highlight) => (
                <div key={highlight.id} className="rounded-[24px] border border-slate-200/70 p-4 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{highlight.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{highlight.value}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{highlight.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {viewerPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              viewer={app.session?.user ?? null}
              onLike={app.toggleLike}
              onSave={app.toggleSave}
              onComment={app.addComment}
            />
          ))}
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Update your public headline, intro, and profile details."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Display name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Headline" value={headline} onChange={(event) => setHeadline(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Website" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">About</span>
          <textarea
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-500/20"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              app.updateProfile({
                name,
                headline,
                location,
                website,
                about,
              });
              setOpen(false);
            }}
          >
            Save changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
