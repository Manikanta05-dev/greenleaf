import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductRow } from '@/components/ProductRow';
import { ReelsSection } from '@/components/ReelsSection';
import { Truck, ArrowCounterClockwise, ShieldCheck, Leaf } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

const ROOMS = [
  {
    label: 'Living Room',
    href: '/shop?q=living+room',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Bedroom',
    href: '/shop?q=bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Balcony',
    href: '/shop?q=balcony',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Office',
    href: '/shop?q=office',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
];

export default async function Home() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 8,
  });

  const indoor = await db.product.findMany({
    where: { active: true, category: { slug: 'indoor-plants' } },
    include: { category: true },
    take: 8,
  });

  // Pick up to 5 products to pair with reels
  const reelProducts = featured.slice(0, 5);

  return (
    <>
      {/* ── Video Hero ── */}
      <section className="video-hero">
        <video
          className="video-hero-bg"
          src="/nurseryplant.mp4"
          autoPlay muted loop playsInline
          aria-hidden="true"
        />
        <div className="video-hero-overlay" aria-hidden="true" />
        <div className="video-hero-content container">
          <span className="hero-eyebrow">India's Favourite Plant Store</span>
          <h1>Bring Nature Into Your Home</h1>
          <p>
            Shop healthy indoor plants, outdoor greenery, pots, soil and garden
            tools — carefully packed and delivered to your doorstep.
          </p>
          <div className="hero-cta">
            <Link className="btn primary" href="/shop">Shop All Plants</Link>
            <Link className="btn hero-outline" href="/shop?category=indoor-plants">
              Explore Indoor Plants
            </Link>
          </div>
        </div>
      </section>

      {/* ── Offer strip ── */}
      <div className="offer-strip">
        <div className="container">
          <div className="offer-strip-inner">
            <div className="offer-item"><Truck size={16} weight="bold" />Free Shipping on orders above ₹999</div>
            <div className="offer-item"><ArrowCounterClockwise size={16} weight="bold" />7-Day Free Replacement</div>
            <div className="offer-item"><ShieldCheck size={16} weight="bold" />100% Healthy Plants Guaranteed</div>
            <div className="offer-item"><Leaf size={16} weight="bold" />10,000+ Plants Delivered</div>
          </div>
        </div>
      </div>

      {/* ── Transform Your Home ── */}
      <section className="transform-section">
        <div className="container">
          <h2 className="transform-title">Transform Your Home.</h2>
          <div className="transform-grid">
            {ROOMS.map(r => (
              <Link key={r.label} href={r.href} className="transform-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.label} className="transform-img" />
                <div className="transform-overlay" />
                <div className="transform-label">{r.label}</div>
                <div className="transform-shop-btn">Shop Now</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best sellers ── */}
      {featured.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2>Best Selling Plants</h2>
              <Link href="/shop">View all →</Link>
            </div>
            <ProductRow products={featured} />
          </div>
        </section>
      )}

      {/* ── Indoor plants ── */}
      {indoor.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2>Popular Indoor Plants</h2>
              <Link href="/shop?category=indoor-plants">View all →</Link>
            </div>
            <ProductRow products={indoor} />
          </div>
        </section>
      )}

      {/* ── Trust section ── */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">🌿</div>
              <h3>Unbeatable Quality</h3>
              <p>We sell quality garden products at the very best prices — no compromises.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">🚚</div>
              <h3>Pan-India Delivery</h3>
              <p>Greenery at your doorstep, everywhere in India. Fast & careful packaging.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon" aria-hidden="true">🔄</div>
              <h3>Free Replacements</h3>
              <p>In case of damage or poor health, we provide a free replacement. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reels / Stay Tuned section ── */}
      <ReelsSection products={reelProducts} />
    </>
  );
}
