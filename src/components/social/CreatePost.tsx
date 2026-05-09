import { ImageIcon, Sparkles, Video } from 'lucide-react';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { ViewerUser } from '../../types';

interface CreatePostProps {
  viewer: ViewerUser | null;
  onSubmit: (input: {
    content: string;
    mediaType: 'text' | 'image' | 'video';
    files?: File[];
  }) => Promise<{ ok: boolean; message: string }>;
}

export function CreatePost({ viewer, onSubmit }: CreatePostProps) {
  const [value, setValue] = useState('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>('text');
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const acceptedTypes = useMemo(
    () => (mediaType === 'video' ? 'video/*' : mediaType === 'image' ? 'image/*' : ''),
    [mediaType],
  );

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await onSubmit({ content: value, mediaType, files });
    setStatus(result.message);
    setIsSubmitting(false);
    if (result.ok) {
      setValue('');
      setMediaType('text');
      setFiles([]);
    }
  }

  function handleMediaTypeChange(nextType: 'text' | 'image' | 'video') {
    setMediaType(nextType);
    setStatus(null);
    if (nextType === 'text') {
      setFiles([]);
      return;
    }
    window.setTimeout(() => fileInputRef.current?.click(), 0);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles(selected);
    event.target.value = '';
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
                onClick={() => handleMediaTypeChange('text')}
              >
                <Sparkles className="h-4 w-4" />
                Text
              </Button>
              <Button
                size="sm"
                variant={mediaType === 'image' ? 'primary' : 'secondary'}
                onClick={() => handleMediaTypeChange('image')}
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </Button>
              <Button
                size="sm"
                variant={mediaType === 'video' ? 'primary' : 'secondary'}
                onClick={() => handleMediaTypeChange('video')}
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
              {mediaType !== 'text' ? (
                <Button size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                  {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Choose files'}
                </Button>
              ) : null}
            </div>
            <Button
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={!value.trim() || isSubmitting || (mediaType !== 'text' && files.length === 0)}
            >
              Publish post
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple={mediaType === 'image'}
            onChange={handleFileChange}
            className="hidden"
          />

          {files.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => (
                <span
                  key={`${file.name}-${file.size}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : null}

          {status ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{status}</p> : null}
        </div>
      </div>
    </Card>
  );
}
