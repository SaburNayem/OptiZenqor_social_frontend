import {
  Archive,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudUpload,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Package,
  MessageSquareMore,
  PlaySquare,
  Search,
  Settings,
  UserCircle2,
  Users,
  Video,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { AppOutletContext } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';

const headerCenterItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/reels', label: 'Reels', icon: PlaySquare },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/marketplace', label: 'Marketplace', icon: Package },
];

const sidebarSections = [
  {
    title: 'Create & Manage',
    subtitle: 'Publishing tools and saved workspaces.',
    items: [
      { to: '/explore', label: 'Drafts', icon: FileText },
      { to: '/calls', label: 'Scheduling', icon: Clock3 },
      { to: '/messages', label: 'Upload Manager', icon: CloudUpload },
      { to: '/profile', label: 'Saved Posts', icon: Bookmark },
      { to: '/settings', label: 'Archived Posts', icon: Archive },
    ],
  },
  {
    title: 'Discover',
    subtitle: 'Explore communities, pages, and live surfaces.',
    items: [
      { to: '/communities', label: 'Communities', icon: Users },
      { to: '/connections', label: 'Groups', icon: UserCircle2 },
      { to: '/pages', label: 'Pages', icon: LayoutGrid },
      { to: '/marketplace', label: 'Marketplace', icon: Package },
      { to: '/events', label: 'Events', icon: CalendarDays },
      { to: '/live-streams', label: 'Live Stream', icon: Video },
    ],
  },
];

const sidebarFooterItems = [
  { to: '/connections', label: 'Buddy', icon: Users, tone: 'default' as const },
  { to: '/settings', label: 'Settings', icon: Settings, tone: 'default' as const },
  { to: '/settings', label: 'Help & Support', icon: CircleHelp, tone: 'default' as const },
];

interface AppLayoutProps {
  context: AppOutletContext;
}

export function AppLayout({ context }: AppLayoutProps) {
  const unreadCount = context.app.data.notifications.filter((item) => item.unread).length;
  const viewer = context.app.session?.user ?? context.app.data.profile.user;
  const activeBuddies = context.app.data.chats.filter((chat) => chat.online);
  const inactiveBuddies = context.app.data.chats.filter((chat) => !chat.online);

  return (
    <div className="min-h-screen bg-app text-slate-900 dark:bg-app-dark dark:text-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/94 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex w-full items-center gap-3 px-2 py-2.5 sm:px-3 lg:px-4">
          <NavLink to="/" className="flex items-center gap-3 pr-1">
            <img src="/logo.svg" alt="OptiZenqor" className="h-10 w-10 rounded-2xl object-contain" />
          </NavLink>

          <div className="min-w-0 w-full max-w-[250px]">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/85 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/80">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={context.app.searchQuery}
                onChange={(event) => context.app.setSearchQuery(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto lg:flex">
            {headerCenterItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#0F766E] text-white dark:bg-[#169388] dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `relative flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isActive
                    ? 'bg-[#0F766E] text-white dark:bg-[#169388]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-[#0F766E] px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-[#169388]">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isActive
                    ? 'bg-[#0F766E] text-white dark:bg-[#169388]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <MessageSquareMore className="h-4 w-4" />
            </NavLink>
          </div>
        </div>

        <div className="w-full px-2 pb-3 sm:px-3 lg:hidden lg:px-5">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {headerCenterItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={`${item.to}-mobile`}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#0F766E] text-white dark:bg-[#169388] dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex w-full gap-2 px-2 py-2 sm:px-3 lg:gap-3 lg:px-4">
        <aside className="hidden lg:block lg:w-[232px] lg:shrink-0">
          <div className="sticky top-[74px]">
            <Card className="overflow-hidden p-0">
              <NavLink
                to="/profile"
                className="block border-b border-[#D6EEEB] bg-[linear-gradient(180deg,#F4FDFA_0%,#E6F4F1_100%)] px-6 py-6 text-slate-900 transition hover:bg-[linear-gradient(180deg,#EEF9F6_0%,#DDEEEA_100%)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#173c39_0%,#102b29_100%)] dark:text-white dark:hover:bg-[linear-gradient(180deg,#1b4743_0%,#12312f_100%)]"
              >
                <Avatar
                  src={viewer.avatar}
                  alt={viewer.name}
                  size="xl"
                />
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="truncate text-[1.75rem] font-medium leading-none text-[#205a54] dark:text-white">
                    {viewer.name}
                  </p>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#205a54] dark:text-white/90" />
                </div>
              </NavLink>

              <div className="space-y-6 px-6 py-5">
              {sidebarSections.map((section) => (
                <div key={section.title}>
                  <div className="pb-2">
                    <p className="text-[18px] font-medium text-[#2c7a72] dark:text-[#7cc6bd]">{section.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {section.subtitle}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                              isActive
                                ? 'bg-[#D6EEEB] text-[#0F766E] dark:bg-[#169388]/20 dark:text-[#A9D9D4]'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          <span className="flex items-center gap-4">
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </span>
                          <ChevronRight className="h-5 w-5 opacity-60" />
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}

                <div className="border-t border-slate-200/70 pt-5 dark:border-slate-800">
                  <div className="space-y-1">
                    {sidebarFooterItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={`${item.label}-${item.to}`}
                          to={item.to}
                          className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200/70 pt-5 dark:border-slate-800">
                  <button
                    onClick={context.app.logout}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#e25546] transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <main className="min-w-0">
            <Outlet context={context} />
          </main>
        </div>

        <aside className="hidden xl:block xl:w-[250px] xl:shrink-0">
          <div className="sticky top-[74px] space-y-3">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0F766E] dark:text-[#7cc6bd]" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Buddy</p>
              </div>

              <div className="mt-4 space-y-1.5">
                {[...activeBuddies.slice(0, 8), ...inactiveBuddies.slice(0, 10)].length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    No buddies yet
                  </p>
                ) : (
                  [...activeBuddies.slice(0, 8), ...inactiveBuddies.slice(0, 10)].map((chat) => (
                    <Link
                      key={chat.id}
                      to="/messages"
                      onClick={() => context.app.setSelectedChatId(chat.id)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <div className="relative">
                        <Avatar src={chat.participant.avatar} alt={chat.participant.name} size="sm" />
                        {chat.online ? (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {chat.participant.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {chat.online ? chat.roleLabel : chat.lastActive}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
