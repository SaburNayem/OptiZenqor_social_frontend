import { Store } from 'lucide-react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Card } from '../components/ui/Card';

export function MarketplacePage() {
  const { app } = useAppOutlet();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Marketplace</p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Buy, sell, and manage listings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Live marketplace inventory from the same backend used by the app.
        </p>
      </div>

      {app.data.marketplace.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">No marketplace items yet.</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Listings will appear here when products are available from the backend.
          </p>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {app.data.marketplace.map((item) => (
            <Card key={item.id} className="overflow-hidden p-0">
              {item.image ? <img src={item.image} alt={item.title} className="h-48 w-full object-cover" /> : null}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.sellerName}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-950 dark:text-white">{item.price}</span>
                  <span className="text-slate-500 dark:text-slate-400">{item.location}</span>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
