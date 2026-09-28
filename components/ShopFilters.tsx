'use client';
import { useRouter, useSearchParams } from 'next/navigation';

type Category = { id: string; name: string; slug: string };

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <aside className="shop-sidebar">
      <h3>Categories</h3>
      {categories.map(c => (
        <label className="filter-option" key={c.slug}>
          <input
            type="radio"
            name="category"
            value={c.slug}
            checked={sp.get('category') === c.slug}
            onChange={() => set('category', c.slug)}
          />
          {c.name}
        </label>
      ))}
      {sp.get('category') && (
        <button
          className="btn ghost"
          style={{ fontSize: 12, padding: '4px 0', marginTop: 4 }}
          onClick={() => set('category', '')}
        >
          ✕ Clear category
        </button>
      )}

      <h3 style={{ marginTop: 20 }}>Difficulty</h3>
      {['Beginner', 'Easy', 'Intermediate'].map(d => (
        <label className="filter-option" key={d}>
          <input
            type="radio"
            name="difficulty"
            value={d}
            checked={sp.get('difficulty') === d}
            onChange={() => set('difficulty', d)}
          />
          {d}
        </label>
      ))}
      {sp.get('difficulty') && (
        <button
          className="btn ghost"
          style={{ fontSize: 12, padding: '4px 0', marginTop: 4 }}
          onClick={() => set('difficulty', '')}
        >
          ✕ Clear difficulty
        </button>
      )}

      <h3 style={{ marginTop: 20 }}>Price</h3>
      {[
        { label: 'Under ₹500', value: '500' },
        { label: 'Under ₹1,000', value: '1000' },
        { label: 'Under ₹2,000', value: '2000' },
      ].map(p => (
        <label className="filter-option" key={p.value}>
          <input
            type="radio"
            name="max"
            value={p.value}
            checked={sp.get('max') === p.value}
            onChange={() => set('max', p.value)}
          />
          {p.label}
        </label>
      ))}
      {sp.get('max') && (
        <button
          className="btn ghost"
          style={{ fontSize: 12, padding: '4px 0', marginTop: 4 }}
          onClick={() => set('max', '')}
        >
          ✕ Clear price
        </button>
      )}
    </aside>
  );
}
