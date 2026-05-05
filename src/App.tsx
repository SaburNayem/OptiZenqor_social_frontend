import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import Feed from './components/Feed';
import LeftSidebar from './components/LeftSidebar';
import LoginPanel from './components/LoginPanel';
import Navbar from './components/Navbar';
import RightRail from './components/RightRail';
import { createPost, fetchDashboard, fetchMe, getApiBaseUrl, joinCommunity, login, markNotificationRead } from './lib/api';
import { readSession, writeSession } from './lib/session';
import { DashboardData, SessionState } from './types';
import './index.css';

const emptyDashboard: DashboardData = {
  userSuggestions: [],
  stories: [],
  posts: [],
  reels: [],
  jobs: [],
  communities: [],
  trends: [],
  notifications: [],
  search: [],
  stats: {
    posts: 0,
    stories: 0,
    reels: 0,
    communities: 0,
    jobs: 0,
    notifications: 0,
  },
};

function App() {
  const [session, setSession] = useState<SessionState | null>(() => readSession());
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [composerValue, setComposerValue] = useState('');
  const [createPostError, setCreatePostError] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const activeSession = readSession();
        let activeUser = activeSession?.user ?? null;

        if (activeSession?.accessToken) {
          activeUser = await fetchMe(activeSession.accessToken);
          const nextSession = { ...activeSession, user: activeUser };
          setSession(nextSession);
          writeSession(nextSession);
        }

        const nextDashboard = await fetchDashboard(activeSession?.accessToken, '');
        setDashboard(nextDashboard);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unable to load Socity APIs.');
        setDashboard(emptyDashboard);
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, []);

  async function loadAll(options?: { silent?: boolean; overrideSession?: SessionState | null; search?: string }) {
    const activeSession = options?.overrideSession ?? session ?? readSession();
    const nextSearch = options?.search ?? deferredSearchQuery;

    if (options?.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      let activeUser = activeSession?.user ?? null;
      if (activeSession?.accessToken) {
        activeUser = await fetchMe(activeSession.accessToken);
        const nextSession = { ...activeSession, user: activeUser };
        setSession(nextSession);
        writeSession(nextSession);
      }

      const nextDashboard = await fetchDashboard(activeSession?.accessToken, nextSearch);
      setDashboard(nextDashboard);
      setSession((current) => (current ? { ...current, user: activeUser ?? current.user } : current));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load Socity APIs.');
      setDashboard(emptyDashboard);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAll({ silent: true, search: deferredSearchQuery });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [deferredSearchQuery]);

  async function handleLogin() {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const nextSession = await login(loginEmail.trim(), loginPassword);
      setSession(nextSession);
      writeSession(nextSession);
      setLoginPassword('');
      await loadAll({ overrideSession: nextSession });
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    setSession(null);
    writeSession(null);
    setComposerValue('');
    void loadAll({ overrideSession: null });
  }

  async function handleCreatePost() {
    if (!session?.accessToken || !composerValue.trim()) {
      return;
    }

    setIsCreatingPost(true);
    setCreatePostError(null);
    try {
      const tags = composerValue.match(/#[a-zA-Z0-9_]+/g)?.map((tag) => tag.replace(/^#/, '')) ?? [];
      await createPost({ caption: composerValue.trim(), tags }, session.accessToken);
      setComposerValue('');
      await loadAll({ silent: true });
    } catch (error) {
      setCreatePostError(error instanceof Error ? error.message : 'Could not create post.');
    } finally {
      setIsCreatingPost(false);
    }
  }

  async function handleJoinCommunity(id: string) {
    if (!session?.accessToken) {
      return;
    }

    setJoiningCommunityId(id);
    try {
      await joinCommunity(id, session.accessToken);
      await loadAll({ silent: true });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not join community.');
    } finally {
      setJoiningCommunityId(null);
    }
  }

  async function handleMarkRead(id: string) {
    if (!session?.accessToken) {
      return;
    }

    setMarkingNotificationId(id);
    try {
      await markNotificationRead(id, session.accessToken);
      await loadAll({ silent: true });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not update notification.');
    } finally {
      setMarkingNotificationId(null);
    }
  }

  return (
    <div className="min-h-screen bg-app text-slate-900">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(value) => startTransition(() => setSearchQuery(value))}
        onRefresh={() => void loadAll({ silent: true })}
        isRefreshing={isRefreshing}
        notificationsCount={dashboard.notifications.filter((item) => item.unread).length}
        sessionUser={session?.user ?? null}
        onLogout={handleLogout}
      />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:px-8">
        <LeftSidebar user={session?.user ?? null} stats={dashboard.stats} apiBaseUrl={getApiBaseUrl()} />

        <div className="space-y-6">
          {!session ? (
            <LoginPanel
              email={loginEmail}
              password={loginPassword}
              onEmailChange={setLoginEmail}
              onPasswordChange={setLoginPassword}
              onSubmit={() => void handleLogin()}
              isSubmitting={isLoggingIn}
              error={loginError}
            />
          ) : null}

          {loadError ? (
            <section className="panel-surface border border-rose-200 bg-rose-50/80">
              <p className="section-kicker text-rose-500">Connection Error</p>
              <h2 className="section-title mt-1 text-rose-900">The frontend could not reach the backend</h2>
              <p className="mt-3 text-sm leading-6 text-rose-700">{loadError}</p>
            </section>
          ) : null}

          {isLoading ? (
            <section className="panel-surface">
              <div className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
                <div className="h-8 w-72 animate-pulse rounded-full bg-slate-200" />
                <div className="h-44 animate-pulse rounded-[32px] bg-slate-100" />
              </div>
            </section>
          ) : (
            <Feed
              stories={dashboard.stories}
              posts={dashboard.posts}
              reels={dashboard.reels}
              jobs={dashboard.jobs}
              communities={dashboard.communities}
              composerValue={composerValue}
              onComposerChange={setComposerValue}
              onCreatePost={() => void handleCreatePost()}
              canCreatePost={Boolean(session?.accessToken)}
              isCreatingPost={isCreatingPost}
              createPostError={createPostError}
              onJoinCommunity={(id) => void handleJoinCommunity(id)}
              canJoinCommunity={Boolean(session?.accessToken)}
              joiningCommunityId={joiningCommunityId}
            />
          )}
        </div>

        <RightRail
          online={!loadError}
          trends={dashboard.trends}
          notifications={dashboard.notifications}
          searchResults={dashboard.search}
          suggestions={dashboard.userSuggestions}
          canManageNotifications={Boolean(session?.accessToken)}
          markingNotificationId={markingNotificationId}
          onMarkNotificationRead={(id) => void handleMarkRead(id)}
        />
      </div>
    </div>
  );
}

export default App;
