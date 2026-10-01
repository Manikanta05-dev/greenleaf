import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductRow } from '@/components/ProductRow';
import { ReelsSection } from '@/components/ReelsSection';
import {
  Truck, ArrowCounterClockwise, ShieldCheck, Leaf,
  SealCheck, Clock, Medal,
} from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

/* ── Shop-by-room data ── */
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

/* ── Category chips/cards strip data ── */
const CATS = [
  {
    label: 'Indoor Plants',
    emoji: '🪴',
    href: '/shop?category=indoor-plants',
    image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Outdoor Plants',
    emoji: '🌳',
    href: '/shop?category=outdoor-plants',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Air Purifiers',
    emoji: '💨',
    href: '/shop?q=air+purifier',
    image: 'https://images.unsplash.com/photo-1567360425618-1594206637d2?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Succulents',
    emoji: '🌵',
    href: '/shop?q=succulent',
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Flowering',
    emoji: '🌸',
    href: '/shop?q=flowering',
    image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc33?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Pots & Planters',
    emoji: '🏺',
    href: '/shop?category=pots-planters',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Soil & Compost',
    emoji: '🌱',
    href: '/shop?category=soil-fertilizer',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Garden Tools',
    emoji: '🛠️',
    href: '/shop?category=tools',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  },
];

/* ── Trust / Why GreenLeaf ── */
const TRUST = [
  {
    icon: <SealCheck size={24} weight="duotone" />,
    title: '3-Step Quality Check',
    desc: 'Every plant is inspected for health, roots, and foliage before dispatch.',
  },
  {
    icon: <Truck size={24} weight="duotone" />,
    title: 'Delivered Safely',
    desc: 'Eco-friendly packaging keeps your plant intact from our nursery to your door.',
  },
  {
    icon: <ArrowCounterClockwise size={24} weight="duotone" />,
    title: '7-Day Replacement',
    desc: 'Not happy? We replace it, no questions asked, within 7 days of delivery.',
  },
  {
    icon: <Clock size={24} weight="duotone" />,
    title: 'Expert Plant Care',
    desc: 'Detailed care guides and live support from our in-house plant experts.',
  },
];

export default async function Home() {
  const featured = await db.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 10,
  });

  const indoor = await db.product.findMany({
    where: { active: true, category: { slug: 'indoor-plants' } },
    include: { category: true },
    take: 10,
  });

  const outdoor = await db.product.findMany({
    where: { active: true, category: { slug: 'outdoor-plants' } },
    include: { category: true },
    take: 10,
  });

  const reelProducts = featured.slice(0, 5);

  return (
    <>
      {/* ══════════════════════════════════════
          VIDEO HERO
      ══════════════════════════════════════ */}
      <section className="video-hero">
        <video
          className="video-hero-bg"
          src="/nurseryplant.mp4"
          autoPlay muted loop playsInline
          aria-hidden="true"
        />
        <div className="video-hero-overlay" aria-hidden="true" />
        <div className="video-hero-content container">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            India's Favourite Plant Store
          </span>
          <h1>
            Bring <em>Nature</em><br />
            Into Your Home
          </h1>
          <p>
            Shop healthy indoor plants, outdoor greenery, pots, soil and garden
            tools — carefully packed and delivered to your doorstep.
          </p>
          <div className="hero-cta">
            <Link className="btn primary lg" href="/shop">
              Shop All Plants
            </Link>
            <Link className="btn outline-white lg" href="/shop?category=indoor-plants">
              Explore Indoor Plants
            </Link>
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="8" cy="8" r="2" fill="currentColor">
              <animate attributeName="cy" values="8;14;8" dur="1.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
          <span>Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════
          OFFER STRIP
      ══════════════════════════════════════ */}
      <div className="offer-strip">
        <div className="container">
          <div className="offer-strip-inner">
            <div className="offer-item">
              <Truck size={15} weight="bold" />
              Free Shipping on orders above ₹999
            </div>
            <div className="offer-item">
              <ArrowCounterClockwise size={15} weight="bold" />
              7-Day Free Replacement
            </div>
            <div className="offer-item">
              <ShieldCheck size={15} weight="bold" />
              100% Healthy Plants Guaranteed
            </div>
            <div className="offer-item">
              <Medal size={15} weight="bold" />
              10,000+ Happy Plant Parents
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CATEGORY CARDS GRID
      ══════════════════════════════════════ */}
      <section className="cat-section">
        <div className="container">
          <div className="cat-grid">
            {CATS.map(c => (
              <Link key={c.label} href={c.href} className="cat-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.label} className="cat-card-img" loading="lazy" />
                <div className="cat-card-overlay" />
                <div className="cat-card-body">
                  <span className="cat-card-emoji" aria-hidden="true">{c.emoji}</span>
                  <span className="cat-card-label">{c.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BEST SELLERS
      ══════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">Top Picks</p>
                <h2>Best Selling Plants</h2>
              </div>
              <Link href="/shop">View all →</Link>
            </div>
            <ProductRow products={featured} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          TRUST SECTION
      ══════════════════════════════════════ */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            {TRUST.map(t => (
              <div className="trust-item" key={t.title}>
                <div className="trust-icon-wrap">{t.icon}</div>
                <div className="trust-item-body">
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SHOP BY ROOM
      ══════════════════════════════════════ */}
      <section className="transform-section">
        <div className="container">
          <p className="section-eyebrow" style={{ textAlign: 'center' }}>Shop by Space</p>
          <h2 className="transform-title">Find Plants for Every Corner</h2>
          <p className="transform-subtitle">
            From sun-drenched balconies to cosy bedrooms — we have the perfect green companion for every space.
          </p>
          <div className="transform-grid">
            {ROOMS.map(r => (
              <Link key={r.label} href={r.href} className="transform-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.label} className="transform-img" loading="lazy" />
                <div className="transform-overlay" />
                <div className="transform-label">{r.label}</div>
                <div className="transform-shop-btn">Shop Now</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          INDOOR PLANTS
      ══════════════════════════════════════ */}
      {indoor.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">Bestsellers</p>
                <h2>Popular Indoor Plants</h2>
              </div>
              <Link href="/shop?category=indoor-plants">View all →</Link>
            </div>
            <ProductRow products={indoor} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════ */}
      <div className="promo-banner">
        <div className="container promo-banner-inner">
          <div>
            <h2>New to plant parenting?<br />We've got you covered.</h2>
            <p>
              Browse our curated collection of beginner-friendly, low-maintenance plants —
              hand-picked by our in-house horticulturists for guaranteed success.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', flexShrink: 0 }}>
            <Link className="btn primary lg" href="/shop?difficulty=Beginner">
              Shop Easy Plants
            </Link>
            <Link className="btn outline-white lg" href="/shop?q=air+purifier">
              Air Purifier Plants
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          OUTDOOR PLANTS
      ══════════════════════════════════════ */}
      {outdoor.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">Garden Ready</p>
                <h2>Outdoor Plants</h2>
              </div>
              <Link href="/shop?category=outdoor-plants">View all →</Link>
            </div>
            <ProductRow products={outdoor} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          REELS / STAY TUNED
      ══════════════════════════════════════ */}
      <ReelsSection products={reelProducts} />

      {/* ══════════════════════════════════════
          SOCIAL PROOF NUMBERS
      ══════════════════════════════════════ */}
      <section style={{ background: 'var(--brand)', padding: '52px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 2,
            textAlign: 'center',
          }}>
            {[
              { num: '50,000+', label: 'Plants Delivered' },
              { num: '4.8★',   label: 'Average Rating' },
              { num: '10,000+', label: 'Happy Customers' },
              { num: '500+',    label: 'Plant Varieties' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 8px' }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 400,
                  color: '#fff',
                  letterSpacing: '-.02em',
                  lineHeight: 1.15,
                  marginBottom: 6,
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
