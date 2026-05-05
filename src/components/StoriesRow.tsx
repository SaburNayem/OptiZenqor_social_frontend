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
          <div className="rounded-3xl bg-slate-50 px-5 py-10 text-sm text-slate-500">
            No active stories were returned by `/stories`.
          </div>
        )}
      </div>
    </section>
  );
};

export default StoriesRow;
