import {
  Bell,
  Compass,
  Home,
  MessageSquareMore,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AppPage, UserProfile, ViewerUser } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const navItems: Array<{ to: string; label: string; icon: typeof Home; page: AppPage }> = [
  { to: '/', label: 'Home', icon: Home, page: 'home' },
  { to: '/explore', label: 'Explore', icon: Compass, page: 'explore' },
  { to: '/notifications', label: 'Notifications', icon: Bell, page: 'notifications' },
  { to: '/messages', label: 'Messages', icon: MessageSquareMore, page: 'messages' },
  { to: '/connections', label: 'Connections', icon: Users, page: 'connections' },
  { to: '/profile', label: 'Profile', icon: UserCircle2, page: 'profile' },
  { to: '/settings', label: 'Settings', icon: Settings, page: 'settings' },
];

interface SidebarProps {
  viewer: ViewerUser | null;
  profile: UserProfile;
}

export function Sidebar({ viewer, profile }: SidebarProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <Card className="overflow-hidden p-0">
          <div className="h-24 bg-[linear-gradient(135deg,#0f172a,#38bdf8,#f97316)]" />
          <div className="px-5 pb-5">
            <div className="-mt-8 flex items-end gap-3">
              <Avatar
                src={viewer?.avatar ?? profile.user.avatar}
                alt={viewer?.name ?? profile.user.name}
                size="xl"
                ring
              />
              <div className="pb-2">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">
                  {viewer?.name ?? profile.user.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  @{viewer?.username ?? profile.user.username}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {viewer?.bio ?? profile.about}
            </p>
          </div>
        </Card>

        <Card className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.page}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </Card>

        <Card className="bg-[linear-gradient(135deg,rgba(14,165,233,0.15),rgba(15,23,42,0.92))] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">OptiZenqor Pro Presence</p>
              <p className="text-xs text-white/70">Creator-grade analytics and premium profile modes.</p>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
}
