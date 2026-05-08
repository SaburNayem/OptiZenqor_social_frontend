import { ImageIcon, Sparkles, Video } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ViewerUser } from '../../types';

interface CreatePostProps {
  viewer: ViewerUser | null;
  onSubmit: (input: { content: string; mediaType: 'text' | 'image' | 'video' }) => Promise<{ ok: boolean; message: string }>;
}

export function CreatePost({ viewer, onSubmit }: CreatePostProps) {
  const [value, setValue] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await onSubmit({ content: value, mediaType });
    setStatus(result.message);
    setIsSubmitting(false);
    if (result.ok) {
      setValue('');
      setMediaType('text');
    }
  }

  return (
    <Card className="overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={viewer?.avatar ?? ''}
          alt={viewer?.name ?? 'Member'}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Create a post</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share an update.</p>
            </div>
            <div className="rounded-full bg-[#D6EEEB] px-3 py-1 text-xs font-semibold text-[#0F766E] dark:bg-[#169388]/15 dark:text-[#A9D9D4]">
              New post
            </div>
          </div>

          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={3}
            placeholder="What do you want to share?"
            className="w-full rounded-[20px] border border-white/70 bg-white/70 p-3 text-sm text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-[#A9D9D4] focus:ring-4 focus:ring-[#D6EEEB] disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:ring-[#169388]/20"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={mediaType === 'text' ? 'primary' : 'secondary'}
                onClick={() => setMediaType('text')}
              >
                <Sparkles className="h-4 w-4" />
                Text
              </Button>
              <Button
                size="sm"
                variant={mediaType === 'image' ? 'primary' : 'secondary'}
                onClick={() => setMediaType('image')}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </Button>
              <Button
                size="sm"
                variant={mediaType === 'video' ? 'primary' : 'secondary'}
                onClick={() => setMediaType('video')}
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
            <Button size="sm" onClick={() => void handleSubmit()} disabled={!value.trim() || isSubmitting}>
              Publish post
            </Button>
          </div>

          {status ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{status}</p> : null}
        </div>
      </div>
    </Card>
  );
}
