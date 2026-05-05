import { Plus } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { StoryView } from '../../types';
import { cn } from '../../lib/utils';

interface StoryCardProps {
  story: StoryView;
  isSelf?: boolean;
}

export function StoryCard({ story, isSelf = false }: StoryCardProps) {
  return (
    <div
      className={cn(
        'group relative flex h-44 min-w-[168px] flex-col justify-between overflow-hidden rounded-[26px] p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]',
        `bg-gradient-to-br ${story.accent}`,
      )}
    >
      {story.media ? (
        <img
          src={story.media}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-300 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.7))]" />
      <div className="relative flex items-center justify-between">
        <Avatar src={story.user.avatar} alt={story.user.name} size="md" ring />
        {isSelf ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Plus className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="relative">
        <p className="text-sm font-semibold">{story.title}</p>
        <p className="mt-1 text-xs text-white/80">{story.subtitle}</p>
      </div>
    </div>
  );
}
