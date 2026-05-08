import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildExploreClusters,
  createPost as createPostApi,
  createPostComment as createPostCommentApi,
  fetchCalls,
  fetchDashboard,
  fetchConnections,
  fetchEvents,
  fetchChatThreads,
  fetchLiveStreams,
  fetchMarketplace,
  fetchMe,
  fetchPages,
  fetchProfile,
  fetchSettings,
  forgotPassword as forgotPasswordApi,
  login as loginApi,
  markNotificationRead as markNotificationReadApi,
  joinCommunity as joinCommunityApi,
  sendThreadMessage as sendThreadMessageApi,
  signup as signupApi,
  toggleFollowUser as toggleFollowUserApi,
  updateProfile as updateProfileApi,
} from '../lib/api';
import { readSession, writeSession } from '../lib/session';
import {
  AppNotification,
  AuthResult,
  DashboardData,
  SessionState,
  SocialAppData,
  SocialAppState,
  SocialPost,
  SettingsGroup,
  ViewerUser,
} from '../types';

function createEmptyViewer(overrides: Partial<ViewerUser> = {}): ViewerUser {
  return {
    id: overrides.id ?? '',
    name: overrides.name ?? '',
    username: overrides.username ?? '',
    email: overrides.email ?? '',
    avatar: overrides.avatar ?? '',
    bio: overrides.bio ?? '',
    role: overrides.role ?? 'Member',
    verified: overrides.verified ?? false,
    followers: overrides.followers ?? 0,
    following: overrides.following ?? 0,
    location: overrides.location ?? '',
    website: overrides.website ?? '',
    coverImage: overrides.coverImage ?? '',
    headline: overrides.headline ?? '',
  };
}

function createEmptyData(viewer: ViewerUser): SocialAppData {
  return {
    stories: [],
    posts: [],
    reels: [],
    marketplace: [],
    suggestions: [],
    trends: [],
    notifications: [],
    chats: [],
    calls: [],
    liveStreams: [],
    connections: [],
    explore: [],
    profile: {
      user: viewer,
      coverImage: viewer.coverImage ?? '',
      headline: viewer.headline ?? '',
      about: viewer.bio ?? '',
      location: viewer.location ?? '',
      website: viewer.website ?? '',
      joinedLabel: '',
      skills: [],
      metrics: [
        { label: 'Followers', value: String(viewer.followers ?? 0) },
        { label: 'Following', value: String(viewer.following ?? 0) },
        { label: 'Posts', value: '0' },
        { label: 'Verified', value: viewer.verified ? 'Yes' : 'No' },
      ],
      highlights: [],
    },
    jobs: [],
    events: [],
    communities: [],
    pages: [],
    settings: [],
  };
}

function makeFeedPost(post: DashboardData['posts'][number]): SocialPost {
  const media = post.image
    ? [
        {
          id: `${post.id}-media`,
          type: 'image' as const,
          url: post.image,
          alt: post.headline,
        },
      ]
    : [];

  return {
    ...post,
    media,
    liked: false,
    saved: false,
    visibility: 'public',
    commentsList: [],
  };
}

function makeNotification(notification: DashboardData['notifications'][number]): AppNotification {
  return {
    ...notification,
    icon: notification.unread ? 'sparkles' : 'message',
    cta: notification.unread ? 'View update' : undefined,
  };
}

function mergeDashboardIntoData(
  base: SocialAppData,
  dashboard: DashboardData,
  viewer: ViewerUser,
  extras?: {
    chats?: SocialAppData['chats'];
    connections?: SocialAppData['connections'];
    profile?: SocialAppData['profile'];
    settings?: SettingsGroup[];
    marketplace?: SocialAppData['marketplace'];
    events?: SocialAppData['events'];
    pages?: SocialAppData['pages'];
    calls?: SocialAppData['calls'];
    liveStreams?: SocialAppData['liveStreams'];
  },
): SocialAppData {
  const explore = buildExploreClusters({
    search: dashboard.search,
    trends: dashboard.trends,
    jobs: dashboard.jobs,
    communities: dashboard.communities,
  });

  return {
    ...base,
    stories: dashboard.stories.length > 0 ? dashboard.stories : base.stories,
    posts: dashboard.posts.length > 0 ? dashboard.posts.map(makeFeedPost) : base.posts,
    reels: dashboard.reels.length > 0 ? dashboard.reels : base.reels,
    suggestions:
      dashboard.userSuggestions.length > 0
        ? dashboard.userSuggestions.map((user, index) => ({
            id: `suggestion-api-${user.id}`,
            user,
            reason: ['Because you searched similar people', 'Popular in your network', 'Suggested from your communities'][index % 3],
            mutualCount: 3 + index * 2,
            following: false,
          }))
        : base.suggestions,
    trends:
      dashboard.trends.length > 0
        ? dashboard.trends.map((trend) => ({ ...trend, category: 'Live' }))
        : base.trends,
    notifications:
      dashboard.notifications.length > 0
        ? dashboard.notifications.map(makeNotification)
        : base.notifications,
    chats: extras?.chats?.length ? extras.chats : base.chats,
    calls: extras?.calls?.length ? extras.calls : base.calls,
    liveStreams: extras?.liveStreams?.length ? extras.liveStreams : base.liveStreams,
    connections: extras?.connections?.length ? extras.connections : base.connections,
    explore: explore.length > 0 ? explore : base.explore,
    profile: extras?.profile ?? {
      ...base.profile,
      user: {
        ...base.profile.user,
        ...viewer,
      },
    },
    jobs: dashboard.jobs.length > 0 ? dashboard.jobs : base.jobs,
    marketplace: extras?.marketplace?.length ? extras.marketplace : base.marketplace,
    events: extras?.events?.length ? extras.events : base.events,
    communities: dashboard.communities.length > 0 ? dashboard.communities : base.communities,
    pages: extras?.pages?.length ? extras.pages : base.pages,
    settings: extras?.settings?.length ? extras.settings : base.settings,
  };
}

function includesSearch(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function useSocialApp(): SocialAppState {
  const [session, setSession] = useState<SessionState | null>(() => readSession());
  const [data, setData] = useState<SocialAppData>(() =>
    createEmptyData(readSession()?.user ?? createEmptyViewer()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState('');

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const activeSession = readSession();
    const fallbackViewer = activeSession?.user ?? createEmptyViewer();
    const baseData = createEmptyData(fallbackViewer);

    if (options?.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (!activeSession?.accessToken) {
        setData(baseData);
        setLoadError(null);
        return;
      }

      let viewer = activeSession.user;
      let chats = baseData.chats;
      let connections = baseData.connections;
      let profile = baseData.profile;
      let settings = baseData.settings;
      let marketplace = baseData.marketplace;
      let events = baseData.events;
      let pages = baseData.pages;
      let calls = baseData.calls;
      let liveStreams = baseData.liveStreams;

      viewer = await fetchMe(activeSession.accessToken);
      const nextSession = { ...activeSession, user: viewer };
      setSession(nextSession);
      writeSession(nextSession);
      const [profilePayload, chatPayload, connectionPayload, settingsPayload, marketplacePayload, eventsPayload, pagesPayload, callsPayload, liveStreamsPayload] =
        await Promise.all([
          fetchProfile(activeSession.accessToken),
          fetchChatThreads(activeSession.accessToken, viewer.id),
          fetchConnections(activeSession.accessToken),
          fetchSettings(activeSession.accessToken),
          fetchMarketplace(activeSession.accessToken),
          fetchEvents(),
          fetchPages(),
          fetchCalls(activeSession.accessToken),
          fetchLiveStreams(),
        ]);
      profile = profilePayload;
      chats = chatPayload;
      connections = connectionPayload;
      settings = settingsPayload;
      marketplace = marketplacePayload;
      events = eventsPayload;
      pages = pagesPayload;
      calls = callsPayload;
      liveStreams = liveStreamsPayload;

      const dashboard = await fetchDashboard(activeSession.accessToken, '');
      setData(
        mergeDashboardIntoData(baseData, dashboard, viewer, {
          chats,
          connections,
          profile,
          settings,
          marketplace,
          events,
          pages,
          calls,
          liveStreams,
        }),
      );
      setLoadError(null);
    } catch (error) {
      setData(baseData);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load your social workspace right now.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.trim();

    return {
      ...data,
      posts: data.posts.filter(
        (post) =>
          includesSearch(post.content, query) ||
          includesSearch(post.user.name, query) ||
          post.tags.some((tag) => includesSearch(tag, query)),
      ),
      suggestions: data.suggestions.filter(
        (item) => includesSearch(item.user.name, query) || includesSearch(item.reason, query),
      ),
      trends: data.trends.filter(
        (trend) => includesSearch(trend.topic, query) || includesSearch(trend.detail, query),
      ),
      notifications: data.notifications.filter(
        (notification) =>
          includesSearch(notification.title, query) || includesSearch(notification.body, query),
      ),
      explore: data.explore.filter(
        (cluster) =>
          includesSearch(cluster.title, query) || includesSearch(cluster.description, query),
      ),
      connections: data.connections.filter(
        (connection) =>
          includesSearch(connection.user.name, query) || includesSearch(connection.note, query),
      ),
      marketplace: data.marketplace.filter(
        (item) =>
          includesSearch(item.title, query) ||
          includesSearch(item.description, query) ||
          includesSearch(item.sellerName, query),
      ),
      events: data.events.filter(
        (item) =>
          includesSearch(item.title, query) ||
          includesSearch(item.description, query) ||
          includesSearch(item.location, query),
      ),
      communities: data.communities.filter(
        (item) =>
          includesSearch(item.name, query) ||
          includesSearch(item.description, query) ||
          item.tags.some((tag) => includesSearch(tag, query)),
      ),
      pages: data.pages.filter(
        (item) =>
          includesSearch(item.name, query) ||
          includesSearch(item.description, query) ||
          includesSearch(item.category, query),
      ),
      calls: data.calls.filter(
        (item) => includesSearch(item.name, query) || includesSearch(item.type, query),
      ),
      liveStreams: data.liveStreams.filter(
        (item) =>
          includesSearch(item.title, query) ||
          includesSearch(item.hostName, query) ||
          includesSearch(item.category, query),
      ),
    };
  }, [data, searchQuery]);

  async function login(email: string, password: string): Promise<AuthResult> {
    setAuthMessage(null);

    if (!email.trim() || !password.trim()) {
      return { ok: false, message: 'Enter both email and password.' };
    }

    try {
      const nextSession = await loginApi(email.trim(), password);
      setSession(nextSession);
      writeSession(nextSession);
      setAuthMessage('Signed in successfully.');
      await refresh({ silent: true });
      return { ok: true, message: 'Signed in successfully.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign in right now.';
      setAuthMessage(message);
      return { ok: false, message };
    }
  }

  async function register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    if (!input.name.trim() || !input.email.trim() || !input.password.trim()) {
      return { ok: false, message: 'Complete all fields to create an account.' };
    }

    try {
      const nextSession = await signupApi({
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password,
      });
      setSession(nextSession);
      writeSession(nextSession);
      setAuthMessage('Account created successfully.');
      await refresh({ silent: true });
      return { ok: true, message: 'Account created successfully.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create this account right now.';
      setAuthMessage(message);
      return { ok: false, message };
    }
  }

  async function sendResetLink(email: string): Promise<AuthResult> {
    if (!email.trim()) {
      return { ok: false, message: 'Enter your email to continue.' };
    }

    try {
      await forgotPasswordApi(email.trim());
      setAuthMessage(`Password reset instructions were sent to ${email.trim()}.`);
      return { ok: true, message: 'Reset instructions are ready.' };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to send password reset instructions right now.';
      setAuthMessage(message);
      return { ok: false, message };
    }
  }

  function logout() {
    setSession(null);
    writeSession(null);
    const fallback = createEmptyData(createEmptyViewer());
    setData(fallback);
    setSelectedChatId('');
    setAuthMessage('Signed out successfully.');
  }

  async function createPost(input: { content: string; mediaType: 'text' | 'image' | 'video' }): Promise<AuthResult> {
    if (!input.content.trim()) {
      return { ok: false, message: 'Write something before posting.' };
    }
    if (!session?.accessToken) {
      return { ok: false, message: 'Sign in to publish posts.' };
    }
    if (input.mediaType !== 'text') {
      return {
        ok: false,
        message: 'Web post attachments are not wired yet. Publish a text update for now.',
      };
    }
    const tags = input.content.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.replace('#', '')) ?? [];

    try {
      await createPostApi({ caption: input.content.trim(), tags }, session.accessToken);
      await refresh({ silent: true });
      return { ok: true, message: 'Post published from backend data.' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to publish this post right now.',
      };
    }
  }

  function updatePost(postId: string, updater: (post: SocialPost) => SocialPost) {
    setData((current) => ({
      ...current,
      posts: current.posts.map((post) => (post.id === postId ? updater(post) : post)),
    }));
  }

  function toggleLike(postId: string) {
    updatePost(postId, (post) => ({
      ...post,
      liked: !post.liked,
      likes: post.likes + (post.liked ? -1 : 1),
    }));
  }

  function toggleSave(postId: string) {
    updatePost(postId, (post) => ({
      ...post,
      saved: !post.saved,
    }));
  }

  async function addComment(postId: string, message: string) {
    if (!message.trim()) {
      return;
    }
    if (!session?.accessToken) {
      return;
    }
    await createPostCommentApi(postId, message.trim(), session.accessToken);
    await refresh({ silent: true });
  }

  function markNotificationRead(notificationId: string) {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, unread: false } : notification,
      ),
    }));

    if (session?.accessToken) {
      void markNotificationReadApi(notificationId, session.accessToken).catch(() => undefined);
    }
  }

  async function sendMessage(chatId: string, message: string) {
    if (!message.trim()) {
      return;
    }
    if (session?.accessToken) {
      await sendThreadMessageApi(chatId, message.trim(), session.accessToken);
      await refresh({ silent: true });
    }
  }

  function toggleFollowSuggestion(suggestionId: string) {
    const suggestion = data.suggestions.find((item) => item.id === suggestionId);
    if (!suggestion) {
      return;
    }

    const nextFollowing = !suggestion.following;

    setData((current) => ({
      ...current,
      suggestions: current.suggestions.map((item) =>
        item.id === suggestionId ? { ...item, following: nextFollowing } : item,
      ),
    }));

    if (session?.accessToken) {
      void toggleFollowUserApi(suggestion.user.id, nextFollowing, session.accessToken).catch(
        () => undefined,
      );
    }
  }

  async function joinCommunity(communityId: string) {
    if (!session?.accessToken) {
      return;
    }

    setData((current) => ({
      ...current,
      communities: current.communities.map((community) =>
        community.id === communityId
          ? {
              ...community,
              joined: true,
              memberCount: community.joined ? community.memberCount : community.memberCount + 1,
            }
          : community,
      ),
    }));

    try {
      await joinCommunityApi(communityId, session.accessToken);
      await refresh({ silent: true });
    } catch (error) {
      setData((current) => ({
        ...current,
        communities: current.communities.map((community) =>
          community.id === communityId
            ? {
                ...community,
                joined: false,
                memberCount: community.joined ? community.memberCount : Math.max(0, community.memberCount - 1),
              }
            : community,
        ),
      }));
      setAuthMessage(
        error instanceof Error ? error.message : 'Unable to join this community right now.',
      );
    }
  }

  function updateProfile(
    input: Partial<ViewerUser> & { about?: string; website?: string; location?: string },
  ) {
    setData((current) => ({
      ...current,
      profile: {
        ...current.profile,
        user: {
          ...current.profile.user,
          ...input,
          bio: input.about ?? input.bio ?? current.profile.user.bio,
        },
        about: input.about ?? current.profile.about,
        website: input.website ?? current.profile.website,
        location: input.location ?? current.profile.location,
      },
    }));

    if (session) {
      const nextSession = {
        ...session,
        user: {
          ...session.user,
          ...input,
          bio: input.about ?? input.bio ?? session.user.bio,
        },
      };
      setSession(nextSession);
      writeSession(nextSession);
    }

    if (session?.accessToken) {
      void updateProfileApi(
        {
          name: input.name,
          headline: input.headline,
          location: input.location,
          website: input.website,
          about: input.about,
        },
        session.accessToken,
      )
        .then(() => refresh({ silent: true }))
        .catch(() => undefined);
    }
  }

  useEffect(() => {
    if (!filteredData.chats.find((chat) => chat.id === selectedChatId)) {
      setSelectedChatId(filteredData.chats[0]?.id ?? '');
    }
  }, [filteredData.chats, selectedChatId]);

  return {
    session,
    data: filteredData,
    isLoading,
    isRefreshing,
    loadError,
    authMessage,
    searchQuery,
    selectedChatId,
    setSearchQuery,
    refresh,
    login,
    register,
    sendResetLink,
    logout,
    createPost,
    toggleLike,
    toggleSave,
    addComment,
    markNotificationRead,
    setSelectedChatId,
    sendMessage,
    toggleFollowSuggestion,
    joinCommunity,
    updateProfile,
  };
}
