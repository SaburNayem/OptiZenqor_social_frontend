import { MoonStar, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function SettingsPage() {
  const { app, theme } = useAppOutlet();
  const iconMap = [MoonStar, ShieldCheck, SlidersHorizontal];
  const groups = app.data.settings;

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage appearance and account preferences in one clean place.
        </p>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</p>
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
          {groups.map((group, index) => {
            const Icon = iconMap[index % iconMap.length];
            return (
              <Card key={group.title}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D6EEEB] text-[#0F766E] dark:bg-[#169388]/15 dark:text-[#A9D9D4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{group.title}</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/70 p-4 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description || 'Live setting from backend catalog.'}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        {item.enabled ? 'Enabled' : 'Disabled'}
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
