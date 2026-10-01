import { Suspense } from 'react';
import { db } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { ShopFilters } from '@/components/ShopFilters';

export const dynamic = 'force-dynamic';

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });

  const where: any = { active: true };
  if (q.category) where.category = { slug: q.category };
  if (q.difficulty) where.difficulty = q.difficulty;
  if (q.q) where.OR = [
    { name: { contains: q.q, mode: 'insensitive' } },
    { description: { contains: q.q, mode: 'insensitive' } },
  ];
  if (q.max) where.price = { lte: Number(q.max) };

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const activeCategory = categories.find(c => c.slug === q.category);

  return (
    <main>
      <div className="container">
        {/* Search bar — plain form, no JS needed */}
        <form className="search-bar" method="GET" action="/shop">
          <input
            className="input"
            name="q"
            placeholder="Search plants & products…"
            defaultValue={q.q}
            style={{ maxWidth: 480 }}
          />
          <button className="btn primary" type="submit">Search</button>
          {(q.q || q.category || q.difficulty || q.max) && (
            <a className="btn ghost" href="/shop">Clear all</a>
          )}
        </form>

        <div className="shop-layout">
          {/* Client-side sidebar filters */}
          <Suspense fallback={<aside className="shop-sidebar" />}>
            <ShopFilters categories={categories} />
          </Suspense>

          {/* Main content */}
          <div>
            <div className="shop-main-header">
              <div>
                <h1 className="shop-title">
                  {activeCategory
                    ? activeCategory.name
                    : q.q
                    ? `Results for "${q.q}"`
                    : 'All Products'}
                </h1>
                <p className="shop-count muted">{products.length} products found</p>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="shop-product-grid">
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="empty">
                <h2>No products found</h2>
                <p>Try adjusting your filters or search term.</p>
                <a className="btn primary" href="/shop">View all products</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
