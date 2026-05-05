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
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Static preview mode</p>
          <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-200/80">{app.loadError}</p>
        </Card>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {app.data.stories.map((story, index) => (
          <StoryCard key={story.id} story={story} isSelf={index === 0} />
        ))}
      </div>

      <CreatePost viewer={app.session?.user ?? app.data.profile.user} onSubmit={app.createPost} />

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
              viewer={app.session?.user ?? app.data.profile.user}
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
