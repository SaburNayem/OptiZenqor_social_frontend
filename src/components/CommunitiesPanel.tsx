import { Lock, Users } from 'lucide-react';
import { CommunityView } from '../types';

interface CommunitiesPanelProps {
  communities: CommunityView[];
  canJoin: boolean;
  joiningId: string | null;
  onJoin: (id: string) => void;
}

const CommunitiesPanel = ({ communities, canJoin, joiningId, onJoin }: CommunitiesPanelProps) => {
  return (
    <section className="panel-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Communities API</p>
          <h2 className="section-title mt-1">Facebook-style groups with real counts</h2>
        </div>
        <Users className="h-5 w-5 text-slate-400" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {communities.length > 0 ? (
          communities.map((community) => (
            <article key={community.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{community.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{community.description}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{community.memberCount}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Members</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>{community.category}</span>
                <span>{community.location}</span>
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {community.privacy}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {community.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onJoin(community.id)}
                type="button"
                disabled={!canJoin || joiningId === community.id}
              >
                {joiningId === community.id ? 'Joining...' : canJoin ? 'Join Community' : 'Login To Join'}
              </button>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No communities were returned by `/communities`.
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunitiesPanel;
