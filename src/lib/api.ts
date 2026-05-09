import {
  CallView,
  ChatThread,
  ConnectionItem,
  CommunityView,
  DashboardData,
  EventView,
  FeedPostView,
  JobView,
  LiveStreamView,
  MarketplaceItemView,
  NotificationView,
  PageView,
  ReelView,
  SearchItemView,
  SessionState,
  SettingsGroup,
  StoryView,
  TrendView,
  UserProfile,
  ViewerUser,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function formatRelative(iso: string) {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

function getDataNode(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }
  return payload.data ?? null;
}

function pickList(payload: unknown, key?: string) {
  if (Array.isArray(payload)) {
    return payload;
  }

  const data = getDataNode(payload);
  if (Array.isArray(data)) {
    return data;
  }
  if (key && isRecord(data) && Array.isArray(data[key])) {
    return data[key] as unknown[];
  }
  if (key && isRecord(payload) && Array.isArray(payload[key])) {
    return payload[key] as unknown[];
  }

  return [];
}

function pickObject(payload: unknown) {
  const data = getDataNode(payload);
  if (isRecord(data)) {
    return data;
  }
  return isRecord(payload) ? payload : {};
}

function buildNetworkErrorMessage(error: unknown) {
  if (!API_BASE_URL) {
    return 'VITE_API_BASE_URL is missing. Configure the public web frontend to point at the backend before loading production data.';
  }

  if (error instanceof TypeError) {
    return `Unable to reach the backend at ${API_BASE_URL}. Make sure the backend is running, the URL is correct, and this web origin is allowed by backend CORS.`;
  }

  return error instanceof Error ? error.message : 'Unable to reach the backend.';
}

async function request(path: string, init: RequestInit = {}, token?: string) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is missing. Configure the public web frontend before making API requests.',
    );
  }

  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    const wrappedError = new Error(buildNetworkErrorMessage(error)) as Error & { cause?: unknown };
    wrappedError.cause = error;
    throw wrappedError;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      (isRecord(body) && typeof body.message === 'string' && body.message) ||
      (typeof body === 'string' && body) ||
      `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function normalizeUser(raw: unknown): ViewerUser {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    name: asText(record.name),
    username: asText(record.username),
    email: asText(record.email),
    avatar: asText(record.avatar) || asText(record.avatarUrl),
    bio: asText(record.bio),
    role: capitalize(asText(record.role)),
    profileType: ['user', 'creator', 'business'].includes(asText(record.profileType).toLowerCase())
      ? (asText(record.profileType).toLowerCase() as ViewerUser['profileType'])
      : undefined,
    capabilities: isRecord(record.capabilities)
      ? {
          canCreateJobs: asBoolean(record.capabilities.canCreateJobs),
          canCreateMarketplaceProducts: asBoolean(record.capabilities.canCreateMarketplaceProducts),
          canCreatePages: asBoolean(record.capabilities.canCreatePages),
        }
      : undefined,
    verified: asBoolean(record.verified),
    followers: asNumber(record.followers),
    following: asNumber(record.following),
    location: asText(record.location),
    website: asText(record.website),
    coverImage: asText(record.coverImageUrl) || asText(record.coverImage),
    headline: asText(record.headline),
  };
}

function inferNetwork(post: JsonRecord, user: ViewerUser): FeedPostView['network'] {
  const tags = toArray(post.tags);
  if (toArray(post.media).length > 0) {
    return 'instagram';
  }
  if (user.role.toLowerCase().includes('business') || user.role.toLowerCase().includes('recruiter')) {
    return 'linkedin';
  }
  if (tags.length > 1 || asNumber(post.comments) > 8) {
    return 'facebook';
  }
  return 'x';
}

function normalizePost(raw: unknown, usersById: Map<string, ViewerUser>): FeedPostView {
  const record = isRecord(raw) ? raw : {};
  const author = isRecord(record.author) ? normalizeUser(record.author) : usersById.get(asText(record.authorId));
  const user = author ?? {
    id: asText(record.authorId),
    name: '',
    username: '',
    avatar: '',
    bio: '',
    role: '',
    verified: false,
  };
  const media = toArray(record.media).find((item) => typeof item === 'string');
  return {
    id: asText(record.id),
    network: inferNetwork(record, user),
    user,
    headline: capitalize(asText(record.type)),
    content: asText(record.caption),
    image: typeof media === 'string' ? media : undefined,
    likes: asNumber(record.likes, asNumber(record.likeCount)),
    comments: asNumber(record.comments, asNumber(record.commentCount)),
    shares: asNumber(record.shares, asNumber(record.shareCount)),
    views: asNumber(record.views, asNumber(record.viewCount)),
    createdAt: formatRelative(asText(record.createdAt)),
    tags: toArray(record.tags).filter((item): item is string => typeof item === 'string'),
    saved: asBoolean(record.saved),
  };
}

function normalizeStory(raw: unknown, usersById: Map<string, ViewerUser>, index: number): StoryView {
  const record = isRecord(raw) ? raw : {};
  const user = usersById.get(asText(record.userId)) ?? {
    id: asText(record.userId),
    name: '',
    username: '',
    avatar: '',
    bio: '',
    role: '',
    verified: false,
  };

  const accents = [
    'from-[#ff6a88] via-[#ff8c42] to-[#ffd166]',
    'from-[#1d9bf0] via-[#2ec4b6] to-[#90f1ef]',
    'from-[#0a66c2] via-[#2b7fff] to-[#74b9ff]',
    'from-[#1877f2] via-[#6c63ff] to-[#b388ff]',
  ];

  return {
    id: asText(record.id),
    title: user.name,
    subtitle: asText(record.text).slice(0, 40),
    accent: accents[index % accents.length],
    media: asText(record.media),
    user,
  };
}

function normalizeReel(raw: unknown): ReelView {
  const record = isRecord(raw) ? raw : {};
  const user = isRecord(record.author) ? normalizeUser(record.author) : normalizeUser({});
  return {
    id: asText(record.id),
    caption: asText(record.caption),
    thumbnail: asText(record.thumbnail) || asText(record.coverImageUrl) || undefined,
    audioName: asText(record.audioName),
    likes: asNumber(record.likes, asNumber(record.likeCount)),
    comments: asNumber(record.comments, asNumber(record.commentCount)),
    shares: asNumber(record.shares, asNumber(record.shareCount)),
    createdAt: formatRelative(asText(record.createdAt)),
    user,
  };
}

function normalizeJob(raw: unknown): JobView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    title: asText(record.title),
    company: asText(record.companyName) || asText(record.company),
    location: asText(record.location),
    type: capitalize(asText(record.type)),
    salary: asText(record.salaryLabel) || asText(record.salary),
    postedTime: asText(record.postedTime) || formatRelative(asText(record.createdAt)),
    skills: toArray(record.skills).filter((item): item is string => typeof item === 'string'),
    featured: asBoolean(record.featured),
    saved: asBoolean(record.saved),
    applied: asBoolean(record.applied),
  };
}

function normalizeCommunity(raw: unknown): CommunityView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    name: asText(record.name),
    description: asText(record.description),
    category: asText(record.category),
    privacy: capitalize(asText(record.privacy)),
    location: asText(record.location),
    memberCount: asNumber(record.memberCount),
    tags: toArray(record.tags).filter((item): item is string => typeof item === 'string'),
    joined: asBoolean(record.joined),
  };
}

function normalizeMarketplaceItem(raw: unknown): MarketplaceItemView {
  const record = isRecord(raw) ? raw : {};
  const priceValue = record.price;
  const numericPrice = typeof priceValue === 'number' ? priceValue : null;
  return {
    id: asText(record.id),
    title: asText(record.title),
    description: asText(record.description),
    price:
      asText(record.priceLabel) ||
      asText(record.price) ||
      (numericPrice !== null ? `$${numericPrice}` : ''),
    location: asText(record.location),
    status: capitalize(asText(record.status)),
    sellerName:
      asText(record.sellerName) ||
      asText((record.seller as JsonRecord | undefined)?.name),
    image:
      asText(record.image) ||
      asText(record.thumbnail) ||
      (toArray(record.images).find((item) => typeof item === 'string') as string | undefined),
    category: asText(record.category),
  };
}

function normalizeEvent(raw: unknown): EventView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    title: asText(record.title),
    description: asText(record.description),
    location: asText(record.location),
    startsAt: asText(record.startDate) || asText(record.startsAt) || formatRelative(asText(record.createdAt)),
    status: capitalize(asText(record.status)),
    attendeeCount: asNumber(record.attendeeCount, asNumber(record.rsvpCount)),
    image: asText(record.image) || asText(record.coverImageUrl),
    rsvped: asBoolean(record.rsvped),
    saved: asBoolean(record.saved),
  };
}

function normalizePage(raw: unknown): PageView {
  const record = isRecord(raw) ? raw : {};
  const followed = asBoolean(record.followed);
  return {
    id: asText(record.id),
    name: asText(record.name),
    description: asText(record.description),
    category: asText(record.category),
    followers: asNumber(record.followers, asNumber(record.followerCount)),
    actionLabel: asText(record.actionLabel, followed ? 'Following' : 'Follow'),
    image: asText(record.coverImageUrl) || asText(record.avatar),
    followed,
  };
}

function normalizeCall(raw: unknown): CallView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    name: asText(record.name),
    type: capitalize(asText(record.type)),
    state: capitalize(asText(record.state)),
    time: formatRelative(asText(record.startedAt) || asText(record.time)),
    avatarUrl: asText(record.avatarUrl),
  };
}

function normalizeLiveStream(raw: unknown): LiveStreamView {
  const record = isRecord(raw) ? raw : {};
  const host = isRecord(record.host) ? record.host : {};
  return {
    id: asText(record.id),
    title: asText(record.title),
    description: asText(record.description),
    hostName: asText(host.name) || asText(record.hostName),
    status: capitalize(asText(record.status)),
    viewerCount: asNumber(record.viewerCount),
    category: asText(record.category),
    image: asText(record.previewImageUrl),
  };
}

function normalizeTrend(raw: unknown): TrendView {
  const record = isRecord(raw) ? raw : {};
  const payload = isRecord(record.payload) ? record.payload : {};
  return {
    id: asText(record.id) || asText(payload.id) || asText(record.title),
    topic: `#${asText(record.title).replace(/^#/, '').replace(/\s+/g, '')}`,
    detail: asText(payload.description) || asText(payload.caption),
    volume: `${Math.max(0, Math.round(asNumber(record.score, 0)))} trend score`,
  };
}

function normalizeNotification(raw: unknown): NotificationView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    title: asText(record.title),
    body: asText(record.body),
    createdAt: formatRelative(asText(record.createdAt)),
    unread: asBoolean(record.unread),
    entityType: asText(record.entityType),
    actorName: asText(record.actorName),
  };
}

function normalizeSearchItem(raw: unknown): SearchItemView {
  const record = isRecord(raw) ? raw : {};
  return {
    id: asText(record.id),
    type: asText(record.type),
    title: asText(record.title),
    subtitle: asText(record.description) || asText(record.caption) || asText(record.name),
    image: asText(record.imageUrl) || asText(record.avatar),
  };
}

function firstBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = firstBoolean(item);
      if (nested !== null) {
        return nested;
      }
    }
    return null;
  }
  if (isRecord(value)) {
    for (const nestedValue of Object.values(value)) {
      const nested = firstBoolean(nestedValue);
      if (nested !== null) {
        return nested;
      }
    }
  }
  return null;
}

function formatChatTime(iso: string) {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function normalizeProfile(raw: unknown): UserProfile {
  const record = pickObject(raw);
  const user = normalizeUser((record as JsonRecord).user ?? {});
  const stats = isRecord((record as JsonRecord).stats) ? ((record as JsonRecord).stats as JsonRecord) : {};
  const recentPosts = pickList(record, 'recentPosts').length;

  return {
    user,
    coverImage: user.coverImage || asText((record as JsonRecord).coverImage),
    headline: user.headline || asText((record as JsonRecord).headline) || user.bio,
    about: user.bio || asText((record as JsonRecord).about),
    location: user.location || '',
    website: user.website || '',
    joinedLabel: asText((record as JsonRecord).joinedLabel),
    skills: toArray((record as JsonRecord).skills).filter((item): item is string => typeof item === 'string'),
    metrics: [
      { label: 'Followers', value: String(asNumber(stats.followers, user.followers ?? 0)) },
      { label: 'Following', value: String(asNumber(stats.following, user.following ?? 0)) },
      { label: 'Posts', value: String(asNumber(stats.posts, recentPosts)) },
      { label: 'Verified', value: user.verified ? 'Yes' : 'No' },
    ],
    highlights: [
      {
        id: 'profile-role',
        label: 'Role',
        value: user.role,
        description: 'Current role returned from the profile backend.',
      },
      {
        id: 'profile-preview',
        label: 'Public profile',
        value: `@${user.username}`,
        description: 'Your live backend profile identity.',
      },
      {
        id: 'profile-bio',
        label: 'Bio',
        value: user.bio || '',
        description: 'Profile summary visible in the app.',
      },
    ],
  };
}

function normalizeConnection(raw: unknown, relationship: ConnectionItem['relationship']): ConnectionItem {
  const user = normalizeUser(raw);
  return {
    id: `connection-${relationship}-${user.id}`,
    user,
    relationship,
    note: user.bio || user.role,
    sharedTags: [user.role, user.location || ''].filter(Boolean),
  };
}

function normalizeSettings(raw: unknown): SettingsGroup[] {
  return pickList(raw).map((section) => {
    const record = isRecord(section) ? section : {};
    const items = pickList(record, 'items').map((item) => {
      const itemRecord = isRecord(item) ? item : {};
      return {
        id: asText(itemRecord.key) || asText(itemRecord.id),
        title: asText(itemRecord.title),
        description: asText(itemRecord.subtitle) || asText((itemRecord.data as JsonRecord | undefined)?.description),
        enabled: firstBoolean((itemRecord.data as JsonRecord | undefined)?.state ?? itemRecord.data) ?? false,
      };
    });

    return {
      id: asText(record.key) || asText(record.id),
      title: asText(record.title),
      items,
    };
  });
}

function normalizeChatThread(raw: unknown, viewerId: string, messages: unknown[]): ChatThread {
  const record = isRecord(raw) ? raw : {};
  const participants = pickList(record, 'participants').map(normalizeUser);
  const participant =
    participants.find((item) => item.id !== viewerId) ??
    participants[0] ??
    normalizeUser({});
  const normalizedMessages = messages
    .map((message) => (isRecord(message) ? message : {}))
    .map((message) => ({
      id: asText(message.id),
      authorId: asText(message.senderId),
      body: asText(message.text),
      createdAt: formatChatTime(asText(message.timestamp)),
      status: asText(message.deliveryState) === 'read' ? ('seen' as const) : ('sent' as const),
    }));
  const lastMessage = normalizedMessages[normalizedMessages.length - 1];

  return {
    id: asText(record.id),
    participant,
    roleLabel: participant.role || asText(record.participantsLabel),
    preview: lastMessage?.body || asText((record.lastMessage as JsonRecord | undefined)?.text) || asText(record.summary),
    unreadCount: asNumber(record.unreadCount),
    lastActive:
      lastMessage?.createdAt ||
      formatChatTime(asText(record.updatedAt) || asText(record.lastMessageAt) || asText(record.createdAt)),
    online: false,
    messages: normalizedMessages,
  };
}

function deriveExplore(search: SearchItemView[], trends: TrendView[], jobs: JobView[], communities: CommunityView[]) {
  const searchClusters = search.slice(0, 3).map((item) => ({
    id: `explore-${item.id}`,
    title: item.title,
    description: item.subtitle || `${capitalize(item.type)} surfaced by live search.`,
    image: item.image || undefined,
    stat: capitalize(item.type),
  }));

  if (searchClusters.length > 0) {
    return searchClusters;
  }

  return [
    ...trends.slice(0, 1).map((trend) => ({
      id: `explore-trend-${trend.id}`,
      title: trend.topic,
      description: trend.detail,
      stat: trend.volume,
    })),
    ...jobs.slice(0, 1).map((job) => ({
      id: `explore-job-${job.id}`,
      title: job.title,
      description: `${job.company} • ${job.location}`,
      stat: job.type,
    })),
    ...communities.slice(0, 1).map((community) => ({
      id: `explore-community-${community.id}`,
      title: community.name,
      description: community.description,
      stat: `${community.memberCount} members`,
    })),
  ];
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function login(email: string, password: string) {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const record = pickObject(payload);
  return {
    accessToken: asText((payload as JsonRecord).accessToken) || asText(record.accessToken),
    refreshToken: asText((payload as JsonRecord).refreshToken) || asText(record.refreshToken),
    sessionId: asText((payload as JsonRecord).sessionId) || asText(record.sessionId),
    user: normalizeUser((payload as JsonRecord).user ?? record.user ?? record),
  } satisfies SessionState;
}

export async function fetchMe(token: string) {
  const payload = await request('/auth/me', {}, token);
  return normalizeUser((payload as JsonRecord).user ?? (payload as JsonRecord).data ?? payload);
}

export async function signup(input: { name: string; email: string; password: string }) {
  const username = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || `user.${Date.now()}`;
  const payload = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name.trim(),
      username,
      email: input.email.trim(),
      password: input.password,
      confirmPassword: input.password,
      profileType: 'user',
    }),
  });
  const record = pickObject(payload);
  return {
    accessToken: asText((payload as JsonRecord).accessToken) || asText(record.accessToken),
    refreshToken: asText((payload as JsonRecord).refreshToken) || asText(record.refreshToken),
    sessionId: asText((payload as JsonRecord).sessionId) || asText(record.sessionId),
    user: normalizeUser((payload as JsonRecord).user ?? record.user ?? record),
  } satisfies SessionState;
}

export async function forgotPassword(email: string) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}

export async function createPost(input: { caption: string; tags: string[] }, token: string) {
  const payload = await request(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        caption: input.caption,
        media: [],
        tags: input.tags,
      }),
    },
    token,
  );
  return payload;
}

export async function uploadAsset(
  file: File,
  token: string,
  input?: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  },
) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is missing. Configure the public web frontend before making API requests.',
    );
  }

  const formData = new FormData();
  formData.set('file', file);
  if (input?.folder) {
    formData.set('folder', input.folder);
  }
  if (input?.publicId) {
    formData.set('publicId', input.publicId);
  }
  if (input?.resourceType) {
    formData.set('resourceType', input.resourceType);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (error) {
    const wrappedError = new Error(buildNetworkErrorMessage(error)) as Error & { cause?: unknown };
    wrappedError.cause = error;
    throw wrappedError;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (isRecord(body) && typeof body.message === 'string' && body.message) ||
      `Upload failed with ${response.status}`;
    throw new Error(message);
  }

  const record = pickObject(body);
  const url =
    asText((record.upload as JsonRecord | undefined)?.secureUrl) ||
    asText((record.upload as JsonRecord | undefined)?.url) ||
    asText(record.secureUrl) ||
    asText(record.url) ||
    asText(record.remotePath) ||
    asText(record.fileUrl);

  if (!url) {
    throw new Error('Upload completed but the backend did not return a usable file URL.');
  }

  return {
    url,
    uploadId: asText((record.upload as JsonRecord | undefined)?.id),
  };
}

export async function createPostWithMedia(
  input: { caption: string; tags: string[]; media: string[] },
  token: string,
) {
  const payload = await request(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        caption: input.caption,
        media: input.media,
        tags: input.tags,
      }),
    },
    token,
  );
  return payload;
}

export async function createPostComment(postId: string, message: string, token: string) {
  return request(
    `/posts/${postId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    token,
  );
}

export async function togglePostLike(postId: string, liked: boolean, token: string) {
  return request(
    `/posts/${postId}/${liked ? 'like' : 'unlike'}`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function joinCommunity(id: string, token: string) {
  return request(
    `/communities/${id}/join`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function createCommunity(
  input: { name: string; description: string; category?: string; privacy?: string },
  token: string,
) {
  return request(
    '/communities',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function createEvent(
  input: { title: string; location?: string; date?: string },
  token: string,
) {
  return request(
    '/events',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function createPage(
  input: {
    ownerId: string;
    name: string;
    about: string;
    category: string;
    location?: string;
    contactLabel?: string;
  },
  token: string,
) {
  return request(
    '/pages/create',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function togglePageFollow(pageId: string, token: string) {
  return request(
    `/pages/${pageId}/follow`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function createJob(
  input: {
    title: string;
    company: string;
    location: string;
    salary: string;
    type?: string;
    experienceLevel?: string;
  },
  token: string,
) {
  return request(
    '/jobs/create',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function createMarketplaceProduct(
  input: {
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory: string;
    sellerId: string;
    sellerName: string;
    location: string;
    condition: string;
    images?: string[];
  },
  token: string,
) {
  return request(
    '/marketplace/products',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function markNotificationRead(id: string, token: string) {
  return request(
    `/notifications/${id}/read`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function toggleEventRsvp(eventId: string, token: string) {
  return request(
    `/events/${eventId}/rsvp`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function toggleEventSave(eventId: string, token: string) {
  return request(
    `/events/${eventId}/save`,
    {
      method: 'PATCH',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function fetchBookmarkIds(token: string) {
  const payload = await request('/bookmarks', {}, token);
  return pickList(payload, 'bookmarks')
    .filter((item) => isRecord(item) && asText(item.type) === 'post')
    .map((item) => asText((item as JsonRecord).id))
    .filter(Boolean);
}

export async function togglePostSave(postId: string, saved: boolean, token: string) {
  if (saved) {
    return request(
      `/bookmarks/${postId}`,
      {
        method: 'DELETE',
      },
      token,
    );
  }

  return request(
    `/bookmarks/posts/${postId}`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function fetchProfile(token: string) {
  const payload = await request('/profile', {}, token);
  return normalizeProfile(payload);
}

export async function updateProfile(
  input: {
    name?: string;
    headline?: string;
    location?: string;
    website?: string;
    about?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
  },
  token: string,
) {
  return request(
    '/user-profile/edit',
    {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        bio: input.about,
        avatarUrl: input.avatarUrl,
        location: input.location,
        website: input.website,
        coverImageUrl: input.coverImageUrl,
      }),
    },
    token,
  );
}

export async function fetchConnections(token: string) {
  const [followersPayload, followingPayload] = await Promise.all([
    request('/user-profile/followers', {}, token),
    request('/user-profile/following', {}, token),
  ]);

  const followers = pickList(followersPayload).map((item) => normalizeConnection(item, 'mentor'));
  const following = pickList(followingPayload).map((item) =>
    normalizeConnection(item, 'following'),
  );
  const merged = [...followers, ...following];
  const unique = new Map(merged.map((item) => [item.user.id, item]));
  return [...unique.values()];
}

export async function toggleFollowUser(id: string, shouldFollow: boolean, token: string) {
  return request(
    `/users/${id}/${shouldFollow ? 'follow' : 'unfollow'}`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function fetchChatThreads(token: string, viewerId: string) {
  const payload = await request('/chat/threads', {}, token);
  const threads = pickList(payload, 'threads');
  const withMessages = await Promise.all(
    threads.map(async (thread) => {
      const id = asText((thread as JsonRecord).id);
      const messagesPayload = await request(`/chat/threads/${id}/messages`, {}, token);
      const messages = pickList(messagesPayload, 'messages');
      return normalizeChatThread(thread, viewerId, messages);
    }),
  );
  return withMessages;
}

export async function sendThreadMessage(threadId: string, text: string, token: string) {
  return request(
    `/chat/threads/${threadId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ text }),
    },
    token,
  );
}

export async function fetchSettings(token: string) {
  const payload = await request('/settings/state', {}, token);
  return normalizeSettings(payload);
}

export async function fetchMarketplace(token?: string) {
  const payload = await request('/marketplace/products', {}, token);
  return pickList(payload, 'products').map(normalizeMarketplaceItem);
}

export async function fetchEvents() {
  const payload = await request('/events');
  return pickList(payload, 'events').map(normalizeEvent);
}

export async function fetchPages() {
  const payload = await request('/pages');
  return pickList(payload, 'pages').map(normalizePage);
}

export async function fetchCalls(token: string) {
  const payload = await request('/calls', {}, token);
  return pickList(payload, 'calls').map(normalizeCall);
}

export async function fetchLiveStreams() {
  const payload = await request('/live-streams');
  return pickList(payload, 'streams').map(normalizeLiveStream);
}

export async function fetchDashboard(token?: string, searchQuery?: string) {
  const [usersPayload, feedPayload, storiesPayload, reelsPayload, jobsPayload, communitiesPayload, trendingPayload, notificationsPayload, searchPayload] =
    await Promise.all([
      request('/users'),
      request('/feed'),
      request('/stories'),
      request('/reels'),
      request('/jobs', {}, token),
      request('/communities'),
      request('/trending'),
      request('/notifications', {}, token),
      searchQuery?.trim()
        ? request(`/search-discovery?q=${encodeURIComponent(searchQuery.trim())}&limit=8`)
        : Promise.resolve({ data: { results: [] } }),
    ]);

  const users = pickList(usersPayload).map(normalizeUser);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const posts = pickList(feedPayload, 'posts').map((item) => normalizePost(item, usersById));
  const stories = pickList(storiesPayload, 'stories').map((item, index) =>
    normalizeStory(item, usersById, index),
  );
  const reels = pickList(reelsPayload, 'reels').map(normalizeReel);

  const jobs = pickList(jobsPayload, 'jobs').map(normalizeJob);

  const communities = pickList(communitiesPayload, 'communities').map(normalizeCommunity);

  const trends = pickList(trendingPayload).map(normalizeTrend);

  const notificationsObject = pickObject(notificationsPayload);
  const notifications = pickList(notificationsObject, 'notifications').map(normalizeNotification);

  const searchObject = pickObject(searchPayload);
  const search = pickList(searchObject, 'results').map(normalizeSearchItem);

  return {
    userSuggestions: users.slice(0, 6),
    stories,
    posts,
    reels,
    jobs: jobs.slice(0, 6),
    communities: communities.slice(0, 6),
    trends: trends.slice(0, 6),
    notifications: notifications.slice(0, 6),
    search: search.slice(0, 8),
    stats: {
      posts: posts.length,
      stories: stories.length,
      reels: reels.length,
      communities: communities.length,
      jobs: jobs.length,
      notifications: notifications.length,
    },
  } satisfies DashboardData;
}

export function buildExploreClusters(data: {
  search: SearchItemView[];
  trends: TrendView[];
  jobs: JobView[];
  communities: CommunityView[];
}) {
  return deriveExplore(data.search, data.trends, data.jobs, data.communities);
}

export async function fetchSavedCollections(token: string) {
  const payload = await request('/saved-collections', {}, token);
  return pickList(payload, 'collections');
}

export async function createSavedCollection(
  input: { name: string; privacy?: string; itemIds?: string[] },
  token: string,
) {
  return request(
    '/saved-collections',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function fetchDraftsScheduling(token: string) {
  const payload = await request('/drafts-scheduling', {}, token);
  return pickObject(payload);
}

export async function fetchGroups() {
  const payload = await request('/groups');
  return pickList(payload, 'groups');
}

export async function fetchGroupChats(token: string) {
  const payload = await request('/group-chat', {}, token);
  return pickList(payload, 'groups');
}

export async function fetchCreatorDashboard(token: string) {
  const payload = await request('/creator-dashboard', {}, token);
  return pickObject(payload);
}

export async function fetchWalletPayments(token: string) {
  const payload = await request('/wallet-payments', {}, token);
  return pickObject(payload);
}

export async function fetchPremiumMembership() {
  const payload = await request('/premium-membership');
  return pickList(payload);
}

export async function fetchSubscriptions(token: string) {
  const payload = await request('/subscriptions', {}, token);
  return pickList(payload, 'subscriptions');
}

export async function changeSubscriptionPlan(planId: string, token: string) {
  return request(
    '/subscriptions/change-plan',
    {
      method: 'POST',
      body: JSON.stringify({ planId }),
    },
    token,
  );
}

export async function cancelSubscription(subscriptionId: string, token: string) {
  return request(
    '/subscriptions/cancel',
    {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    },
    token,
  );
}

export async function renewSubscription(subscriptionId: string, token: string) {
  return request(
    '/subscriptions/renew',
    {
      method: 'POST',
      body: JSON.stringify({ subscriptionId }),
    },
    token,
  );
}

export async function fetchSupportHelp(token?: string) {
  const payload = await request('/support-help', {}, token);
  return pickObject(payload);
}

export async function createSupportTicket(
  input: { subject: string; category: string; message: string; priority?: string },
  token: string,
) {
  return request(
    '/support/tickets',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    token,
  );
}

export async function sendSupportHelpMessage(message: string, token: string) {
  return request(
    '/support-help/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    token,
  );
}

export async function fetchVerificationOverview(token: string) {
  const [requestPayload, statusPayload, documentsPayload] = await Promise.all([
    request('/verification-request', {}, token),
    request('/verification-request/status', {}, token),
    request('/verification-request/documents', {}, token),
  ]);

  return {
    request: pickObject(requestPayload),
    status: pickObject(statusPayload),
    documents: pickList(documentsPayload, 'documents'),
  };
}

export async function toggleVerificationDocument(documentName: string, token: string) {
  return request(
    '/verification-request/documents',
    {
      method: 'PATCH',
      body: JSON.stringify({ documentName }),
    },
    token,
  );
}

export async function submitVerificationDocuments(documents: string[], token: string) {
  return request(
    '/verification-request/submit',
    {
      method: 'POST',
      body: JSON.stringify({ documents }),
    },
    token,
  );
}

export async function fetchActivitySessions(token: string) {
  const [sessionsPayload, historyPayload] = await Promise.all([
    request('/activity-sessions', {}, token),
    request('/activity-sessions/history', {}, token),
  ]);

  return {
    sessions: pickList(sessionsPayload, 'sessions'),
    history: pickList(historyPayload),
  };
}

export async function logoutOtherDevices(token: string) {
  return request(
    '/activity-sessions/logout-others',
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    token,
  );
}

export async function revokeActivitySession(id: string, token: string) {
  return request(
    `/activity-sessions/${id}`,
    {
      method: 'DELETE',
    },
    token,
  );
}

export async function fetchAccountSwitching(token: string) {
  const [accountsPayload, activePayload] = await Promise.all([
    request('/account-switching', {}, token),
    request('/account-switching/active', {}, token),
  ]);

  return {
    accounts: pickList(accountsPayload, 'accounts'),
    active: pickObject(activePayload),
  };
}

export async function setActiveAccount(accountId: string, token: string) {
  return request(
    '/account-switching/active',
    {
      method: 'PATCH',
      body: JSON.stringify({ accountId }),
    },
    token,
  );
}

export async function fetchBlockedUsers(token: string) {
  const payload = await request('/block', {}, token);
  return pickList(payload, 'users');
}

export async function unblockUser(targetId: string, token: string) {
  return request(
    `/block/${targetId}`,
    {
      method: 'DELETE',
    },
    token,
  );
}

export async function fetchInviteReferral(token: string) {
  const payload = await request('/invite-referral', {}, token);
  return pickObject(payload);
}

export async function fetchArchiveOverview(token: string) {
  const [postsPayload, storiesPayload, reelsPayload] = await Promise.all([
    request('/archive/posts', {}, token),
    request('/archive/stories', {}, token),
    request('/archive/reels', {}, token),
  ]);

  return {
    posts: pickList(postsPayload),
    stories: pickList(storiesPayload),
    reels: pickList(reelsPayload),
  };
}
