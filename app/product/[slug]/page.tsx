import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { money } from '@/lib/format';
import { ProductDetailClient } from './ProductDetailClient';
import { Truck, RefreshCw, ShieldCheck, Leaf } from 'lucide-react';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!raw) notFound();

  // Serialize: strip Date objects so they cross the server→client boundary safely
  const p = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    careInstructions: raw.careInstructions,
    price: raw.price,
    compareAtPrice: raw.compareAtPrice,
    stock: raw.stock,
    imageUrl: raw.imageUrl,
    categoryId: raw.categoryId,
    plantType: raw.plantType,
    difficulty: raw.difficulty,
    sunlight: raw.sunlight,
    waterNeeds: raw.waterNeeds,
    size: raw.size,
    featured: raw.featured,
    active: raw.active,
    category: { id: raw.category.id, name: raw.category.name, slug: raw.category.slug },
  };

  const [rawRelated, rawRecentSeed] = await Promise.all([
    db.product.findMany({
      where: { active: true, categoryId: p.categoryId, id: { not: p.id } },
      include: { category: true },
      take: 6,
    }),
    db.product.findMany({
      where: { active: true, id: { not: p.id } },
      include: { category: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Serialize related products to strip Date fields
  const serializeProduct = (r: typeof rawRelated[0]) => ({
    id: r.id, name: r.name, slug: r.slug, description: r.description,
    price: r.price, compareAtPrice: r.compareAtPrice, stock: r.stock,
    imageUrl: r.imageUrl, featured: r.featured, active: r.active,
    categoryId: r.categoryId, plantType: r.plantType, difficulty: r.difficulty,
    sunlight: r.sunlight, waterNeeds: r.waterNeeds, size: r.size,
    careInstructions: r.careInstructions,
    category: { id: r.category.id, name: r.category.name, slug: r.category.slug },
  });
  const related = rawRelated.map(serializeProduct);
  const recentSeed = rawRecentSeed.map(serializeProduct);

  const discount = p.compareAtPrice && p.compareAtPrice > p.price
    ? Math.round((1 - p.price / p.compareAtPrice) * 100)
    : null;

  const FAQS = [
    {
      q: 'How is this plant delivered?',
      a: 'Your plant is carefully packed in a specially designed box with supports to prevent damage. We use eco-friendly packaging that keeps the soil intact.',
    },
    {
      q: 'What if my plant arrives damaged?',
      a: 'We offer a 7-day free replacement guarantee. Simply share a photo with our support team within 7 days of delivery and we\'ll send a replacement at no extra cost.',
    },
    {
      q: 'How long does delivery take?',
      a: 'We typically deliver within 3–7 business days depending on your location. Express delivery (1–2 days) is available in select cities.',
    },
    {
      q: 'Do I need a pot for this plant?',
      a: `This plant comes in a ${p.size ?? 'nursery'} grow pot. If you want to display it in a decorative planter, browse our Pots & Planters collection.`,
    },
    {
      q: 'Can I return the plant?',
      a: 'Plants are living products and cannot be returned. However, if there is any quality issue, our replacement policy covers you for 7 days from delivery.',
    },
  ];

  const REVIEWS = [
    { name: 'Priya S.', rating: 5, date: '2 weeks ago', verified: true, text: 'Absolutely love it! The plant arrived in perfect condition — well-packaged and healthy. It\'s already adding so much life to my living room.' },
    { name: 'Rahul M.', rating: 4, date: '1 month ago', verified: true, text: 'Great quality plant. Delivery was a bit delayed but worth the wait. Customer support was responsive and helpful.' },
    { name: 'Ananya K.', rating: 5, date: '3 weeks ago', verified: true, text: 'This is my third order from GreenLeaf and every single time the plants arrive fresh and healthy. Highly recommend!' },
  ];

  const avgRating = 4.7;
  const totalReviews = 124;

  return (
    <main>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${p.category.slug}`}>{p.category.name}</Link>
          <span>/</span>
          <span>{p.name}</span>
        </nav>

        {/* ── Top: image + details ── */}
        <div className="pd-top">
          {/* Left: image */}
          <div className="pd-img-col">
            <div className="pd-img-main">
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={600}
                height={600}
                priority
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {discount && <span className="pd-img-badge">{discount}% OFF</span>}
            </div>
          </div>

          {/* Right: info */}
          <div className="pd-info-col">
            <div className="pd-category-tag">{p.category.name}</div>
            <h1 className="pd-name">{p.name}</h1>

            {/* Star rating */}
            <div className="pd-rating-row">
              <div className="pd-stars" aria-label={`${avgRating} out of 5`}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(avgRating) ? '#f5c518' : '#ddd' }}>★</span>
                ))}
              </div>
              <span className="pd-rating-score">{avgRating}</span>
              <span className="pd-rating-count">({totalReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="pd-price-row">
              <span className="pd-price">{money(p.price)}</span>
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <span className="pd-compare">{money(p.compareAtPrice)}</span>
              )}
              {discount && <span className="pd-discount-badge">{discount}% OFF</span>}
            </div>

            {/* Plant attributes pills */}
            {(p.difficulty || p.sunlight || p.waterNeeds || p.size) && (
              <div className="pd-attr-pills">
                {p.size      && <span className="pd-pill">📏 {p.size}</span>}
                {p.difficulty && <span className="pd-pill">⚡ {p.difficulty}</span>}
                {p.sunlight   && <span className="pd-pill">☀️ {p.sunlight}</span>}
                {p.waterNeeds && <span className="pd-pill">💧 {p.waterNeeds}</span>}
                {p.plantType  && <span className="pd-pill">🌿 {p.plantType}</span>}
              </div>
            )}

            {/* Short desc */}
            <p className="pd-short-desc">{p.description}</p>

            {/* AddToCart — client component */}
            <ProductDetailClient product={p} />

            {/* Trust icons */}
            <div className="pd-trust-row">
              <div className="pd-trust-item">
                <Truck size={18} />
                <span>Free Delivery<br /><small>on orders ≥ ₹999</small></span>
              </div>
              <div className="pd-trust-item">
                <RefreshCw size={18} />
                <span>7-Day<br /><small>Replacement</small></span>
              </div>
              <div className="pd-trust-item">
                <ShieldCheck size={18} />
                <span>100% Genuine<br /><small>Healthy Plants</small></span>
              </div>
              <div className="pd-trust-item">
                <Leaf size={18} />
                <span>Expert<br /><small>Plant Care Tips</small></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Plant Story ── */}
      {p.careInstructions && (
        <section className="pd-story-section">
          <div className="container">
            <h2 className="pd-story-title">About this Plant</h2>
            <p className="pd-story-body">{p.description}</p>
            {p.careInstructions && (
              <p className="pd-story-body" style={{ marginTop: 12 }}>
                <strong>Care: </strong>{p.careInstructions}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── You May Also Like ── */}
      {related.length > 0 && (
        <section className="pd-related-section">
          <div className="container">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <Link href={`/shop?category=${p.category.slug}`}>View all →</Link>
            </div>
            <div className="pd-scroll-row">
              {related.map(r => (
                <Link key={r.id} href={`/product/${r.slug}`} className="pd-mini-card">
                  <div className="pd-mini-img">
                    <Image src={r.imageUrl} alt={r.name} fill sizes="160px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="pd-mini-body">
                    <div className="pd-mini-name">{r.name}</div>
                    <div className="pd-mini-price">{money(r.price)}</div>
                    <span className="pd-mini-btn">Shop Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently Viewed (seed with other products) ── */}
      {recentSeed.length > 0 && (
        <section className="pd-related-section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <h2>Recently Viewed</h2>
              <Link href="/shop">Browse all →</Link>
            </div>
            <div className="pd-scroll-row">
              {recentSeed.map(r => (
                <Link key={r.id} href={`/product/${r.slug}`} className="pd-mini-card">
                  <div className="pd-mini-img">
                    <Image src={r.imageUrl} alt={r.name} fill sizes="160px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="pd-mini-body">
                    <div className="pd-mini-name">{r.name}</div>
                    <div className="pd-mini-price">{money(r.price)}</div>
                    <span className="pd-mini-btn">Shop Now</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why GreenLeaf ── */}
      <section className="pd-why-section">
        <div className="container">
          <h2 className="pd-why-title">🌿 Why GreenLeaf is Right for You</h2>
          <div className="pd-why-grid">
            {[
              { icon: '✅', title: 'Hand-picked & Quality Checked', desc: 'Every plant is inspected by our experts before dispatch. Only the healthiest plants make it to you.' },
              { icon: '📦', title: 'Safe & Secure Packaging', desc: 'Purpose-built plant packaging keeps your order safe and soil intact throughout transit.' },
              { icon: '🌱', title: 'Rooted & Ready to Grow', desc: 'All plants are well-rooted in premium nursery mix so they settle quickly in your home.' },
              { icon: '💬', title: 'Expert Care Support', desc: 'Get free plant care guidance from our horticulture team via chat, call, or email.' },
              { icon: '🔄', title: '7-Day Replacement Guarantee', desc: 'Not satisfied? We\'ll replace your plant free of charge within 7 days — no questions asked.' },
              { icon: '🚚', title: 'Pan-India Delivery', desc: 'We deliver to 500+ cities across India. Free shipping on orders above ₹999.' },
            ].map(f => (
              <div key={f.title} className="pd-why-item">
                <span className="pd-why-icon">{f.icon}</span>
                <div>
                  <div className="pd-why-item-title">{f.title}</div>
                  <div className="pd-why-item-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="pd-faq-section">
        <div className="container pd-faq-inner">
          <h2 className="pd-faq-title">Frequently Asked Questions</h2>
          <div className="pd-faq-list">
            {FAQS.map((f, i) => (
              <details key={i} className="pd-faq-item">
                <summary className="pd-faq-q">{f.q}</summary>
                <p className="pd-faq-a">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ratings & Reviews ── */}
      <section className="pd-reviews-section">
        <div className="container">
          <h2 className="pd-reviews-title">Ratings & Reviews</h2>
          <div className="pd-reviews-layout">
            {/* Summary */}
            <div className="pd-rating-summary">
              <div className="pd-rating-big">{avgRating}</div>
              <div className="pd-stars-big">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(avgRating) ? '#f5c518' : '#ddd', fontSize: 22 }}>★</span>
                ))}
              </div>
              <div className="pd-rating-total">{totalReviews} reviews</div>
              {/* Bar breakdown */}
              <div className="pd-rating-bars">
                {[[5,78],[4,16],[3,4],[2,1],[1,1]].map(([star, pct]) => (
                  <div key={star} className="pd-rating-bar-row">
                    <span>{star}★</span>
                    <div className="pd-rating-bar-bg">
                      <div className="pd-rating-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="pd-review-cards">
              {REVIEWS.map((r, i) => (
                <div key={i} className="pd-review-card">
                  <div className="pd-review-header">
                    <div className="pd-reviewer-avatar">{r.name[0]}</div>
                    <div>
                      <div className="pd-reviewer-name">
                        {r.name}
                        {r.verified && <span className="pd-verified">✓ Verified</span>}
                      </div>
                      <div className="pd-review-date">{r.date}</div>
                    </div>
                    <div className="pd-review-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= r.rating ? '#f5c518' : '#ddd', fontSize: 14 }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="pd-review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
