import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildExploreClusters,
  createPost as createPostApi,
  createPostWithMedia as createPostWithMediaApi,
  createPostComment as createPostCommentApi,
  fetchCalls,
  fetchBookmarkIds,
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
  joinCommunity as joinCommunityApi,
  login as loginApi,
  markNotificationRead as markNotificationReadApi,
  sendThreadMessage as sendThreadMessageApi,
  signup as signupApi,
  toggleEventRsvp as toggleEventRsvpApi,
  toggleEventSave as toggleEventSaveApi,
  toggleFollowUser as toggleFollowUserApi,
  togglePageFollow as togglePageFollowApi,
  togglePostLike as togglePostLikeApi,
  togglePostSave as togglePostSaveApi,
  uploadAsset as uploadAssetApi,
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
    role: overrides.role ?? '',
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
    saved: Boolean(post.saved),
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
  dashboard: DashboardData | null,
  viewer: ViewerUser,
  extras?: {
    savedPostIds?: string[];
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
  const explore = dashboard
    ? buildExploreClusters({
        search: dashboard.search,
        trends: dashboard.trends,
        jobs: dashboard.jobs,
        communities: dashboard.communities,
      })
    : base.explore;

  return {
    ...base,
    stories: dashboard?.stories ?? base.stories,
    posts:
      dashboard?.posts
        ? dashboard.posts.map((post) =>
            makeFeedPost({
              ...post,
              saved: extras?.savedPostIds
                ? extras.savedPostIds.includes(post.id)
                : Boolean(post.saved),
            }),
          )
        : base.posts,
    reels: dashboard?.reels ?? base.reels,
    suggestions:
      dashboard?.userSuggestions
        ? dashboard.userSuggestions.map((user) => ({
            id: `suggestion-api-${user.id}`,
            user,
            reason: user.bio || user.location || user.role,
            following: false,
          }))
        : base.suggestions,
    trends:
      dashboard?.trends
        ? dashboard.trends.map((trend) => ({ ...trend, category: 'Live' }))
        : base.trends,
    notifications:
      dashboard?.notifications
        ? dashboard.notifications.map(makeNotification)
        : base.notifications,
    chats: extras?.chats ?? base.chats,
    calls: extras?.calls ?? base.calls,
    liveStreams: extras?.liveStreams ?? base.liveStreams,
    connections: extras?.connections ?? base.connections,
    explore,
    profile: extras?.profile ?? {
      ...base.profile,
      user: {
        ...base.profile.user,
        ...viewer,
      },
    },
    jobs: dashboard?.jobs ?? base.jobs,
    marketplace: extras?.marketplace ?? base.marketplace,
    events: extras?.events ?? base.events,
    communities: dashboard?.communities ?? base.communities,
    pages: extras?.pages ?? base.pages,
    settings: extras?.settings ?? base.settings,
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
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

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

      const viewer = await fetchMe(activeSession.accessToken);
      const nextSession = { ...activeSession, user: viewer };
      setSession(nextSession);
      writeSession(nextSession);

      const currentDataSnapshot = dataRef.current;
      const requests = await Promise.allSettled([
        fetchProfile(activeSession.accessToken),
        fetchChatThreads(activeSession.accessToken, viewer.id),
        fetchConnections(activeSession.accessToken),
        fetchSettings(activeSession.accessToken),
        fetchBookmarkIds(activeSession.accessToken),
        fetchMarketplace(activeSession.accessToken),
        fetchEvents(),
        fetchPages(),
        fetchCalls(activeSession.accessToken),
        fetchLiveStreams(),
        fetchDashboard(activeSession.accessToken, ''),
      ]);

      const [
        profileResult,
        chatsResult,
        connectionsResult,
        settingsResult,
        bookmarkIdsResult,
        marketplaceResult,
        eventsResult,
        pagesResult,
        callsResult,
        liveStreamsResult,
        dashboardResult,
      ] = requests;

      const savedPostIds =
        bookmarkIdsResult.status === 'fulfilled'
          ? bookmarkIdsResult.value
          : currentDataSnapshot.posts.filter((post) => post.saved).map((post) => post.id);

      const dashboard = dashboardResult.status === 'fulfilled' ? dashboardResult.value : null;

      setData(
        mergeDashboardIntoData(currentDataSnapshot, dashboard, viewer, {
          savedPostIds,
          chats: chatsResult.status === 'fulfilled' ? chatsResult.value : undefined,
          connections:
            connectionsResult.status === 'fulfilled' ? connectionsResult.value : undefined,
          profile:
            profileResult.status === 'fulfilled'
              ? profileResult.value
              : {
                  ...currentDataSnapshot.profile,
                  user: viewer,
                },
          settings: settingsResult.status === 'fulfilled' ? settingsResult.value : undefined,
          marketplace:
            marketplaceResult.status === 'fulfilled'
              ? marketplaceResult.value
              : undefined,
          events: eventsResult.status === 'fulfilled' ? eventsResult.value : undefined,
          pages: pagesResult.status === 'fulfilled' ? pagesResult.value : undefined,
          calls: callsResult.status === 'fulfilled' ? callsResult.value : undefined,
          liveStreams:
            liveStreamsResult.status === 'fulfilled'
              ? liveStreamsResult.value
              : undefined,
        }),
      );

      const failedSlices: string[] = ([
        ['profile', profileResult],
        ['messages', chatsResult],
        ['connections', connectionsResult],
        ['settings', settingsResult],
        ['saved posts', bookmarkIdsResult],
        ['marketplace', marketplaceResult],
        ['events', eventsResult],
        ['pages', pagesResult],
        ['calls', callsResult],
        ['live streams', liveStreamsResult],
        ['dashboard feed', dashboardResult],
      ] as const)
        .filter(([, result]) => result.status === 'rejected')
        .map(([label]) => label);

      setLoadError(
        failedSlices.length > 0
          ? `Some live sections could not be refreshed: ${failedSlices.join(', ')}. Existing backend data was preserved for those areas until the next successful sync.`
          : null,
      );
    } catch (error) {
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

  const runAuthenticatedAction = useCallback(
    async (
      action: () => Promise<void>,
      options: {
        missingAuthMessage: string;
        successMessage?: string;
        errorMessage?: string;
        refreshAfter?: boolean;
      },
    ) => {
      if (!session?.accessToken) {
        setAuthMessage(options.missingAuthMessage);
        return false;
      }

      try {
        await action();
        if (options.refreshAfter !== false) {
          await refresh({ silent: true });
        }
        if (options.successMessage) {
          setAuthMessage(options.successMessage);
        }
        return true;
      } catch (error) {
        setAuthMessage(
          error instanceof Error
            ? error.message
            : (options.errorMessage ?? 'Unable to complete this action right now.'),
        );
        return false;
      }
    },
    [refresh, session?.accessToken],
  );

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
        (item) => includesSearch(item.user.name, query) || includesSearch(item.reason ?? '', query),
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

  async function createPost(input: {
    content: string;
    mediaType: 'text' | 'image' | 'video';
    files?: File[];
  }): Promise<AuthResult> {
    if (!input.content.trim()) {
      return { ok: false, message: 'Write something before posting.' };
    }
    if (!session?.accessToken) {
      return { ok: false, message: 'Sign in to publish posts.' };
    }
    const tags = input.content.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.replace('#', '')) ?? [];

    try {
      const files = input.files?.filter((file) => file.size > 0) ?? [];
      if (input.mediaType !== 'text' && files.length === 0) {
        return {
          ok: false,
          message: `Choose at least one ${input.mediaType} file before publishing.`,
        };
      }

      if (files.length === 0) {
        await createPostApi({ caption: input.content.trim(), tags }, session.accessToken);
      } else {
        const uploadedMedia = await Promise.all(
          files.map((file, index) =>
            uploadAssetApi(file, session.accessToken, {
              folder: `optizenqor/web-posts/${session.user.id || 'member'}`,
              publicId: `web-post-${Date.now()}-${index}`,
              resourceType: input.mediaType === 'video' ? 'video' : 'image',
            }),
          ),
        );
        await createPostWithMediaApi(
          {
            caption: input.content.trim(),
            tags,
            media: uploadedMedia.map((item) => item.url),
          },
          session.accessToken,
        );
      }
      await refresh({ silent: true });
      return {
        ok: true,
        message:
          files.length > 0 ? 'Post with uploaded media published from backend data.' : 'Post published from backend data.',
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to publish this post right now.',
      };
    }
  }

  async function toggleLike(postId: string) {
    const previousPost = data.posts.find((item) => item.id === postId);
    if (!previousPost) {
      return;
    }

    await runAuthenticatedAction(
      async () => {
        await togglePostLikeApi(postId, !previousPost.liked, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to like posts.',
        errorMessage: 'Unable to update post like right now.',
      },
    );
  }

  async function toggleSave(postId: string) {
    const previousPost = data.posts.find((item) => item.id === postId);
    if (!previousPost) {
      return;
    }

    await runAuthenticatedAction(
      async () => {
        await togglePostSaveApi(postId, previousPost.saved, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to save posts.',
        errorMessage: 'Unable to update saved post state right now.',
      },
    );
  }

  async function addComment(postId: string, message: string) {
    if (!message.trim()) {
      return;
    }
    await runAuthenticatedAction(
      async () => {
        await createPostCommentApi(postId, message.trim(), session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to comment on posts.',
        errorMessage: 'Unable to post your comment right now.',
      },
    );
  }

  async function markNotificationRead(notificationId: string) {
    await runAuthenticatedAction(
      async () => {
        await markNotificationReadApi(notificationId, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to manage notifications.',
        errorMessage: 'Unable to mark this notification as read right now.',
      },
    );
  }

  async function sendMessage(chatId: string, message: string) {
    if (!message.trim()) {
      return;
    }
    await runAuthenticatedAction(
      async () => {
        await sendThreadMessageApi(chatId, message.trim(), session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to send messages.',
        errorMessage: 'Unable to send your message right now.',
      },
    );
  }

  async function toggleFollowSuggestion(suggestionId: string) {
    const suggestion = data.suggestions.find((item) => item.id === suggestionId);
    if (!suggestion) {
      return;
    }

    const nextFollowing = !suggestion.following;
    await runAuthenticatedAction(
      async () => {
        await toggleFollowUserApi(suggestion.user.id, nextFollowing, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to follow people.',
        errorMessage: 'Unable to update follow state right now.',
      },
    );
  }

  async function joinCommunity(communityId: string) {
    await runAuthenticatedAction(
      async () => {
        await joinCommunityApi(communityId, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to join communities.',
        errorMessage: 'Unable to join this community right now.',
      },
    );
  }

  async function toggleEventRsvp(eventId: string) {
    await runAuthenticatedAction(
      async () => {
        await toggleEventRsvpApi(eventId, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to RSVP to events.',
        errorMessage: 'Unable to update RSVP right now.',
      },
    );
  }

  async function toggleEventSave(eventId: string) {
    await runAuthenticatedAction(
      async () => {
        await toggleEventSaveApi(eventId, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to save events.',
        errorMessage: 'Unable to update saved event state right now.',
      },
    );
  }

  async function togglePageFollow(pageId: string) {
    await runAuthenticatedAction(
      async () => {
        await togglePageFollowApi(pageId, session!.accessToken);
      },
      {
        missingAuthMessage: 'Sign in to follow pages.',
        errorMessage: 'Unable to update page follow state right now.',
      },
    );
  }

  async function updateProfile(
    input: Partial<ViewerUser> & {
      about?: string;
      website?: string;
      location?: string;
      avatarFile?: File | null;
      coverFile?: File | null;
    },
  ): Promise<AuthResult> {
    if (!session?.accessToken) {
      return { ok: false, message: 'Sign in to update your profile.' };
    }

    try {
      let avatarUrl: string | undefined;
      let coverImageUrl: string | undefined;

      if (input.avatarFile) {
        const uploadedAvatar = await uploadAssetApi(input.avatarFile, session.accessToken, {
          folder: `optizenqor/profile/${session.user.id || 'member'}/avatar`,
          publicId: `profile-avatar-${Date.now()}`,
          resourceType: 'image',
        });
        avatarUrl = uploadedAvatar.url;
      }

      if (input.coverFile) {
        const uploadedCover = await uploadAssetApi(input.coverFile, session.accessToken, {
          folder: `optizenqor/profile/${session.user.id || 'member'}/cover`,
          publicId: `profile-cover-${Date.now()}`,
          resourceType: 'image',
        });
        coverImageUrl = uploadedCover.url;
      }

      await updateProfileApi(
        {
          name: input.name,
          headline: input.headline,
          location: input.location,
          website: input.website,
          about: input.about,
          avatarUrl,
          coverImageUrl,
        },
        session.accessToken,
      );
      await refresh({ silent: true });
      return { ok: true, message: 'Profile updated from backend data.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update your profile right now.';
      setAuthMessage(message);
      return { ok: false, message };
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
    toggleEventRsvp,
    toggleEventSave,
    togglePageFollow,
    updateProfile,
  };
}
