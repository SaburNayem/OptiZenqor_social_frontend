import { MoonStar, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function SettingsPage() {
  const { app, theme } = useAppOutlet();

  const groups = [
    {
      title: 'Appearance',
      icon: MoonStar,
      items: [
        { label: 'Dark mode', copy: 'Switch the workspace tone for day or night.', action: theme.mode },
        { label: 'Glass panels', copy: 'Keep premium blur and layered surfaces across the UI.', action: 'Enabled' },
      ],
    },
    {
      title: 'Privacy',
      icon: ShieldCheck,
      items: [
        { label: 'Profile visibility', copy: 'Your profile is visible to the wider network.', action: 'Public' },
        { label: 'Message requests', copy: 'Trusted people can start conversations with context.', action: 'Filtered' },
      ],
    },
    {
      title: 'Productivity',
      icon: SlidersHorizontal,
      items: [
        { label: 'Notification rhythm', copy: 'Unread updates are grouped for lower-noise browsing.', action: 'Digest + urgent' },
        { label: 'Composer mode', copy: 'Default to thoughtful text posts with rich formatting cues.', action: 'Text-first' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Tune the workspace, privacy posture, and product rhythm to match how you want OptiZenqor Social to feel.
        </p>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Quick controls</p>
          <div className="mt-4 space-y-3">
            <Button variant="secondary" className="w-full justify-between" onClick={theme.toggleMode}>
              Toggle theme
              <span className="text-xs uppercase tracking-[0.24em] opacity-70">{theme.mode}</span>
            </Button>
            <Button variant="secondary" className="w-full justify-between" onClick={() => void app.refresh({ silent: true })}>
              Refresh data
              <span className="text-xs uppercase tracking-[0.24em] opacity-70">Live</span>
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.title}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{group.title}</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/70 p-4 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.copy}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {item.action}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
