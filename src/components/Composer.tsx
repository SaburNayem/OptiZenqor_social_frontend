import { Sparkles } from 'lucide-react';

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const Composer = ({
  value,
  onChange,
  onSubmit,
  disabled,
  isAuthenticated,
  isSubmitting,
  error,
}: ComposerProps) => {
  return (
    <section className="panel-surface overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">Post API</p>
          <h3 className="section-title mt-1">Ship a real post into the feed</h3>
        </div>
        <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {isAuthenticated ? 'Authenticated' : 'Login required'}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write a real Socity update. This submits to POST /posts and refreshes the timeline."
        className="mt-5 min-h-[150px] w-full rounded-[28px] border border-slate-200 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Hashtags are auto-derived from words that start with <span className="font-semibold">#</span>.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onSubmit}
          type="button"
          disabled={disabled}
        >
          <Sparkles className="h-4 w-4" />
          {isSubmitting ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </section>
  );
};

export default Composer;
