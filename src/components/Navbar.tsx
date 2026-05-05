import { Bell, LoaderCircle, LogOut, RefreshCcw, Search, Sparkles } from 'lucide-react';
import { ViewerUser } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  notificationsCount: number;
  sessionUser: ViewerUser | null;
  onLogout: () => void;
}

const Navbar = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  notificationsCount,
  sessionUser,
  onLogout,
}: NavbarProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[rgba(247,248,252,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#1d9bf0)] text-white shadow-[0_20px_45px_rgba(29,155,240,0.26)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">Socity</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Live Social Webview
            </p>
          </div>
        </div>

        <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search people, posts, jobs, communities"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="icon-button" onClick={onRefresh} type="button" title="Refresh dashboard">
            {isRefreshing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
          </button>
          <div className="icon-button relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {notificationsCount}
            </span>
          </div>
          {sessionUser ? (
            <button
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {sessionUser.name.split(' ')[0]}
            </button>
          ) : (
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
              Guest Mode
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
