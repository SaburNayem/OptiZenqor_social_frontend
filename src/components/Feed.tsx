import { CommunityView, FeedPostView, JobView, ReelView, StoryView } from '../types';
import CommunitiesPanel from './CommunitiesPanel';
import Composer from './Composer';
import JobsPanel from './JobsPanel';
import PostCard from './PostCard';
import ReelsStrip from './ReelsStrip';
import StoriesRow from './StoriesRow';

interface FeedProps {
  stories: StoryView[];
  posts: FeedPostView[];
  reels: ReelView[];
  jobs: JobView[];
  communities: CommunityView[];
  composerValue: string;
  onComposerChange: (value: string) => void;
  onCreatePost: () => void;
  canCreatePost: boolean;
  isCreatingPost: boolean;
  createPostError: string | null;
  onJoinCommunity: (id: string) => void;
  canJoinCommunity: boolean;
  joiningCommunityId: string | null;
}

const Feed = ({
  stories,
  posts,
  reels,
  jobs,
  communities,
  composerValue,
  onComposerChange,
  onCreatePost,
  canCreatePost,
  isCreatingPost,
  createPostError,
  onJoinCommunity,
  canJoinCommunity,
  joiningCommunityId,
}: FeedProps) => {
  return (
    <main className="space-y-6">
      <StoriesRow stories={stories} />
      <Composer
        value={composerValue}
        onChange={onComposerChange}
        onSubmit={onCreatePost}
        disabled={!canCreatePost || isCreatingPost || !composerValue.trim()}
        isAuthenticated={canCreatePost}
        isSubmitting={isCreatingPost}
        error={createPostError}
      />
      <section className="panel-surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Unified Feed</p>
            <h2 className="section-title mt-1">Responsive social timeline powered by live APIs</h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {posts.length} live posts
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <section className="panel-surface text-sm text-slate-500">
            No feed items were returned by `/feed`.
          </section>
        )}
      </div>

      <ReelsStrip reels={reels} />
      <JobsPanel jobs={jobs} />
      <CommunitiesPanel
        communities={communities}
        canJoin={canJoinCommunity}
        joiningId={joiningCommunityId}
        onJoin={onJoinCommunity}
      />
    </main>
  );
};

export default Feed;
