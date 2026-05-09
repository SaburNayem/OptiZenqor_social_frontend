import { Archive, Bookmark, Folder, RefreshCcw, Sparkles, Upload } from 'lucide-react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppOutlet } from '../hooks/useAppOutlet';
import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSavedCollection,
  createSupportTicket,
  fetchAccountSwitching,
  fetchActivitySessions,
  fetchArchiveOverview,
  fetchBlockedUsers,
  fetchCreatorDashboard,
  fetchDraftsScheduling,
  fetchGroupChats,
  fetchGroups,
  fetchInviteReferral,
  fetchPremiumMembership,
  fetchSavedCollections,
  fetchSubscriptions,
  fetchSupportHelp,
  fetchVerificationOverview,
  fetchWalletPayments,
  logoutOtherDevices,
  renewSubscription,
  revokeActivitySession,
  sendSupportHelpMessage,
  setActiveAccount,
  submitVerificationDocuments,
  toggleVerificationDocument,
  unblockUser,
} from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InlineNotice } from '../components/ui/InlineNotice';
import { Input } from '../components/ui/Input';

type JsonRecord = Record<string, unknown>;
type Feedback = { tone: 'success' | 'error'; message: string } | null;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: unknown, ...keys: string[]) {
  const record = toRecord(value);
  for (const key of keys) {
    const item = record[key];
    if (typeof item === 'string' && item.trim()) {
      return item;
    }
  }
  return '';
}

function numberOf(value: unknown, ...keys: string[]) {
  const record = toRecord(value);
  for (const key of keys) {
    const item = record[key];
    if (typeof item === 'number' && Number.isFinite(item)) {
      return item;
    }
  }
  return 0;
}

function boolOf(value: unknown, ...keys: string[]) {
  const record = toRecord(value);
  for (const key of keys) {
    const item = record[key];
    if (typeof item === 'boolean') {
      return item;
    }
  }
  return false;
}

function formatDate(value: unknown) {
  const input = typeof value === 'string' ? value : '';
  if (!input) {
    return 'Not available';
  }

  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : date.toLocaleString();
}

function FeatureIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action}
      </div>
    </Card>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <p className="text-lg font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </Card>
  );
}

function AuthRequiredPanel({ label }: { label: string }) {
  return (
    <EmptyPanel
      title="Sign in required"
      message={`Sign in to access ${label} from the live backend.`}
    />
  );
}

function MetricCards({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: string }>;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
          {item.tone ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.tone}</p> : null}
        </Card>
      ))}
    </section>
  );
}

function useCreatorFlowState() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [data, setData] = useState<JsonRecord>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setData({});
      return;
    }

    setIsLoading(true);
    setError(null);
    void fetchDraftsScheduling(token)
      .then((next) => setData(toRecord(next)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load creator flow data.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  return {
    drafts: toArray(data.drafts),
    scheduled: toArray(data.scheduled),
    uploads: toArray(data.uploads),
    isLoading,
    error,
  };
}

export function BookmarksPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const savedPosts = useMemo(() => app.data.posts.filter((post) => post.saved), [app.data.posts]);

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Bookmarks"
        title="Saved posts and collections"
        description="This web surface now mirrors the app’s saved-content workflow with saved posts from live feed state and dedicated collection management."
        action={<Link to="/saved-collections" className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0F766E] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.24)] transition hover:bg-[#0D615A] dark:bg-[#169388] dark:hover:bg-[#21A79B]">Open collections</Link>}
      />

      {!token ? <AuthRequiredPanel label="bookmarks" /> : null}

      <MetricCards
        items={[
          { label: 'Saved Posts', value: String(savedPosts.length) },
          { label: 'Collections', value: 'Live', tone: 'Managed in the collections screen' },
          { label: 'Feed Synced', value: app.isRefreshing ? 'Syncing' : 'Yes' },
          { label: 'Backend Source', value: token ? 'Connected' : 'Guest' },
        ]}
      />

      {savedPosts.length === 0 ? (
        <EmptyPanel
          title="No saved posts yet"
          message="Save posts from the feed and they will appear here automatically."
        />
      ) : (
        <section className="space-y-4">
          {savedPosts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">{post.user.name}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {post.network}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
                <span>{post.createdAt}</span>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export function SavedCollectionsPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [collections, setCollections] = useState<unknown[]>([]);
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!token) {
      setCollections([]);
      return;
    }
    void fetchSavedCollections(token)
      .then(setCollections)
      .catch((error) =>
        setFeedback({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to load saved collections.',
        }),
      );
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="saved collections" />;
  }

  async function handleCreateCollection() {
    const sessionToken = token;
    if (!sessionToken) {
      return;
    }
    try {
      await createSavedCollection({ name: name.trim(), privacy }, sessionToken);
      setName('');
      const next = await fetchSavedCollections(sessionToken);
      setCollections(next);
      setFeedback({ tone: 'success', message: 'Saved collection created successfully.' });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to create this collection.',
      });
    }
  }

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Collections"
        title="Organize saved content"
        description="Collections are fetched from the backend and can be created directly from the web client."
      />

      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_180px_140px]">
          <Input label="Collection name" value={name} onChange={(event) => setName(event.target.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Privacy</span>
            <select
              value={privacy}
              onChange={(event) => setPrivacy(event.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="private">Private</option>
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void handleCreateCollection()} disabled={!name.trim()}>
              Create collection
            </Button>
          </div>
        </div>
      </Card>

      {collections.length === 0 ? (
        <EmptyPanel
          title="No collections yet"
          message="Create your first saved collection to group posts, products, and reels."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection, index) => {
            const record = toRecord(collection);
            const itemIds = toArray(record.itemIds);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D6EEEB] text-[#0F766E] dark:bg-[#169388]/20 dark:text-[#A9D9D4]">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'name') || 'Collection'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'privacy') || 'private'}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {itemIds.length} saved items linked to this collection.
                </p>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function DraftsPage() {
  const { app } = useAppOutlet();
  const { drafts, isLoading, error } = useCreatorFlowState();

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Drafts"
        title="Post drafts from the backend"
        description="The app’s draft workflow is now visible on the web using the durable draft and scheduling backend."
        action={<Button onClick={() => void app.refresh({ silent: true })}><RefreshCcw className="h-4 w-4" />Refresh app state</Button>}
      />

      {error ? <InlineNotice tone="error" message={error} /> : null}

      {isLoading ? (
        <EmptyPanel title="Loading drafts" message="Fetching draft entries from the backend." />
      ) : drafts.length === 0 ? (
        <EmptyPanel title="No drafts yet" message="Draft posts and creator-flow items will appear here when saved." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft, index) => {
            const record = toRecord(draft);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{textOf(record, 'title') || 'Untitled draft'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'type') || 'post'}</p>
                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                  Updated {formatDate(record.updatedAt ?? record.createdAt)}
                </p>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function SchedulingPage() {
  const { scheduled, isLoading, error } = useCreatorFlowState();

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Scheduling"
        title="Scheduled content queue"
        description="See which creator-flow items are queued for later publication."
      />

      {error ? <InlineNotice tone="error" message={error} /> : null}

      {isLoading ? (
        <EmptyPanel title="Loading scheduled items" message="Fetching the scheduling queue from the backend." />
      ) : scheduled.length === 0 ? (
        <EmptyPanel title="No scheduled items" message="Scheduled posts will appear here when the backend queue is populated." />
      ) : (
        <section className="space-y-4">
          {scheduled.map((item, index) => {
            const record = toRecord(item);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'title') || 'Scheduled draft'}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'status') || 'scheduled'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {formatDate(record.scheduledAt ?? record.publishAt)}
                  </span>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function UploadManagerPage() {
  const { uploads, isLoading, error } = useCreatorFlowState();

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Upload Manager"
        title="Track media upload tasks"
        description="The upload manager route now exposes the same backend upload queue used by creator flows."
      />

      {error ? <InlineNotice tone="error" message={error} /> : null}

      {isLoading ? (
        <EmptyPanel title="Loading uploads" message="Fetching upload jobs from the backend." />
      ) : uploads.length === 0 ? (
        <EmptyPanel title="No uploads in progress" message="Media upload tasks will appear here when active." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {uploads.map((upload, index) => {
            const record = toRecord(upload);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'name', 'fileName') || 'Upload task'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'status') || 'queued'}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Progress: {numberOf(record, 'progress')}%
                </p>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function GroupsPage() {
  const [groups, setGroups] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchGroups()
      .then(setGroups)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load groups.'));
  }, []);

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Groups"
        title="Community groups from the live backend"
        description="This web page mirrors the app’s groups surface using the backend groups alias on top of communities."
      />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      {groups.length === 0 ? (
        <EmptyPanel title="No groups found" message="Groups will appear here when the backend returns community-backed group records." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, index) => {
            const record = toRecord(group);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{textOf(record, 'name')}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'description')}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{textOf(record, 'privacy') || 'public'}</span>
                  <span>{numberOf(record, 'memberCount')} members</span>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function GroupChatPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [groups, setGroups] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setGroups([]);
      return;
    }
    void fetchGroupChats(token)
      .then(setGroups)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load group chats.'));
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="group chats" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Group Chat"
        title="Shared conversation spaces"
        description="Group chat threads are now visible on web using the same backend route family the mobile app relies on."
      />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      {groups.length === 0 ? (
        <EmptyPanel title="No group chats yet" message="Create a group thread in the app or through the backend and it will appear here." />
      ) : (
        <section className="space-y-4">
          {groups.map((group, index) => {
            const record = toRecord(group);
            const participants = toArray(record.participants);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{textOf(record, 'name') || 'Group chat'}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{participants.length} participants</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {textOf(record, 'role', 'status') || 'active'}
                  </span>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function CreatorToolsPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [dashboard, setDashboard] = useState<JsonRecord>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setDashboard({});
      return;
    }
    void fetchCreatorDashboard(token)
      .then((result) => setDashboard(toRecord(result)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load creator dashboard.'));
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="creator tools" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Creator Tools"
        title="Creator dashboard parity"
        description="This page exposes creator metrics, performance summaries, and capability-aware actions from the backend creator dashboard route."
      />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      <MetricCards
        items={[
          { label: 'Posts', value: String(numberOf(dashboard, 'posts', 'postCount') || app.data.posts.length) },
          { label: 'Reels', value: String(numberOf(dashboard, 'reels', 'reelCount') || app.data.reels.length) },
          { label: 'Followers', value: String(numberOf(dashboard, 'followers') || app.data.profile.user.followers || 0) },
          { label: 'Reach', value: String(numberOf(dashboard, 'reach', 'views')) },
        ]}
      />
      <Card>
        <p className="text-lg font-semibold text-slate-950 dark:text-white">Creator summary</p>
        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
          {textOf(dashboard, 'summary', 'description') ||
            'Creator performance data is connected. As the backend expands the dashboard payload, this page can render deeper charts and monetization insights.'}
        </p>
      </Card>
    </div>
  );
}

export function WalletPaymentsPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [walletData, setWalletData] = useState<JsonRecord>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setWalletData({});
      return;
    }
    void fetchWalletPayments(token)
      .then((result) => setWalletData(toRecord(result)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load wallet data.'));
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="wallet payments" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Wallet" title="Wallet and payment overview" description="The web version now reads the app’s wallet-payment backend surface." />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      <MetricCards
        items={[
          { label: 'Available', value: textOf(walletData, 'balanceLabel', 'availableLabel') || String(numberOf(walletData, 'balance')) },
          { label: 'Pending', value: textOf(walletData, 'pendingLabel') || String(numberOf(walletData, 'pendingBalance')) },
          { label: 'Currency', value: textOf(walletData, 'currency') || 'USD' },
          { label: 'Transactions', value: String(toArray(walletData.transactions).length) },
        ]}
      />
    </div>
  );
}

export function PremiumMembershipPage() {
  const [plans, setPlans] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPremiumMembership()
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load premium plans.'));
  }, []);

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Premium" title="Premium plans" description="The public premium-membership route is now surfaced in the web client." />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      {plans.length === 0 ? (
        <EmptyPanel title="No premium plans yet" message="Premium plans will appear here when returned by the backend." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => {
            const record = toRecord(plan);
            return (
              <Card key={textOf(record, 'id') || String(index)}>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">{textOf(record, 'name', 'title') || 'Premium plan'}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'description')}</p>
                <p className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{textOf(record, 'priceLabel', 'price') || 'Contact sales'}</p>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function SubscriptionsPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [subscriptions, setSubscriptionsState] = useState<unknown[]>([]);
  const [plans, setPlans] = useState<unknown[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!token) {
      setSubscriptionsState([]);
      return;
    }
    void Promise.all([fetchSubscriptions(token), fetchPremiumMembership()])
      .then(([nextSubscriptions, nextPlans]) => {
        setSubscriptionsState(nextSubscriptions);
        setPlans(nextPlans);
      })
      .catch((err) =>
        setFeedback({
          tone: 'error',
          message: err instanceof Error ? err.message : 'Unable to load subscriptions.',
        }),
      );
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="subscriptions" />;
  }

  async function refresh() {
    if (!token) {
      return;
    }
    const next = await fetchSubscriptions(token);
    setSubscriptionsState(next);
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Subscriptions" title="Manage active plans" description="Subscriptions now have a dedicated web control surface with backend-backed plan changes and renew/cancel actions." />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      {subscriptions.length === 0 ? (
        <EmptyPanel title="No active subscriptions" message="Subscription records will appear here for the signed-in account." />
      ) : (
        <section className="space-y-4">
          {subscriptions.map((subscription, index) => {
            const record = toRecord(subscription);
            const subscriptionId = textOf(record, 'id');
            return (
              <Card key={subscriptionId || String(index)}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{textOf(record, 'planName', 'name') || 'Subscription'}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'status') || 'active'}</p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Renews {formatDate(record.renewsAt ?? record.expiresAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        const firstPlanId = textOf(plans[0], 'id');
                        if (!firstPlanId) return;
                        try {
                          await changeSubscriptionPlan(firstPlanId, token);
                          await refresh();
                          setFeedback({ tone: 'success', message: 'Subscription plan changed successfully.' });
                        } catch (error) {
                          setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to change plan.' });
                        }
                      }}
                    >
                      Change plan
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={async () => {
                        try {
                          await renewSubscription(subscriptionId, token);
                          await refresh();
                          setFeedback({ tone: 'success', message: 'Subscription renewed successfully.' });
                        } catch (error) {
                          setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to renew subscription.' });
                        }
                      }}
                    >
                      Renew
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        try {
                          await cancelSubscription(subscriptionId, token);
                          await refresh();
                          setFeedback({ tone: 'success', message: 'Subscription cancelled successfully.' });
                        } catch (error) {
                          setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to cancel subscription.' });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function SupportHelpPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [supportData, setSupportData] = useState<JsonRecord>({});
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketMessage, setTicketMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    void fetchSupportHelp(token)
      .then((result) => setSupportData(toRecord(result)))
      .catch((err) =>
        setFeedback({
          tone: 'error',
          message: err instanceof Error ? err.message : 'Unable to load support workspace.',
        }),
      );
  }, [token]);

  const faqs = toArray(supportData.faqs);
  const tickets = toArray(supportData.tickets);
  const supportChat = toArray(supportData.chat);
  const mail = toRecord(supportData.mail);

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Support"
        title="Help, tickets, and support chat"
        description="The app’s support-help flows are now accessible on web, including FAQs, tickets, support chat, and support contact details."
      />

      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}

      <MetricCards
        items={[
          { label: 'FAQs', value: String(faqs.length) },
          { label: 'Tickets', value: String(tickets.length) },
          { label: 'Chat Messages', value: String(supportChat.length) },
          { label: 'Support Email', value: textOf(mail, 'email') || 'Configured' },
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">Support FAQs</p>
          <div className="mt-4 space-y-3">
            {faqs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No FAQs returned yet.</p>
            ) : (
              faqs.map((faq, index) => {
                const record = toRecord(faq);
                return (
                  <div key={textOf(record, 'id') || String(index)} className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
                    <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'question', 'title')}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'answer', 'description')}</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Create ticket</p>
            {!token ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Sign in to create a support ticket.</p>
            ) : (
              <>
                <div className="mt-4 grid gap-4">
                  <Input label="Subject" value={ticketSubject} onChange={(event) => setTicketSubject(event.target.value)} />
                  <Input label="Category" value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value)} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Message</span>
                    <textarea
                      value={ticketMessage}
                      onChange={(event) => setTicketMessage(event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={async () => {
                      try {
                        await createSupportTicket(
                          {
                            subject: ticketSubject.trim(),
                            category: ticketCategory.trim(),
                            message: ticketMessage.trim(),
                            priority: 'normal',
                          },
                          token,
                        );
                        setTicketSubject('');
                        setTicketCategory('general');
                        setTicketMessage('');
                        setFeedback({ tone: 'success', message: 'Support ticket created successfully.' });
                      } catch (error) {
                        setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to create support ticket.' });
                      }
                    }}
                    disabled={!ticketSubject.trim() || !ticketMessage.trim()}
                  >
                    Submit ticket
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Support chat</p>
            <div className="mt-4 space-y-3">
              {supportChat.slice(0, 4).map((message, index) => {
                const record = toRecord(message);
                return (
                  <div key={textOf(record, 'id') || String(index)} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {textOf(record, 'message', 'body')}
                  </div>
                );
              })}
            </div>
            {token ? (
              <div className="mt-4 flex gap-3">
                <input
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder="Send support message"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <Button
                  onClick={async () => {
                    try {
                      await sendSupportHelpMessage(chatMessage.trim(), token);
                      setChatMessage('');
                      setFeedback({ tone: 'success', message: 'Support message sent successfully.' });
                    } catch (error) {
                      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to send support message.' });
                    }
                  }}
                  disabled={!chatMessage.trim()}
                >
                  Send
                </Button>
              </div>
            ) : null}
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Support mail: {textOf(mail, 'email') || 'Not provided'}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

export function VerificationRequestPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [data, setData] = useState<{ request: JsonRecord; status: JsonRecord; documents: unknown[] }>({
    request: {},
    status: {},
    documents: [],
  });
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    void fetchVerificationOverview(token)
      .then((result) =>
        setData({
          request: toRecord(result.request),
          status: toRecord(result.status),
          documents: Array.isArray(result.documents) ? result.documents : [],
        }),
      )
      .catch((error) =>
        setFeedback({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to load verification request.',
        }),
      );
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="verification requests" />;
  }

  const selectedDocuments = data.documents.filter((item) => boolOf(item, 'selected', 'enabled'));

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Verification"
        title="Verification request workflow"
        description="The web client now exposes verification request status, document selection, and submission against the live backend."
      />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      <MetricCards
        items={[
          { label: 'Status', value: textOf(data.status, 'status') || textOf(data.request, 'status') || 'unknown' },
          { label: 'Selected Docs', value: String(selectedDocuments.length) },
          { label: 'Requested At', value: formatDate(data.request.submittedAt ?? data.request.createdAt) },
          { label: 'Viewer', value: app.session?.user.username || 'member' },
        ]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.documents.map((document, index) => {
          const record = toRecord(document);
          const name = textOf(record, 'documentName', 'name', 'title') || `document-${index + 1}`;
          const selected = boolOf(record, 'selected', 'enabled');
          return (
            <Card key={name}>
              <p className="font-semibold text-slate-950 dark:text-white">{name}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {selected ? 'Included in the current verification packet.' : 'Not selected yet.'}
              </p>
              <div className="mt-4">
                <Button
                  variant={selected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={async () => {
                    try {
                      await toggleVerificationDocument(name, token);
                      const next = await fetchVerificationOverview(token);
                      setData({
                        request: toRecord(next.request),
                        status: toRecord(next.status),
                        documents: Array.isArray(next.documents) ? next.documents : [],
                      });
                    } catch (error) {
                      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to update document selection.' });
                    }
                  }}
                >
                  {selected ? 'Remove' : 'Select'}
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
      <Card>
        <Button
          onClick={async () => {
            try {
              await submitVerificationDocuments(
                selectedDocuments.map((item) => textOf(item, 'documentName', 'name', 'title')).filter(Boolean),
                token,
              );
              setFeedback({ tone: 'success', message: 'Verification request submitted successfully.' });
            } catch (error) {
              setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to submit verification request.' });
            }
          }}
          disabled={selectedDocuments.length === 0}
        >
          Submit verification request
        </Button>
      </Card>
    </div>
  );
}

export function ActivitySessionsPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [history, setHistory] = useState<unknown[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    const next = await fetchActivitySessions(token);
    setSessions(next.sessions);
    setHistory(next.history);
  }, [token]);

  useEffect(() => {
    void load().catch((error) =>
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load activity sessions.',
      }),
    );
  }, [load]);

  if (!token) {
    return <AuthRequiredPanel label="activity sessions" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Sessions" title="Device sessions and activity history" description="The web client now exposes the same session management flows as the app, including revoking devices and logging out other sessions." action={<Button variant="secondary" onClick={async () => { await logoutOtherDevices(token); await load(); setFeedback({ tone: 'success', message: 'Other sessions logged out.' }); }}>Log out others</Button>} />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      <MetricCards
        items={[
          { label: 'Active Sessions', value: String(sessions.length) },
          { label: 'History Entries', value: String(history.length) },
          { label: 'Current User', value: app.session?.user.username || 'member' },
          { label: 'Backend', value: 'Connected' },
        ]}
      />
      <section className="space-y-4">
        {sessions.map((session, index) => {
          const record = toRecord(session);
          const id = textOf(record, 'id');
          return (
            <Card key={id || String(index)}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'deviceName', 'name') || 'Device session'}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(record.lastActiveAt ?? record.updatedAt)}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    try {
                      await revokeActivitySession(id, token);
                      await load();
                      setFeedback({ tone: 'success', message: 'Session revoked successfully.' });
                    } catch (error) {
                      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to revoke session.' });
                    }
                  }}
                >
                  Revoke
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

export function AccountSwitchingPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [accounts, setAccounts] = useState<unknown[]>([]);
  const [active, setActive] = useState<JsonRecord>({});
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    const next = await fetchAccountSwitching(token);
    setAccounts(next.accounts);
    setActive(toRecord(next.active));
  }, [token]);

  useEffect(() => {
    void load().catch((error) =>
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load linked accounts.',
      }),
    );
  }, [load]);

  if (!token) {
    return <AuthRequiredPanel label="account switching" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Accounts" title="Switch linked identities" description="The web client now exposes the app’s account-switching backend routes." />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      {accounts.length === 0 ? (
        <EmptyPanel title="No linked accounts" message="Linked profile identities will appear here when available." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account, index) => {
            const record = toRecord(account);
            const id = textOf(record, 'id', 'accountId');
            const isActive = id === textOf(active, 'id', 'accountId') || boolOf(record, 'active', 'isActive');
            return (
              <Card key={id || String(index)}>
                <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'name', 'displayName') || 'Linked account'}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">@{textOf(record, 'username') || 'unknown'}</p>
                <div className="mt-4">
                  <Button
                    variant={isActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={async () => {
                      try {
                        await setActiveAccount(id, token);
                        await load();
                        setFeedback({ tone: 'success', message: 'Active account updated successfully.' });
                      } catch (error) {
                        setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to switch active account.' });
                      }
                    }}
                  >
                    {isActive ? 'Active' : 'Set active'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function BlockedUsersPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [users, setUsers] = useState<unknown[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    const next = await fetchBlockedUsers(token);
    setUsers(next);
  }, [token]);

  useEffect(() => {
    void load().catch((error) =>
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to load blocked users.',
      }),
    );
  }, [load]);

  if (!token) {
    return <AuthRequiredPanel label="blocked users" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Blocked Users" title="Manage blocked accounts" description="The block management flow from the app is now available on web." />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      {users.length === 0 ? (
        <EmptyPanel title="No blocked users" message="Blocked accounts will appear here when returned by the backend." />
      ) : (
        <section className="space-y-4">
          {users.map((user, index) => {
            const record = toRecord(user);
            const id = textOf(record, 'id', 'targetId');
            return (
              <Card key={id || String(index)}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{textOf(record, 'name', 'displayName') || 'Blocked user'}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{textOf(record, 'reason', 'bio')}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        await unblockUser(id, token);
                        await load();
                        setFeedback({ tone: 'success', message: 'User unblocked successfully.' });
                      } catch (error) {
                        setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to unblock user.' });
                      }
                    }}
                  >
                    Unblock
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function InviteReferralPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [data, setData] = useState<JsonRecord>({});
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    void fetchInviteReferral(token)
      .then((result) => setData(toRecord(result)))
      .catch((error) =>
        setFeedback({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to load referral overview.',
        }),
      );
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="invite referral" />;
  }

  const referralCode = textOf(data, 'code', 'referralCode') || app.session?.user.username || 'invite';

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Invite" title="Referral and invite overview" description="The invite-referral backend surface is now mirrored in the web client." />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      <MetricCards
        items={[
          { label: 'Referral Code', value: referralCode },
          { label: 'Invites Sent', value: String(numberOf(data, 'sentCount', 'invitesSent')) },
          { label: 'Accepted', value: String(numberOf(data, 'acceptedCount', 'acceptedInvites')) },
          { label: 'Rewards', value: textOf(data, 'rewardLabel') || String(numberOf(data, 'rewardBalance')) },
        ]}
      />
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Share this code in the app or on the web experience to track referral performance.
        </p>
      </Card>
    </div>
  );
}

export function ArchiveCenterPage() {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const [data, setData] = useState<{ posts: unknown[]; stories: unknown[]; reels: unknown[] }>({
    posts: [],
    stories: [],
    reels: [],
  });
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    void fetchArchiveOverview(token)
      .then(setData)
      .catch((error) =>
        setFeedback({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Unable to load archive data.',
        }),
      );
  }, [token]);

  if (!token) {
    return <AuthRequiredPanel label="archive center" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro eyebrow="Archive" title="Archive center" description="Archived posts, stories, and reels are now exposed on web through the archive backend routes." />
      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      <MetricCards
        items={[
          { label: 'Posts', value: String(data.posts.length) },
          { label: 'Stories', value: String(data.stories.length) },
          { label: 'Reels', value: String(data.reels.length) },
          { label: 'Owner', value: app.session?.user.username || 'member' },
        ]}
      />
      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { label: 'Archived posts', items: data.posts, icon: Bookmark },
          { label: 'Archived stories', items: data.stories, icon: Sparkles },
          { label: 'Archived reels', items: data.reels, icon: Archive },
        ].map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.label}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <p className="font-semibold text-slate-950 dark:text-white">{section.label}</p>
              </div>
              <div className="mt-4 space-y-3">
                {section.items.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No items archived yet.</p>
                ) : (
                  section.items.slice(0, 5).map((item, index) => {
                    const record = toRecord(item);
                    return (
                      <div key={textOf(record, 'id') || String(index)} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-900">
                        {textOf(record, 'title', 'caption', 'name') || 'Archived item'}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
