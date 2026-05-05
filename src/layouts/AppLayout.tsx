import { Bell, LoaderCircle, LogOut, MoonStar, Search, SunMedium, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { AppOutletContext } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Sidebar } from '../components/social/Sidebar';
import { RightSidebar } from '../components/social/RightSidebar';
import { MobileNav } from '../components/social/MobileNav';

interface AppLayoutProps {
  context: AppOutletContext;
}

export function AppLayout({ context }: AppLayoutProps) {
  const unreadCount = context.app.data.notifications.filter((item) => item.unread).length;

  return (
    <div className="min-h-screen bg-app pb-28 text-slate-900 dark:bg-app-dark dark:text-white xl:pb-8">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6 xl:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#38bdf8)] text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                OptiZenqor Social
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Premium social workspace
              </p>
            </div>
          </NavLink>

          <div className="mx-auto hidden max-w-xl flex-1 items-center gap-3 rounded-full border border-white/70 bg-white/75 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/70 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={context.app.searchQuery}
              onChange={(event) => context.app.setSearchQuery(event.target.value)}
              placeholder="Search people, topics, posts, and opportunities"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void context.app.refresh({ silent: true })}
            >
              {context.app.isRefreshing ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={context.theme.toggleMode}>
              {context.theme.mode === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Button>
            <NavLink to="/notifications" className="relative">
              <Button variant="secondary" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
            {context.app.session ? (
              <div className="hidden items-center gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900/70 lg:flex">
                <Avatar src={context.app.session.user.avatar} alt={context.app.session.user.name} size="sm" />
                <div className="max-w-[120px]">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {context.app.session.user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{context.app.session.user.username}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={context.app.logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <NavLink to="/auth/login">
                <Button size="sm">Sign in</Button>
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[290px_minmax(0,1fr)_340px] xl:px-8">
        <Sidebar viewer={context.app.session?.user ?? null} profile={context.app.data.profile} />
        <main className="min-w-0">
          <Outlet context={context} />
        </main>
        <RightSidebar data={context.app.data} onToggleSuggestion={context.app.toggleFollowSuggestion} />
      </div>

      <MobileNav />
    </div>
  );
}
