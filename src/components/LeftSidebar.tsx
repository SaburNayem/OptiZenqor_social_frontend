import { Bell, BriefcaseBusiness, ImagePlus, Users } from 'lucide-react';
import { DashboardStats, ViewerUser } from '../types';

interface LeftSidebarProps {
  user: ViewerUser | null;
  stats: DashboardStats;
  apiBaseUrl: string;
}

const LeftSidebar = ({ user, stats, apiBaseUrl }: LeftSidebarProps) => {
  const statCards = [
    { label: 'Posts', value: stats.posts, icon: ImagePlus },
    { label: 'Jobs', value: stats.jobs, icon: BriefcaseBusiness },
    { label: 'Groups', value: stats.communities, icon: Users },
    { label: 'Alerts', value: stats.notifications, icon: Bell },
  ];

  return (
    <aside className="hidden xl:block">
      <div className="panel-surface sticky top-24">
        <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(29,155,240,0.18),_transparent_42%),linear-gradient(135deg,#f8fbff,#ffffff)] p-5">
          <div className="flex items-center gap-3">
            <img
              src={
                user?.avatar ||
                'https://ui-avatars.com/api/?name=Socity+Member&background=0f172a&color=ffffff'
              }
              alt={user?.name || 'Member'}
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'Socity Member'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Authenticated user'}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {user?.bio ||
              'The frontend is now wired for live feed, stories, reels, communities, jobs, search, and notifications from your Socity backend.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {statCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-slate-900 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">API Base</p>
          <p className="mt-3 break-all text-sm leading-6 text-slate-200">{apiBaseUrl}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Keep the backend running on this URL and the webview will stay fully connected.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
