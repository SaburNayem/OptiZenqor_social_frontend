import { Bookmark, Heart, MessageCircle, Repeat2, Send } from 'lucide-react';
import { useState } from 'react';
import { SocialPost, ViewerUser } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { formatCompactNumber } from '../../lib/utils';

interface PostCardProps {
  post: SocialPost;
  viewer: ViewerUser | null;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, message: string) => void;
}

export function PostCard({ post, viewer, onLike, onSave, onComment }: PostCardProps) {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.user.avatar} alt={post.user.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white">{post.user.name}</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {post.network}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              @{post.user.username} · {post.createdAt}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {post.visibility}
        </Button>
      </div>

      <div>
        {post.headline && post.headline.trim() && post.headline.trim().toLowerCase() !== 'post' ? (
          <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            {post.headline}
          </p>
        ) : null}
        <p className={`${post.headline && post.headline.trim() && post.headline.trim().toLowerCase() !== 'post' ? 'mt-2' : ''} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          {post.content}
        </p>
        {post.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {post.media[0] ? (
        post.media[0].type === 'image' ? (
          <div className="overflow-hidden rounded-[24px]">
            <img src={post.media[0].url} alt={post.media[0].alt} className="h-[340px] w-full object-cover" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] bg-slate-950">
            <video
              controls
              poster={post.media[0].poster}
              className="h-[340px] w-full object-cover"
              preload="metadata"
            >
              <source src={post.media[0].url} type="video/mp4" />
            </video>
          </div>
        )
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/70 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>{formatCompactNumber(post.likes)} appreciations</span>
        <div className="flex items-center gap-4">
          <span>{formatCompactNumber(post.comments)} comments</span>
          <span>{formatCompactNumber(post.shares)} shares</span>
          <span>{formatCompactNumber(post.views)} views</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant={post.liked ? 'primary' : 'secondary'} size="sm" onClick={() => onLike(post.id)}>
          <Heart className="h-4 w-4" />
          Like
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setShowComments((current) => !current)}>
          <MessageCircle className="h-4 w-4" />
          Comment
        </Button>
        <Button variant="secondary" size="sm">
          <Repeat2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant={post.saved ? 'primary' : 'secondary'} size="sm" onClick={() => onSave(post.id)}>
          <Bookmark className="h-4 w-4" />
          Save
        </Button>
      </div>

      {showComments ? (
        <div className="space-y-4 rounded-[24px] bg-slate-50/70 p-4 dark:bg-slate-950/50">
          <div className="space-y-3">
            {post.commentsList.length > 0 ? (
              post.commentsList.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Avatar src={item.user.avatar} alt={item.user.name} size="sm" />
                  <div className="min-w-0 flex-1 rounded-3xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-slate-900">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.user.name}</p>
                      <span className="text-xs text-slate-400">{item.createdAt}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No comments yet. Start the conversation.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Avatar
              src={viewer?.avatar ?? 'https://ui-avatars.com/api/?name=Member&background=334155&color=ffffff'}
              alt={viewer?.name ?? 'Member'}
              size="sm"
            />
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[24px] border border-white/70 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a thoughtful reply..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white"
              />
              <Button
                size="sm"
                onClick={() => {
                  onComment(post.id, comment);
                  setComment('');
                }}
                disabled={!comment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
