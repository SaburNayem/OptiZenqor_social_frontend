import { Store } from 'lucide-react';
import { useState } from 'react';
import { useAppOutlet } from '../hooks/useAppOutlet';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { createMarketplaceProduct } from '../lib/api';
import { canCreateMarketplace } from '../lib/profileCapabilities';

export function MarketplacePage() {
  const { app } = useAppOutlet();
  const viewer = app.session?.user ?? null;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateMarketplaceItem() {
    if (
      !app.session?.accessToken ||
      !viewer?.id ||
      !title.trim() ||
      !description.trim() ||
      !price.trim() ||
      !category.trim() ||
      !subcategory.trim() ||
      !location.trim() ||
      !condition.trim()
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await createMarketplaceProduct(
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category: category.trim(),
          subcategory: subcategory.trim(),
          sellerId: viewer.id,
          sellerName: viewer.name,
          location: location.trim(),
          condition: condition.trim(),
        },
        app.session.accessToken,
      );
      setOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSubcategory('');
      setLocation('');
      setCondition('');
      await app.refresh({ silent: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-500" />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Marketplace</p>
        </div>
        {canCreateMarketplace(viewer) ? <Button onClick={() => setOpen(true)}>Create listing</Button> : null}
      </div>

      <div>
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Buy, sell, and manage listings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Live marketplace inventory from the same backend used by the app.</p>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create listing"
        description="Business profiles can create marketplace listings."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Price" value={price} onChange={(event) => setPrice(event.target.value)} />
          <Input label="Category" value={category} onChange={(event) => setCategory(event.target.value)} />
          <Input label="Subcategory" value={subcategory} onChange={(event) => setSubcategory(event.target.value)} />
          <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />
          <Input label="Condition" value={condition} onChange={(event) => setCondition(event.target.value)} />
        </div>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-500/20"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreateMarketplaceItem()}
            disabled={
              submitting ||
              !title.trim() ||
              !description.trim() ||
              !price.trim() ||
              !category.trim() ||
              !subcategory.trim() ||
              !location.trim() ||
              !condition.trim()
            }
          >
            {submitting ? 'Creating...' : 'Create listing'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
