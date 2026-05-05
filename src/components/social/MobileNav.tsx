import { Bell, Compass, Home, MessageSquareMore, Settings, UserCircle2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/messages', label: 'Messages', icon: MessageSquareMore },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-white/70 bg-white/85 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88 xl:hidden">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
                  isActive
                    ? 'bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950'
                    : 'text-slate-500 dark:text-slate-400',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
