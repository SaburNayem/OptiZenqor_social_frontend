import {
  CheckCircle2,
  Play,
  RefreshCcw,
} from 'lucide-react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import {
  deleteBackendFeature,
  fetchBackendFeature,
  patchBackendFeature,
  postBackendFeature,
  readBackendList,
  readBackendObject,
} from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InlineNotice } from '../components/ui/InlineNotice';
import { Input } from '../components/ui/Input';

type JsonRecord = Record<string, unknown>;
type Feedback = { tone: 'success' | 'error' | 'info'; message: string } | null;

interface EndpointConfig {
  id: string;
  label: string;
  path: string;
  listKeys?: string[];
  auth?: boolean;
}

interface ResourceEntry {
  endpoint: EndpointConfig;
  payload: unknown;
  error: string | null;
}

interface FeatureChildContext {
  resources: ResourceEntry[];
  reload: () => Promise<void>;
  token?: string;
  setFeedback: (feedback: Feedback) => void;
}

interface BackendFeaturePageProps {
  eyebrow: string;
  title: string;
  description: string;
  endpoints: EndpointConfig[];
  requiresAuth?: boolean;
  children?: (context: FeatureChildContext) => ReactNode;
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unwrapPayload(payload: unknown) {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data;
  }

  return payload;
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

function stringifyValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }
  if (isRecord(value)) {
    return `${Object.keys(value).length} fields`;
  }
  return 'Not available';
}

function listFromPayload(payload: unknown, preferredKeys: string[] = []) {
  const direct = readBackendList(payload);
  if (direct.length > 0) {
    return direct;
  }

  const keys = [
    ...preferredKeys,
    'items',
    'results',
    'entries',
    'activeEntries',
    'draftEntries',
    'slides',
    'interests',
    'courses',
    'lessons',
    'polls',
    'surveys',
    'devices',
    'reports',
    'tickets',
    'notifications',
    'preferences',
    'categories',
    'accounts',
    'posts',
    'media',
    'files',
    'hashtags',
    'trending',
    'options',
    'plans',
    'payments',
    'subscriptions',
    'hiddenPosts',
    'collections',
  ];

  for (const key of keys) {
    const list = readBackendList(payload, key);
    if (list.length > 0) {
      return list;
    }
  }

  const data = unwrapPayload(payload);
  if (isRecord(data)) {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
    }
  }

  return [];
}

function objectFromPayload(payload: unknown) {
  const data = unwrapPayload(payload);
  if (isRecord(data)) {
    return data;
  }
  return readBackendObject(payload);
}

function scalarEntries(value: unknown) {
  return Object.entries(toRecord(value))
    .filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))
    .slice(0, 8);
}

function nestedCount(value: unknown) {
  const record = toRecord(value);
  return Object.values(record).reduce<number>((total, item) => {
    if (Array.isArray(item)) {
      return total + item.length;
    }
    return total;
  }, 0);
}

function titleFor(value: unknown, fallback: string) {
  const record = toRecord(value);
  return (
    textOf(record, 'title', 'name', 'label', 'subject', 'topic', 'status', 'type', 'id') ||
    fallback
  );
}

function subtitleFor(value: unknown) {
  const record = toRecord(value);
  return (
    textOf(record, 'description', 'body', 'message', 'subtitle', 'details', 'reason', 'category') ||
    formatDate(record.updatedAt ?? record.createdAt ?? record.startedAt)
  );
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
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

function MetricCards({ items }: { items: Array<{ label: string; value: string; detail?: string }> }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
          {item.detail ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.detail}</p> : null}
        </Card>
      ))}
    </section>
  );
}

function useFeatureResources(endpoints: EndpointConfig[], token: string | undefined, blocked: boolean) {
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const reload = useCallback(async () => {
    if (blocked) {
      setResources([]);
      return;
    }

    setIsLoading(true);
    const settled = await Promise.allSettled(
      endpoints.map((endpoint) =>
        fetchBackendFeature(endpoint.path, endpoint.auth === false ? undefined : token),
      ),
    );

    setResources(
      settled.map((result, index) => ({
        endpoint: endpoints[index],
        payload: result.status === 'fulfilled' ? result.value : null,
        error:
          result.status === 'rejected'
            ? result.reason instanceof Error
              ? result.reason.message
              : 'Unable to load this section.'
            : null,
      })),
    );
    setIsLoading(false);
  }, [blocked, endpoints, token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { resources, isLoading, feedback, setFeedback, reload };
}

function ResourceCard({ item, fallback }: { item: unknown; fallback: string }) {
  if (!isRecord(item)) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        {stringifyValue(item)}
      </div>
    );
  }

  const status = textOf(item, 'status', 'state', 'privacy', 'platform');
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">{titleFor(item, fallback)}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitleFor(item)}</p>
        </div>
        {status ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
            {status}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        {scalarEntries(item).slice(0, 4).map(([key, value]) => (
          <span key={key} className="rounded-full bg-white px-3 py-1 dark:bg-slate-950">
            {key}: {stringifyValue(value)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ObjectSummary({ payload }: { payload: unknown }) {
  const record = objectFromPayload(payload);
  const entries = scalarEntries(record);

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        No displayable fields returned yet.
      </p>
    );
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{key}</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{stringifyValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResourcePanel({ resource }: { resource: ResourceEntry }) {
  if (resource.error) {
    return (
      <Card>
        <p className="font-semibold text-slate-950 dark:text-white">{resource.endpoint.label}</p>
        <InlineNotice tone="error" message={resource.error} className="mt-4" />
      </Card>
    );
  }

  const list = listFromPayload(resource.payload, resource.endpoint.listKeys);
  const object = objectFromPayload(resource.payload);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">{resource.endpoint.label}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{resource.endpoint.path}</p>
        </div>
        <span className="rounded-full bg-[#D6EEEB] px-3 py-1 text-xs font-semibold text-[#0F766E] dark:bg-[#169388]/20 dark:text-[#A9D9D4]">
          {list.length > 0 ? `${list.length} records` : `${nestedCount(object)} nested`}
        </span>
      </div>

      <div className="mt-4">
        {list.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {list.slice(0, 8).map((item, index) => (
              <ResourceCard key={textOf(item, 'id', 'key', 'name', 'title') || String(index)} item={item} fallback={resource.endpoint.label} />
            ))}
          </div>
        ) : (
          <ObjectSummary payload={resource.payload} />
        )}
      </div>
    </Card>
  );
}

function BackendFeaturePage({
  eyebrow,
  title,
  description,
  endpoints,
  requiresAuth = false,
  children,
}: BackendFeaturePageProps) {
  const { app } = useAppOutlet();
  const token = app.session?.accessToken;
  const blocked = requiresAuth && !token;
  const { resources, isLoading, feedback, setFeedback, reload } = useFeatureResources(endpoints, token, blocked);

  const metrics = useMemo(() => {
    const loaded = resources.filter((resource) => resource.payload !== null && !resource.error).length;
    const errors = resources.filter((resource) => resource.error).length;
    const records = resources.reduce(
      (total, resource) => total + listFromPayload(resource.payload, resource.endpoint.listKeys).length,
      0,
    );

    return [
      { label: 'Endpoints', value: String(endpoints.length), detail: 'Backend routes' },
      { label: 'Loaded', value: isLoading ? '...' : String(loaded), detail: 'Successful payloads' },
      { label: 'Records', value: String(records), detail: 'Visible list items' },
      { label: 'Errors', value: String(errors), detail: blocked ? 'Needs sign in' : 'Current load' },
    ];
  }, [blocked, endpoints.length, isLoading, resources]);

  if (blocked) {
    return <AuthRequiredPanel label={title.toLowerCase()} />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Button variant="secondary" onClick={() => void reload()} disabled={isLoading}>
            <RefreshCcw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        }
      />

      {feedback ? <InlineNotice tone={feedback.tone} message={feedback.message} /> : null}
      <MetricCards items={metrics} />

      {children ? children({ resources, reload, token, setFeedback }) : null}

      {isLoading && resources.length === 0 ? (
        <EmptyPanel title="Loading backend data" message="Fetching this app surface from the API." />
      ) : (
        <section className="grid gap-4">
          {resources.map((resource) => (
            <ResourcePanel key={resource.endpoint.id} resource={resource} />
          ))}
        </section>
      )}
    </div>
  );
}

async function runAction(
  action: () => Promise<unknown>,
  reload: () => Promise<void>,
  setFeedback: (feedback: Feedback) => void,
  successMessage: string,
) {
  try {
    await action();
    await reload();
    setFeedback({ tone: 'success', message: successMessage });
  } catch (error) {
    setFeedback({
      tone: 'error',
      message: error instanceof Error ? error.message : 'Unable to complete this action.',
    });
  }
}

const ONBOARDING_ENDPOINTS: EndpointConfig[] = [
  { id: 'slides', label: 'Slides', path: '/onboarding/slides', listKeys: ['slides'] },
  { id: 'state', label: 'State', path: '/onboarding/state' },
  { id: 'interests', label: 'Interests', path: '/onboarding/interests', listKeys: ['interests', 'items'] },
];

const PERSONALIZATION_ENDPOINTS: EndpointConfig[] = [
  { id: 'personalization', label: 'Personalization', path: '/personalization-onboarding', listKeys: ['interests', 'topics', 'items'] },
];

const ADVANCED_PRIVACY_ENDPOINTS: EndpointConfig[] = [
  { id: 'advanced-privacy', label: 'Advanced Privacy', path: '/advanced-privacy-controls' },
];

const SAFETY_PRIVACY_ENDPOINTS: EndpointConfig[] = [
  { id: 'safety-privacy', label: 'Safety Privacy', path: '/safety-privacy' },
  { id: 'safety-config', label: 'Safety Config', path: '/safety/config' },
];

const ACCESSIBILITY_ENDPOINTS: EndpointConfig[] = [
  { id: 'accessibility', label: 'Accessibility Support', path: '/accessibility-support' },
];

const EXPLORE_RECOMMENDATION_ENDPOINTS: EndpointConfig[] = [
  { id: 'explore-recommendation', label: 'Explore Recommendations', path: '/explore-recommendation' },
  { id: 'recommendations', label: 'Recommendations', path: '/recommendations' },
];

const PUSH_ENDPOINTS: EndpointConfig[] = [
  { id: 'push-preferences', label: 'Push Preferences', path: '/push-notification-preferences', listKeys: ['categories', 'preferences'] },
  { id: 'notification-preferences', label: 'Notification Preferences', path: '/notification-preferences' },
];

const NOTIFICATION_DEVICE_ENDPOINTS: EndpointConfig[] = [
  { id: 'notification-devices', label: 'Registered Devices', path: '/notification-devices', listKeys: ['items', 'devices'] },
];

const LOCALIZATION_ENDPOINTS: EndpointConfig[] = [
  { id: 'localization', label: 'Localization Support', path: '/localization-support', listKeys: ['locales', 'supportedLocales', 'items'] },
];

const LEGAL_ENDPOINTS: EndpointConfig[] = [
  { id: 'legal-compliance', label: 'Legal Compliance', path: '/legal-compliance' },
  { id: 'legal-consents', label: 'Legal Consents', path: '/legal/consents' },
  { id: 'security-state', label: 'Security State', path: '/security/state' },
];

const APP_UPDATE_ENDPOINTS: EndpointConfig[] = [
  { id: 'app-update-flow', label: 'App Update Flow', path: '/app-update-flow' },
];

const OFFLINE_SYNC_ENDPOINTS: EndpointConfig[] = [
  { id: 'offline-sync', label: 'Offline Sync', path: '/offline-sync' },
];

const MAINTENANCE_ENDPOINTS: EndpointConfig[] = [
  { id: 'maintenance', label: 'Maintenance Mode', path: '/maintenance-mode' },
];

const LEARNING_ENDPOINTS: EndpointConfig[] = [
  { id: 'learning-courses', label: 'Learning Courses', path: '/learning-courses', listKeys: ['courses', 'items'] },
];

const POLLS_ENDPOINTS: EndpointConfig[] = [
  { id: 'polls-surveys', label: 'Polls and Surveys', path: '/polls-surveys', listKeys: ['entries', 'items'] },
  { id: 'active', label: 'Active Entries', path: '/polls-surveys/active', listKeys: ['activeEntries', 'entries'] },
  { id: 'drafts', label: 'Draft Entries', path: '/polls-surveys/drafts', listKeys: ['draftEntries', 'entries'] },
];

const REPORT_ENDPOINTS: EndpointConfig[] = [
  { id: 'report-center', label: 'Reports', path: '/report-center', listKeys: ['reports', 'items'] },
];

const DEEP_LINK_ENDPOINTS: EndpointConfig[] = [
  { id: 'deep-link', label: 'Deep Link State', path: '/deep-link-handler' },
];

const SHARE_REPOST_ENDPOINTS: EndpointConfig[] = [
  { id: 'share-options', label: 'Share Options', path: '/share-repost/options', listKeys: ['options', 'items'] },
];

const MEDIA_VIEWER_ENDPOINTS: EndpointConfig[] = [
  { id: 'media-viewer', label: 'Media Viewer', path: '/media-viewer', listKeys: ['items', 'media'] },
];

const HASHTAGS_TRENDING_ENDPOINTS: EndpointConfig[] = [
  { id: 'hashtags', label: 'Hashtags', path: '/hashtags', listKeys: ['hashtags', 'items'] },
  { id: 'trending', label: 'Trending', path: '/trending', listKeys: ['trending', 'items'] },
];

const BUSINESS_PROFILE_ENDPOINTS: EndpointConfig[] = [
  { id: 'business-profile', label: 'Business Profile', path: '/business-profile' },
];

const SELLER_PROFILE_ENDPOINTS: EndpointConfig[] = [
  { id: 'seller-profile', label: 'Seller Profile', path: '/seller-profile' },
];

const RECRUITER_PROFILE_ENDPOINTS: EndpointConfig[] = [
  { id: 'recruiter-profile', label: 'Recruiter Profile', path: '/recruiter-profile' },
];

const HIDDEN_POSTS_ENDPOINTS: EndpointConfig[] = [
  { id: 'hidden-posts', label: 'Hidden Posts', path: '/hidden-posts', listKeys: ['hiddenPosts', 'items'] },
  { id: 'hidden-items', label: 'Hidden Items', path: '/hide', listKeys: ['items', 'hiddenPosts'] },
];

export function OnboardingPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <BackendFeaturePage
      eyebrow="Onboarding"
      title="Onboarding"
      description="Slides, interests, and completion state from the app onboarding flow."
      endpoints={ONBOARDING_ENDPOINTS}
    >
      {({ resources, reload, token, setFeedback }) => {
        const interestsPayload = resources.find((resource) => resource.endpoint.id === 'interests')?.payload;
        const interests = listFromPayload(interestsPayload, ['interests', 'items']);

        return (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Interest selection</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {selectedInterests.length} selected interests
                </p>
              </div>
              <Button
                onClick={() =>
                  void runAction(
                    () => postBackendFeature('/onboarding/complete', { selectedInterests }, token),
                    reload,
                    setFeedback,
                    'Onboarding completed successfully.',
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest, index) => {
                const name = titleFor(interest, `Interest ${index + 1}`);
                const active = selectedInterests.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setSelectedInterests((current) =>
                        current.includes(name)
                          ? current.filter((item) => item !== name)
                          : [...current, name],
                      )
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[#0F766E] text-white dark:bg-[#169388]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function PersonalizationPage() {
  return (
    <BackendFeaturePage
      eyebrow="Personalization"
      title="Personalization Onboarding"
      description="Interest and recommendation setup tied to the current member."
      endpoints={PERSONALIZATION_ENDPOINTS}
      requiresAuth
    >
      {({ resources, reload, token, setFeedback }) => {
        const payload = resources[0]?.payload;
        const interests = listFromPayload(payload, ['interests', 'topics', 'items']);

        return (
          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Interests</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No interests returned yet.</p>
              ) : (
                interests.map((interest, index) => {
                  const name = titleFor(interest, `Interest ${index + 1}`);
                  return (
                    <Button
                      key={name}
                      variant={boolOf(interest, 'selected', 'enabled') ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() =>
                        void runAction(
                          () => patchBackendFeature('/personalization-onboarding/interests', { name }, token),
                          reload,
                          setFeedback,
                          'Interest updated successfully.',
                        )
                      }
                    >
                      {name}
                    </Button>
                  );
                })
              )}
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function AdvancedPrivacyPage() {
  return (
    <BackendFeaturePage
      eyebrow="Privacy"
      title="Advanced Privacy Controls"
      description="Account privacy controls for the current signed-in member."
      endpoints={ADVANCED_PRIVACY_ENDPOINTS}
      requiresAuth
    />
  );
}

export function SafetyPrivacyPage() {
  return (
    <BackendFeaturePage
      eyebrow="Safety"
      title="Safety and Privacy"
      description="Safety settings, chat protection state, and privacy summaries."
      endpoints={SAFETY_PRIVACY_ENDPOINTS}
      requiresAuth
    />
  );
}

export function AccessibilitySupportPage() {
  return (
    <BackendFeaturePage
      eyebrow="Accessibility"
      title="Accessibility Support"
      description="Accessibility preferences and support options."
      endpoints={ACCESSIBILITY_ENDPOINTS}
      requiresAuth
    />
  );
}

export function ExploreRecommendationPage() {
  return (
    <BackendFeaturePage
      eyebrow="Explore"
      title="Explore Recommendations"
      description="Personalized discovery recommendations from the backend."
      endpoints={EXPLORE_RECOMMENDATION_ENDPOINTS}
      requiresAuth
    />
  );
}

export function PushNotificationPreferencesPage() {
  return (
    <BackendFeaturePage
      eyebrow="Notifications"
      title="Push Notification Preferences"
      description="Push category settings and notification preference state."
      endpoints={PUSH_ENDPOINTS}
      requiresAuth
    >
      {({ resources, reload, token, setFeedback }) => {
        const pushPayload = resources.find((resource) => resource.endpoint.id === 'push-preferences')?.payload;
        const categories = listFromPayload(pushPayload, ['categories', 'preferences']);

        return (
          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Categories</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {categories.map((category, index) => {
                const title = titleFor(category, `Category ${index + 1}`);
                const enabled = boolOf(category, 'enabled', 'active');
                const nextCategories = categories.map((item) => {
                  const record = toRecord(item);
                  const itemTitle = titleFor(record, '');
                  return {
                    ...record,
                    title: itemTitle,
                    enabled: itemTitle === title ? !enabled : boolOf(record, 'enabled', 'active'),
                  };
                });

                return (
                  <div key={title} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <Button
                      variant={enabled ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() =>
                        void runAction(
                          () => patchBackendFeature('/push-notification-preferences', { categories: nextCategories }, token),
                          reload,
                          setFeedback,
                          'Push preference updated successfully.',
                        )
                      }
                    >
                      {enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function NotificationDevicesPage() {
  const [deviceToken, setDeviceToken] = useState('');
  const [deviceLabel, setDeviceLabel] = useState('Web browser');
  const [appVersion, setAppVersion] = useState('web');

  return (
    <BackendFeaturePage
      eyebrow="Devices"
      title="Notification Devices"
      description="Registered push notification devices for the signed-in member."
      endpoints={NOTIFICATION_DEVICE_ENDPOINTS}
      requiresAuth
    >
      {({ resources, reload, token, setFeedback }) => {
        const devices = listFromPayload(resources[0]?.payload, ['devices', 'items']);

        return (
          <div className="space-y-4">
            <Card>
              <div className="grid gap-4 md:grid-cols-[1fr_220px_160px_auto]">
                <Input label="Device token" value={deviceToken} onChange={(event) => setDeviceToken(event.target.value)} />
                <Input label="Device label" value={deviceLabel} onChange={(event) => setDeviceLabel(event.target.value)} />
                <Input label="App version" value={appVersion} onChange={(event) => setAppVersion(event.target.value)} />
                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      void runAction(
                        () =>
                          postBackendFeature(
                            '/notification-devices',
                            {
                              token: deviceToken.trim(),
                              platform: 'web',
                              deviceLabel: deviceLabel.trim(),
                              appVersion: appVersion.trim(),
                            },
                            token,
                          ),
                        reload,
                        setFeedback,
                        'Device registered successfully.',
                      )
                    }
                    disabled={!deviceToken.trim()}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </Card>
            {devices.length > 0 ? (
              <Card>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Device actions</p>
                <div className="mt-4 space-y-3">
                  {devices.map((device, index) => {
                    const id = textOf(device, 'id');
                    return (
                      <div key={id || String(index)} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{titleFor(device, 'Device')}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{textOf(device, 'platform', 'appVersion')}</p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            void runAction(
                              () => deleteBackendFeature(`/notification-devices/${id}`, token),
                              reload,
                              setFeedback,
                              'Device removed successfully.',
                            )
                          }
                          disabled={!id}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : null}
          </div>
        );
      }}
    </BackendFeaturePage>
  );
}

export function LocalizationSupportPage() {
  const [localeCode, setLocaleCode] = useState('');

  return (
    <BackendFeaturePage
      eyebrow="Localization"
      title="Localization Support"
      description="Locale and language settings used by app surfaces."
      endpoints={LOCALIZATION_ENDPOINTS}
    >
      {({ resources, reload, token, setFeedback }) => {
        const locales = listFromPayload(resources[0]?.payload, ['locales', 'supportedLocales', 'items']);
        const localeValue = localeCode || textOf(objectFromPayload(resources[0]?.payload), 'localeCode', 'currentLocale');

        return (
          <Card>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Locale</span>
                <select
                  value={localeValue}
                  onChange={(event) => setLocaleCode(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select locale</option>
                  {locales.map((locale, index) => {
                    const code = textOf(locale, 'localeCode', 'code', 'id') || String(index);
                    return (
                      <option key={code} value={code}>
                        {titleFor(locale, code)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    void runAction(
                      () => patchBackendFeature('/localization-support', { localeCode: localeValue }, token),
                      reload,
                      setFeedback,
                      'Locale updated successfully.',
                    )
                  }
                  disabled={!localeValue}
                >
                  Save locale
                </Button>
              </div>
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function LegalCompliancePage() {
  const [deleteReason, setDeleteReason] = useState('');
  const [exportFormat, setExportFormat] = useState('json');

  return (
    <BackendFeaturePage
      eyebrow="Legal"
      title="Legal Compliance"
      description="Consent, account deletion, data export, and security state."
      endpoints={LEGAL_ENDPOINTS}
      requiresAuth
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">Data export</p>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Format</span>
                <select
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
              <Button
                onClick={() =>
                  void runAction(
                    () => postBackendFeature('/legal/data-export', { format: exportFormat }, token),
                    reload,
                    setFeedback,
                    'Data export requested successfully.',
                  )
                }
              >
                Request export
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">Account deletion</p>
              <Input label="Reason" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} />
              <Button
                variant="danger"
                onClick={() =>
                  void runAction(
                    () => postBackendFeature('/legal/account-deletion', { reason: deleteReason.trim() }, token),
                    reload,
                    setFeedback,
                    'Account deletion requested successfully.',
                  )
                }
              >
                Request deletion
              </Button>
            </div>
          </div>
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function AppUpdateFlowPage() {
  return (
    <BackendFeaturePage
      eyebrow="System"
      title="App Update Flow"
      description="Update readiness and start state for app clients."
      endpoints={APP_UPDATE_ENDPOINTS}
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <Button
            onClick={() =>
              void runAction(
                () => postBackendFeature('/app-update-flow/start', {}, token),
                reload,
                setFeedback,
                'App update flow started successfully.',
              )
            }
          >
            <Play className="h-4 w-4" />
            Start update
          </Button>
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function OfflineSyncPage() {
  return (
    <BackendFeaturePage
      eyebrow="Sync"
      title="Offline Sync"
      description="Offline queue state and retry controls."
      endpoints={OFFLINE_SYNC_ENDPOINTS}
      requiresAuth
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <Button
            onClick={() =>
              void runAction(
                () => postBackendFeature('/offline-sync/retry', {}, token),
                reload,
                setFeedback,
                'Offline sync retried successfully.',
              )
            }
          >
            <RefreshCcw className="h-4 w-4" />
            Retry sync
          </Button>
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function MaintenanceModePage() {
  return (
    <BackendFeaturePage
      eyebrow="System"
      title="Maintenance Mode"
      description="Maintenance state and retry status."
      endpoints={MAINTENANCE_ENDPOINTS}
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <Button
            variant="secondary"
            onClick={() =>
              void runAction(
                () => postBackendFeature('/maintenance-mode/retry', {}, token),
                reload,
                setFeedback,
                'Maintenance retry completed successfully.',
              )
            }
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function LearningCoursesPage() {
  return (
    <BackendFeaturePage
      eyebrow="Learning"
      title="Learning Courses"
      description="Learning catalog and course progress payloads."
      endpoints={LEARNING_ENDPOINTS}
    />
  );
}

export function PollsSurveysPage() {
  return (
    <BackendFeaturePage
      eyebrow="Polls"
      title="Polls and Surveys"
      description="Active and draft polls from the engagement backend."
      endpoints={POLLS_ENDPOINTS}
    >
      {({ resources, reload, token, setFeedback }) => {
        const activePayload = resources.find((resource) => resource.endpoint.id === 'active')?.payload;
        const activeEntries = listFromPayload(activePayload, ['activeEntries', 'entries']);

        return (
          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Voting</p>
            <div className="mt-4 space-y-4">
              {activeEntries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No active polls returned yet.</p>
              ) : (
                activeEntries.map((entry, entryIndex) => {
                  const id = textOf(entry, 'id');
                  const options = toArray(toRecord(entry).options);
                  return (
                    <div key={id || String(entryIndex)} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="font-semibold text-slate-950 dark:text-white">{titleFor(entry, 'Poll')}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {options.map((option, optionIndex) => (
                          <Button
                            key={textOf(option, 'id', 'label', 'title') || String(optionIndex)}
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              void runAction(
                                () => patchBackendFeature(`/polls-surveys/${id}/vote`, { optionIndex }, token),
                                reload,
                                setFeedback,
                                'Vote recorded successfully.',
                              )
                            }
                            disabled={!id}
                          >
                            {titleFor(option, `Option ${optionIndex + 1}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function ReportCenterPage() {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [targetEntityType, setTargetEntityType] = useState('post');
  const [targetEntityId, setTargetEntityId] = useState('');

  return (
    <BackendFeaturePage
      eyebrow="Reports"
      title="Report Center"
      description="Submitted reports and report creation workflow."
      endpoints={REPORT_ENDPOINTS}
      requiresAuth
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <Input label="Target id" value={targetEntityId} onChange={(event) => setTargetEntityId(event.target.value)} />
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Target type</span>
              <select
                value={targetEntityType}
                onChange={(event) => setTargetEntityType(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="post">Post</option>
                <option value="user">User</option>
                <option value="comment">Comment</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </label>
            <Input label="Details" value={details} onChange={(event) => setDetails(event.target.value)} />
          </div>
          <div className="mt-4">
            <Button
              onClick={() =>
                void runAction(
                  () =>
                    postBackendFeature(
                      '/report-center',
                      {
                        reason: reason.trim(),
                        details: details.trim(),
                        targetEntityType,
                        targetEntityId: targetEntityId.trim(),
                      },
                      token,
                    ),
                  reload,
                  setFeedback,
                  'Report submitted successfully.',
                )
              }
              disabled={!reason.trim()}
            >
              Submit report
            </Button>
          </div>
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function DeepLinkHandlerPage() {
  const [url, setUrl] = useState('');
  const [resolved, setResolved] = useState<unknown>(null);

  return (
    <BackendFeaturePage
      eyebrow="Deep Links"
      title="Deep Link Handler"
      description="Deep link state and backend route resolution."
      endpoints={DEEP_LINK_ENDPOINTS}
    >
      {({ reload, token, setFeedback }) => (
        <Card>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input label="Deep link URL" value={url} onChange={(event) => setUrl(event.target.value)} />
            <div className="flex items-end">
              <Button
                onClick={async () => {
                  try {
                    const result = await postBackendFeature('/deep-link-handler/resolve', { url: url.trim() }, token);
                    setResolved(result);
                    await reload();
                    setFeedback({ tone: 'success', message: 'Deep link resolved successfully.' });
                  } catch (error) {
                    setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to resolve link.' });
                  }
                }}
                disabled={!url.trim()}
              >
                Resolve
              </Button>
            </div>
          </div>
          {resolved ? (
            <div className="mt-4">
              <ObjectSummary payload={resolved} />
            </div>
          ) : null}
        </Card>
      )}
    </BackendFeaturePage>
  );
}

export function ShareRepostPage() {
  const [targetId, setTargetId] = useState('');
  const [option, setOption] = useState('');

  return (
    <BackendFeaturePage
      eyebrow="Share"
      title="Share and Repost"
      description="Share options and tracking for app content."
      endpoints={SHARE_REPOST_ENDPOINTS}
    >
      {({ resources, reload, token, setFeedback }) => {
        const options = listFromPayload(resources[0]?.payload, ['options', 'items']);
        const selectedOption = option || titleFor(options[0], '');

        return (
          <Card>
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
              <Input label="Target id" value={targetId} onChange={(event) => setTargetId(event.target.value)} />
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Option</span>
                <select
                  value={selectedOption}
                  onChange={(event) => setOption(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Select option</option>
                  {options.map((item, index) => {
                    const name = titleFor(item, `Option ${index + 1}`);
                    return (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </label>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    void runAction(
                      () => postBackendFeature('/share-repost/track', { targetId: targetId.trim(), option: selectedOption }, token),
                      reload,
                      setFeedback,
                      'Share action tracked successfully.',
                    )
                  }
                  disabled={!targetId.trim() || !selectedOption}
                >
                  Track
                </Button>
              </div>
            </div>
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function MediaViewerPage() {
  const [detail, setDetail] = useState<unknown>(null);

  return (
    <BackendFeaturePage
      eyebrow="Media"
      title="Media Viewer"
      description="Media viewer library and item detail payloads."
      endpoints={MEDIA_VIEWER_ENDPOINTS}
    >
      {({ resources, token, setFeedback }) => {
        const items = listFromPayload(resources[0]?.payload, ['items', 'media']);

        return (
          <Card>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Media detail</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((item, index) => {
                const id = textOf(item, 'id');
                return (
                  <Button
                    key={id || String(index)}
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        setDetail(await fetchBackendFeature(`/media-viewer/${id}`, token));
                        setFeedback({ tone: 'success', message: 'Media item loaded successfully.' });
                      } catch (error) {
                        setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to load media item.' });
                      }
                    }}
                    disabled={!id}
                  >
                    {titleFor(item, `Media ${index + 1}`)}
                  </Button>
                );
              })}
            </div>
            {detail ? (
              <div className="mt-4">
                <ObjectSummary payload={detail} />
              </div>
            ) : null}
          </Card>
        );
      }}
    </BackendFeaturePage>
  );
}

export function HashtagsTrendingPage() {
  return (
    <BackendFeaturePage
      eyebrow="Discovery"
      title="Hashtags and Trending"
      description="Hashtag and trending discovery collections."
      endpoints={HASHTAGS_TRENDING_ENDPOINTS}
    />
  );
}

export function BusinessProfilePage() {
  return (
    <BackendFeaturePage
      eyebrow="Profile"
      title="Business Profile"
      description="Business profile state for the signed-in member."
      endpoints={BUSINESS_PROFILE_ENDPOINTS}
      requiresAuth
    />
  );
}

export function SellerProfilePage() {
  return (
    <BackendFeaturePage
      eyebrow="Profile"
      title="Seller Profile"
      description="Seller profile state for marketplace workflows."
      endpoints={SELLER_PROFILE_ENDPOINTS}
      requiresAuth
    />
  );
}

export function RecruiterProfilePage() {
  return (
    <BackendFeaturePage
      eyebrow="Profile"
      title="Recruiter Profile"
      description="Recruiter profile state for jobs and hiring workflows."
      endpoints={RECRUITER_PROFILE_ENDPOINTS}
      requiresAuth
    />
  );
}

export function PaymentsPage() {
  const { app } = useAppOutlet();
  const [title, setTitle] = useState('Premium membership');
  const [amount, setAmount] = useState('499');
  const [currency, setCurrency] = useState('BDT');
  const [gateway, setGateway] = useState('SSLCOMMERZ');
  const [phone, setPhone] = useState('+8801700000000');
  const [checkout, setCheckout] = useState<unknown>(null);
  const token = app.session?.accessToken;

  if (!token) {
    return <AuthRequiredPanel label="payments" />;
  }

  return (
    <div className="space-y-6">
      <FeatureIntro
        eyebrow="Payments"
        title="Payments"
        description="Payment checkout creation and status lookup."
        action={
          <Button variant="secondary" onClick={() => setCheckout(null)}>
            <RefreshCcw className="h-4 w-4" />
            Clear result
          </Button>
        }
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Currency</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Gateway</span>
            <select
              value={gateway}
              onChange={(event) => setGateway(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="SSLCOMMERZ">SSLCommerz</option>
              <option value="TWO_CHECKOUT">2Checkout</option>
            </select>
          </label>
          <Input label="Customer phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={async () => {
                const parsedAmount = Number(amount);
                if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                  setCheckout({ success: false, message: 'Enter a valid amount.' });
                  return;
                }
                try {
                  setCheckout(
                    await postBackendFeature(
                      '/payments/create',
                      {
                        itemType: 'premium_plan',
                        itemId: 'web-premium',
                        title: title.trim(),
                        description: 'Web checkout request',
                        amount: parsedAmount,
                        currency,
                        region: currency === 'BDT' ? 'local' : 'global',
                        gateway,
                        customer: {
                          name: app.session?.user.name || 'Member',
                          email: app.session?.user.email || 'member@example.com',
                          phone: phone.trim(),
                          city: app.session?.user.location || 'Dhaka',
                          country: currency === 'BDT' ? 'Bangladesh' : 'Global',
                        },
                        metadata: { source: 'web_payments_page' },
                      },
                      token,
                    ),
                  );
                } catch (error) {
                  setCheckout({ success: false, message: error instanceof Error ? error.message : 'Unable to create checkout.' });
                }
              }}
              disabled={!title.trim()}
            >
              Create checkout
            </Button>
          </div>
        </div>
      </Card>
      {checkout ? (
        <Card>
          <ObjectSummary payload={checkout} />
        </Card>
      ) : null}
    </div>
  );
}

export function HiddenPostsPage() {
  const [targetId, setTargetId] = useState('');
  const [targetType, setTargetType] = useState('post');
  const [reason, setReason] = useState('');

  return (
    <BackendFeaturePage
      eyebrow="Hidden"
      title="Hidden Posts"
      description="Hidden posts and item visibility controls."
      endpoints={HIDDEN_POSTS_ENDPOINTS}
      requiresAuth
    >
      {({ resources, reload, token, setFeedback }) => {
        const hiddenPosts = listFromPayload(resources[0]?.payload, ['hiddenPosts', 'items']);

        return (
          <div className="space-y-4">
            <Card>
              <div className="grid gap-4 md:grid-cols-[1fr_160px_1fr_auto]">
                <Input label="Target id" value={targetId} onChange={(event) => setTargetId(event.target.value)} />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</span>
                  <select
                    value={targetType}
                    onChange={(event) => setTargetType(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="post">Post</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="user">User</option>
                  </select>
                </label>
                <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      void runAction(
                        () => postBackendFeature('/hide', { targetId: targetId.trim(), targetType, reason: reason.trim() }, token),
                        reload,
                        setFeedback,
                        'Item hidden successfully.',
                      )
                    }
                    disabled={!targetId.trim()}
                  >
                    Hide
                  </Button>
                </div>
              </div>
            </Card>
            {hiddenPosts.length > 0 ? (
              <Card>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Unhide posts</p>
                <div className="mt-4 space-y-3">
                  {hiddenPosts.map((item, index) => {
                    const id = textOf(item, 'targetId', 'id');
                    return (
                      <div key={id || String(index)} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{titleFor(item, 'Hidden item')}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitleFor(item)}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            void runAction(
                              () => deleteBackendFeature(`/hidden-posts/${id}`, token),
                              reload,
                              setFeedback,
                              'Item restored successfully.',
                            )
                          }
                          disabled={!id}
                        >
                          Unhide
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : null}
          </div>
        );
      }}
    </BackendFeaturePage>
  );
}
