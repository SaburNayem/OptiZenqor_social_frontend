import { Plus } from 'lucide-react';
import { StoryView } from '../types';

interface StoriesRowProps {
  stories: StoryView[];
}

const StoriesRow = ({ stories }: StoriesRowProps) => {
  return (
    <section className="panel-surface">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Stories API</p>
          <h2 className="section-title mt-1">Live story rings from backend</h2>
        </div>
        <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {stories.length} active
        </div>
      </div>
      <div className="scroll-row mt-5">
        {stories.length > 0 ? (
          stories.map((story) => (
            <article
              key={story.id}
              className={`min-w-[210px] rounded-[28px] bg-gradient-to-br ${story.accent} p-[1px] shadow-[0_20px_50px_rgba(15,23,42,0.14)]`}
            >
              <div className="h-full rounded-[27px] bg-white/92 p-5 backdrop-blur">
                <img
                  src={story.user.avatar}
                  alt={story.user.name}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <h3 className="mt-10 text-lg font-semibold text-slate-900">{story.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{story.subtitle}</p>
              </div>
            </article>
          ))
        ) : (
          <article className="min-w-[210px] rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-5 text-slate-600 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <h3 className="mt-10 text-lg font-semibold text-slate-900">Add story</h3>
            <p className="mt-2 text-sm text-slate-500">
              No stories are live yet. Tap here to add your first story circle.
            </p>
          </article>
        )}
      </div>
    </section>
  );
};

export default StoriesRow;
