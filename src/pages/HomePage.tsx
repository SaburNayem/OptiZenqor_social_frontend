import { Activity, BriefcaseBusiness, PlayCircle, Users } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';
import { StoryCard } from '../components/social/StoryCard';
import { CreatePost } from '../components/social/CreatePost';
import { PostCard } from '../components/social/PostCard';

export function HomePage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      {app.loadError ? (
        <Card className="border-sky-200 bg-sky-50/80 dark:border-sky-900/50 dark:bg-sky-950/20">
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Demo mode active</p>
          <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-200/80">{app.loadError}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(37,99,235,0.95),rgba(56,189,248,0.82))] text-white">
          <p className="text-xs uppercase tracking-[0.34em] text-sky-100">Today on OptiZenqor</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">
            A social platform for thoughtful work, standout stories, and real momentum.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/82">
            Your feed blends creator energy, founder clarity, and community depth across posts, discovery, messages, and premium profile spaces.
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {[
            { label: 'Live posts', value: `${app.data.posts.length}`, Icon: Activity },
            { label: 'Stories', value: `${app.data.stories.length}`, Icon: PlayCircle },
            { label: 'Communities', value: `${app.data.communities.length}`, Icon: Users },
            { label: 'Opportunities', value: `${app.data.jobs.length}`, Icon: BriefcaseBusiness },
          ].map(({ label, value, Icon }) => (
            <Card key={label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {app.data.stories.map((story, index) => (
          <StoryCard key={story.id} story={story} isSelf={index === 0} />
        ))}
      </div>

      <CreatePost viewer={app.session?.user ?? null} onSubmit={app.createPost} />

      <section className="space-y-5">
        {app.isLoading ? (
          <Card>
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-72 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-44 animate-pulse rounded-[28px] bg-slate-100 dark:bg-slate-900" />
            </div>
          </Card>
        ) : (
          app.data.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              viewer={app.session?.user ?? null}
              onLike={app.toggleLike}
              onSave={app.toggleSave}
              onComment={app.addComment}
            />
          ))
        )}
      </section>
    </div>
  );
}
