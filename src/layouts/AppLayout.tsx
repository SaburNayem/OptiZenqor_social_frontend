import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareMore,
  MoonStar,
  PanelsTopLeft,
  PhoneCall,
  Radio,
  Search,
  Settings,
  Store,
  SunMedium,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AppOutletContext } from '../types';
import { Button } from '../components/ui/Button';
import { RightSidebar } from '../components/social/RightSidebar';

const primaryNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/messages', label: 'Messages', icon: MessageSquareMore },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/connections', label: 'Connections', icon: Users },
];

const secondaryNavItems = [
  { to: '/explore', label: 'Explore' },
  { to: '/marketplace', label: 'Marketplace', icon: Store },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/pages', label: 'Pages', icon: PanelsTopLeft },
  { to: '/calls', label: 'Calls', icon: PhoneCall },
  { to: '/live-streams', label: 'Live streams', icon: Radio },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface AppLayoutProps {
  context: AppOutletContext;
}

export function AppLayout({ context }: AppLayoutProps) {
  const unreadCount = context.app.data.notifications.filter((item) => item.unread).length;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app text-slate-900 dark:bg-app-dark dark:text-white">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6 xl:px-8">
          <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>

          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950">
              O
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                OptiZenqor Social
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Clean web workspace
              </p>
            </div>
          </NavLink>

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="hidden max-w-2xl flex-1 items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/70 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={context.app.searchQuery}
                onChange={(event) => context.app.setSearchQuery(event.target.value)}
                placeholder="Search messages, people, posts, and communities"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

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
          </div>
        </div>
      </header>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}>
          <aside
            className="h-full w-[340px] max-w-[90vw] overflow-y-auto bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-950 dark:text-white">App drawer</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Everything lives here, not in the top bar.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <UserCircle2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {context.app.session?.user.name ?? 'Member'}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{context.app.session?.user.username ?? 'member'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-6 dark:border-slate-800">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                More
              </p>
              <div className="mt-3 space-y-2">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <span>{item.label}</span>
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200/70 pt-6 dark:border-slate-800">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Quick actions
              </p>
              <div className="mt-3 space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={() => {
                    void context.app.refresh({ silent: true });
                    setIsDrawerOpen(false);
                  }}
                >
                  Refresh data
                  {context.app.isRefreshing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={context.theme.toggleMode}
                >
                  Theme
                  {context.theme.mode === 'dark' ? (
                    <SunMedium className="h-4 w-4" />
                  ) : (
                    <MoonStar className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={context.app.logout}
                >
                  Logout
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:px-8">
        <main className="min-w-0">
          <Outlet context={context} />
        </main>
        <RightSidebar
          data={context.app.data}
          selectedChatId={context.app.selectedChatId}
          onSelectChat={context.app.setSelectedChatId}
          onToggleSuggestion={context.app.toggleFollowSuggestion}
        />
      </div>
    </div>
  );
}
