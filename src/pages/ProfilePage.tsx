import {
  CalendarDays,
  Camera,
  Gift,
  Globe2,
  Grip,
  Grid3X3,
  MapPin,
  PenSquare,
  PlayCircle,
  Share2,
  Sparkles,
  Tag,
  UserRound,
  Vote,
  Wallet,
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { InlineNotice } from '../components/ui/InlineNotice';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/social/PostCard';

type ProfileTab = 'posts' | 'reels' | 'tagged';

export function ProfilePage() {
  const { app } = useAppOutlet();
  const [open, setOpen] = useState(false);
  const [coverEditOpen, setCoverEditOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>('posts');
  const [avatarPreview, setAvatarPreview] = useState(app.data.profile.user.avatar);
  const [coverPreview, setCoverPreview] = useState(app.data.profile.coverImage);
  const [coverPosition, setCoverPosition] = useState(50);
  const [name, setName] = useState(app.data.profile.user.name);
  const [location, setLocation] = useState(app.data.profile.location);
  const [website, setWebsite] = useState(app.data.profile.website);
  const [about, setAbout] = useState(app.data.profile.about);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const isDraggingCoverRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartPositionRef = useRef(50);

  const viewerPosts = app.data.posts.filter((post) => post.user.id === app.data.profile.user.id);
  const viewerReels = app.data.reels.filter((reel) => reel.user.id === app.data.profile.user.id);
  const profileMetrics = app.data.profile.metrics;
  const bioText = app.data.profile.user.bio || app.data.profile.about;
  const postMetric = profileMetrics.find((metric) => metric.label.toLowerCase() === 'posts');
  const followerMetric = profileMetrics.find((metric) => metric.label.toLowerCase() === 'followers');
  const followingMetric = profileMetrics.find((metric) => metric.label.toLowerCase() === 'following');

  useEffect(() => {
    setAvatarPreview(app.data.profile.user.avatar);
    setCoverPreview(app.data.profile.coverImage);
    setName(app.data.profile.user.name);
    setLocation(app.data.profile.location);
    setWebsite(app.data.profile.website);
    setAbout(app.data.profile.about);
  }, [
    app.data.profile.about,
    app.data.profile.coverImage,
    app.data.profile.location,
    app.data.profile.user.avatar,
    app.data.profile.user.name,
    app.data.profile.website,
  ]);

  const utilityItems = [
    { label: 'Wallet', icon: Wallet, bgClassName: 'bg-[#E3F2FD]', iconClassName: 'text-[#1E88E5]' },
    { label: 'Events', icon: CalendarDays, bgClassName: 'bg-[#F3E5F5]', iconClassName: 'text-[#8E24AA]' },
    { label: 'Polls', icon: Vote, bgClassName: 'bg-[#E1F5FE]', iconClassName: 'text-[#039BE5]' },
    { label: 'Plans', icon: Sparkles, bgClassName: 'bg-[#FFF3E0]', iconClassName: 'text-[#FB8C00]' },
    { label: 'Invite', icon: Gift, bgClassName: 'bg-[#E8F5E9]', iconClassName: 'text-[#43A047]' },
  ];

  function handleImagePick(
    event: ChangeEvent<HTMLInputElement>,
    onPreview: (value: string) => void,
    onFile: (file: File) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onFile(file);
    onPreview(URL.createObjectURL(file));
  }

  function startCoverDrag(clientY: number) {
    isDraggingCoverRef.current = true;
    dragStartYRef.current = clientY;
    dragStartPositionRef.current = coverPosition;
  }

  function updateCoverDrag(clientY: number) {
    if (!isDraggingCoverRef.current) {
      return;
    }
    const delta = clientY - dragStartYRef.current;
    const next = Math.max(0, Math.min(100, dragStartPositionRef.current + delta / 3));
    setCoverPosition(next);
  }

  function stopCoverDrag() {
    isDraggingCoverRef.current = false;
  }

  async function handleShareProfile() {
    const shareText = app.data.profile.user.username
      ? `Take a look at @${app.data.profile.user.username} on OptiZenqor Socity.`
      : 'Take a look at this OptiZenqor Socity profile.';

    try {
      if (navigator.share) {
        await navigator.share({
          title: app.data.profile.user.name || 'OptiZenqor profile',
          text: shareText,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
      setFeedback({ tone: 'success', message: 'Profile share text is ready.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to share this profile right now.',
      });
    }
  }

  function renderPostsFeed() {
    if (viewerPosts.length === 0) {
      return <EmptyState icon={Grid3X3} title="No posts yet" message="Posts from backend will appear here." />;
    }

    return (
      <div className="space-y-6">
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
    );
  }

  function renderReelsGrid() {
    if (viewerReels.length === 0) {
      return <EmptyState icon={PlayCircle} title="No reels yet" message="Reels from backend will appear here." />;
    }

    return (
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {viewerReels.map((reel) => (
          <MediaTile
            key={reel.id}
            imageUrl={reel.thumbnail}
            title={reel.caption}
            badge={reel.likes > 0 ? `${reel.likes}` : undefined}
            icon={<PlayCircle className="h-4 w-4" />}
          />
        ))}
      </div>
    );
  }

  function renderTaggedGrid() {
    return (
      <EmptyState
        icon={Tag}
        title="No tagged posts"
        message="Tagged posts from backend will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div
          className={`relative ${coverEditOpen ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPointerDown={(event) => {
            if (!coverEditOpen) {
              return;
            }
            startCoverDrag(event.clientY);
          }}
          onPointerMove={(event) => updateCoverDrag(event.clientY)}
          onPointerUp={stopCoverDrag}
          onPointerCancel={stopCoverDrag}
          onPointerLeave={stopCoverDrag}
        >
          <img
            src={coverPreview}
            alt={app.data.profile.user.name}
            className="h-44 w-full object-cover md:h-56"
            style={{ objectPosition: `center ${coverPosition}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />

          {coverEditOpen ? (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-950/72 px-4 py-3 text-white backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <Grip className="h-4 w-4" />
                <span>Drag cover to move</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>
                  <Camera className="h-4 w-4" />
                  Change photo
                </Button>
                <Button size="sm" onClick={() => setCoverEditOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute bottom-4 right-4">
              <Button size="sm" variant="secondary" onClick={() => setCoverEditOpen(true)}>
                <Camera className="h-4 w-4" />
                Edit cover
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 pb-6 pt-4 sm:px-6">
          {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} className="mb-4" /> : null}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              handleImagePick(event, setCoverPreview, setCoverFile);
              setCoverEditOpen(true);
            }}
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImagePick(event, setAvatarPreview, setAvatarFile)}
          />

          <div className="-mt-16 flex items-end gap-4">
            <div className="relative shrink-0">
              <img
                src={avatarPreview}
                alt={app.data.profile.user.name}
                className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg md:h-[108px] md:w-[108px]"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#26C6DA] text-white"
                aria-label="Change profile photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{app.data.profile.user.name}</h1>
                <span className="rounded-full bg-[#E0F7FA] px-2.5 py-1 text-xs font-bold text-[#00ACC1]">
                  {app.data.profile.user.role || 'Member'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{app.data.profile.user.username}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button className="min-h-12 flex-1 sm:flex-none" onClick={() => setOpen(true)}>
              <PenSquare className="h-4 w-4" />
              Edit profile
            </Button>
            <Button variant="secondary" className="min-h-12 px-4" onClick={() => void handleShareProfile()}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {bioText || 'Profile bio is not available yet.'}
            </p>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              {website ? (
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  <span>{website}</span>
                </div>
              ) : null}
              {location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl bg-slate-50/90 py-2 text-center dark:divide-slate-800 dark:bg-slate-900/60">
            <StatCell value={postMetric?.value ?? `${viewerPosts.length}`} label="Posts" />
            <StatCell value={followerMetric?.value ?? '0'} label="Followers" />
            <StatCell value={followingMetric?.value ?? '0'} label="Following" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-y-5 sm:grid-cols-6">
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} type="button" className="flex flex-col items-center gap-2 text-center">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bgClassName}`}>
                    <Icon className={`h-5 w-5 ${item.iconClassName}`} />
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex border-b border-slate-200 dark:border-slate-800">
            <ProfileTabButton
              icon={<Grid3X3 className="h-5 w-5" />}
              active={profileTab === 'posts'}
              onClick={() => setProfileTab('posts')}
            />
            <ProfileTabButton
              icon={<PlayCircle className="h-5 w-5" />}
              active={profileTab === 'reels'}
              onClick={() => setProfileTab('reels')}
            />
            <ProfileTabButton
              icon={<UserRound className="h-5 w-5" />}
              active={profileTab === 'tagged'}
              onClick={() => setProfileTab('tagged')}
            />
          </div>

          <div className="pt-4">
            {profileTab === 'posts' ? renderPostsFeed() : null}
            {profileTab === 'reels' ? renderReelsGrid() : null}
            {profileTab === 'tagged' ? renderTaggedGrid() : null}
          </div>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Update your public intro and profile details."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Display name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Website" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Bio</span>
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
            onClick={async () => {
              setIsSaving(true);
              const result = await app.updateProfile({
                name,
                location,
                website,
                about,
                avatarFile,
                coverFile,
              });
              setFeedback({ tone: result.ok ? 'success' : 'error', message: result.message });
              setIsSaving(false);
              if (result.ok) {
                setAvatarFile(null);
                setCoverFile(null);
                setOpen(false);
                setCoverEditOpen(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-2">
      <p className="text-lg font-bold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function ProfileTabButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center border-b-2 py-3 transition ${
        active
          ? 'border-[#26C6DA] text-[#26C6DA]'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
      }`}
    >
      {icon}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof Grid3X3;
  title: string;
  message: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
      <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function MediaTile({
  imageUrl,
  title,
  badge,
  icon,
}: {
  imageUrl?: string;
  title: string;
  badge?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-end bg-gradient-to-br from-sky-600 to-sky-300 p-3">
          <p className="line-clamp-4 text-sm font-semibold text-white">{title}</p>
        </div>
      )}

      <div className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white">{icon}</div>

      {badge ? (
        <div className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-1 text-xs font-semibold text-white">
          {badge}
        </div>
      ) : null}
    </div>
  );
}
