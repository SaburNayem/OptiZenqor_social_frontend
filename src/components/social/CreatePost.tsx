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
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3">
        <Avatar
          src={viewer?.avatar ?? 'https://ui-avatars.com/api/?name=Guest&background=334155&color=ffffff'}
          alt={viewer?.name ?? 'Guest'}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Share something worth noticing
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Draft a text note, attach a premium image, or post a short video update.
              </p>
            </div>
            <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              Creator studio
            </div>
          </div>

          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={4}
            placeholder={viewer ? 'What idea, launch, or insight should your network see today?' : 'Sign in to publish posts and join the conversation.'}
            disabled={!viewer}
            className="w-full rounded-[24px] border border-white/70 bg-white/70 p-4 text-sm text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:ring-sky-500/20"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
            <Button onClick={() => void handleSubmit()} disabled={!viewer || !value.trim() || isSubmitting}>
              Publish post
            </Button>
          </div>

          {status ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{status}</p> : null}
        </div>
      </div>
    </Card>
  );
}
