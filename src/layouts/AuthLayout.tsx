import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AppOutletContext } from '../types';

interface AuthLayoutProps {
  context: AppOutletContext;
}

export function AuthLayout({ context }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-app px-4 py-6 dark:bg-app-dark sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#38bdf8)] p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.28),transparent_25%)]" />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.34em] text-sky-100">OptiZenqor Social</p>
            <h1 className="mt-4 max-w-lg text-5xl font-semibold leading-tight">
              A premium network for thoughtful creators, teams, and communities.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-sky-50/88">
              Explore a refined social workspace with stories, rich posts, messages, discovery, and profile systems designed to feel both modern and deeply usable.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Real product feel', 'Multi-page polished UI built for launch-ready momentum.'],
                ['Responsive system', 'Desktop shell, mobile navigation, and dark mode support.'],
                ['Backend ready', 'Mock-first architecture that can connect to real APIs later.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-sky-50/80">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[36px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/82 sm:p-8">
          <Outlet context={context} />
        </section>
      </div>
    </div>
  );
}
