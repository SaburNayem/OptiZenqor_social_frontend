import { ArrowUpRight, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { NotificationView, SearchItemView, TrendView, ViewerUser } from '../types';

interface RightRailProps {
  online: boolean;
  trends: TrendView[];
  notifications: NotificationView[];
  searchResults: SearchItemView[];
  suggestions: ViewerUser[];
  canManageNotifications: boolean;
  markingNotificationId: string | null;
  onMarkNotificationRead: (id: string) => void;
}

const RightRail = ({
  online,
  trends,
  notifications,
  searchResults,
  suggestions,
  canManageNotifications,
  markingNotificationId,
  onMarkNotificationRead,
}: RightRailProps) => {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-5">
        <section className="panel-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-kicker">Connection</p>
              <h3 className="section-title mt-1">{online ? 'Backend reachable' : 'Backend offline'}</h3>
            </div>
            {online ? <Wifi className="h-5 w-5 text-emerald-500" /> : <WifiOff className="h-5 w-5 text-rose-500" />}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {online
              ? 'Data is being hydrated from your Socity APIs.'
              : 'Start the Nest backend and refresh the webview to restore live data.'}
          </p>
        </section>

        <section className="panel-surface">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Search Discovery</h3>
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.subtitle || item.type}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {item.type}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                Start typing in the top search bar to load `/search-discovery`.
              </p>
            )}
          </div>
        </section>

        <section className="panel-surface">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Trending Now</h3>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-4">
            {trends.map((trend) => (
              <div key={trend.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{trend.topic}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{trend.detail}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {trend.volume}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-surface">
          <div className="flex items-center justify-between">
            <h3 className="section-title">People Surface</h3>
            <ArrowUpRight className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {suggestions.slice(0, 4).map((person) => (
              <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <img src={person.avatar} alt={person.name} className="h-11 w-11 rounded-2xl object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                  <p className="text-xs text-slate-500">@{person.username}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-surface">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Notifications</h3>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.body}</p>
                    </div>
                    {notification.unread ? (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {notification.createdAt}
                    </p>
                    <button
                      className="text-xs font-semibold text-slate-600 disabled:opacity-50"
                      onClick={() => onMarkNotificationRead(notification.id)}
                      type="button"
                      disabled={!canManageNotifications || !notification.unread || markingNotificationId === notification.id}
                    >
                      {markingNotificationId === notification.id ? 'Updating...' : notification.unread ? 'Mark read' : 'Read'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No notifications returned yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default RightRail;
