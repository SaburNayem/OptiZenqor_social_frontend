import { Music4, PlayCircle } from 'lucide-react';
import { ReelView } from '../types';

interface ReelsStripProps {
  reels: ReelView[];
}

const ReelsStrip = ({ reels }: ReelsStripProps) => {
  return (
    <section className="panel-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Reels API</p>
          <h2 className="section-title mt-1">Short-form media lane</h2>
        </div>
        <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {reels.length} clips
        </div>
      </div>

      <div className="scroll-row mt-5">
        {reels.length > 0 ? (
          reels.map((reel) => (
            <article key={reel.id} className="relative min-w-[240px] overflow-hidden rounded-[28px] bg-slate-900 text-white">
              <img src={reel.thumbnail} alt={reel.caption} className="h-[300px] w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={reel.user.avatar} alt={reel.user.name} className="h-10 w-10 rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{reel.user.name}</p>
                      <p className="text-xs text-slate-300">{reel.createdAt}</p>
                    </div>
                  </div>
                  <PlayCircle className="h-8 w-8 text-white" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-100">{reel.caption}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <Music4 className="h-4 w-4" />
                  <span>{reel.audioName}</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No reels were returned by `/reels`.
          </div>
        )}
      </div>
    </section>
  );
};

export default ReelsStrip;
