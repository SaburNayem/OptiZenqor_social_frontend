import {
  BadgeCheck,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
} from 'lucide-react';
import { FeedPostView } from '../types';

interface PostCardProps {
  post: FeedPostView;
}

const networkStyles = {
  x: 'bg-slate-900 text-white',
  instagram: 'bg-[linear-gradient(135deg,#ff6a88,#ff8c42,#ffd166)] text-white',
  facebook: 'bg-[#1877f2] text-white',
  linkedin: 'bg-[#0a66c2] text-white',
};

const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className="panel-surface overflow-hidden">
      <div className="mb-5 flex items-start gap-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="h-12 w-12 rounded-2xl object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{post.user.name}</h3>
            {post.user.verified ? (
              <BadgeCheck className="h-4 w-4 fill-sky-500 text-sky-500" />
            ) : null}
            <span className="text-sm text-slate-500">@{post.user.username}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${networkStyles[post.network]}`}
            >
              {post.network}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {post.user.role} • {post.createdAt}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {post.headline}
        </p>
        <p className="mt-3 text-[15px] leading-7 text-slate-700">{post.content}</p>
      </div>

      {post.image ? (
        <img
          src={post.image}
          alt={post.headline}
          className="mb-4 h-[320px] w-full rounded-[28px] object-cover"
        />
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
          >
            #{tag.replace(/^#/, '')}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Heart size={18} />
          <span>{post.likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat2 size={18} />
          <span>{post.shares}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={18} />
          <span>{post.views}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
