'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CaretRight, ShoppingCartSimple, ArrowSquareOut } from '@phosphor-icons/react';
import { money } from '@/lib/format';

// Reel captions — one per reel slot
const CAPTIONS = [
  'Bringing Nature Into My Home 🌿',
  'My Green Corner Setup 🪴',
  'Plant Unboxing from GreenLeaf 📦',
  'Office Desk Plant Makeover 💚',
  'Balcony Garden Transformation 🌸',
];

interface Props {
  products: any[];
}

export function ReelsSection({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  function scrollRight() {
    trackRef.current?.scrollBy({ left: trackRef.current.clientWidth * 0.6, behavior: 'smooth' });
  }

  function addToCart(p: any, e: React.MouseEvent) {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = cart.findIndex((x: any) => x.productId === p.id);
      if (idx >= 0) cart[idx].quantity = Math.min(p.stock, cart[idx].quantity + 1);
      else cart.push({ productId: p.id, quantity: 1, product: p });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  }

  // Repeat the single video across all slots
  const reels = products.map((p, i) => ({
    product: p,
    caption: CAPTIONS[i] ?? CAPTIONS[0],
    videoSrc: '/nurseryplant.mp4',
  }));

  return (
    <section className="reels-section">
      <div className="container">
        {/* Heading */}
        <div className="reels-heading">
          <h2>
            Want to know where we're<br />
            headed next?{' '}
            <em>Stay tuned…</em>
          </h2>
        </div>

        {/* Track + arrow */}
        <div className="reels-wrap">
          <div className="reels-track" ref={trackRef}>
            {reels.map((r, i) => (
              <div className="reel-card" key={i}>
                {/* Video */}
                <div
                  className="reel-video-wrap"
                  onClick={() => setPlaying(playing === i ? null : i)}
                >
                  <video
                    src={r.videoSrc}
                    className="reel-video"
                    loop
                    muted
                    playsInline
                    autoPlay={playing === i}
                    ref={el => {
                      if (!el) return;
                      playing === i ? el.play().catch(() => {}) : el.pause();
                    }}
                  />
                  {/* Caption overlay */}
                  <div className="reel-caption">{r.caption}</div>
                  {/* Play indicator */}
                  {playing !== i && (
                    <div className="reel-play-btn" aria-hidden="true">▶</div>
                  )}
                </div>

                {/* Product strip */}
                <div className="reel-product-strip">
                  <div className="reel-prod-img-wrap">
                    <Image
                      src={r.product.imageUrl}
                      alt={r.product.name}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="reel-prod-info">
                    <Link href={`/product/${r.product.slug}`} className="reel-prod-name">
                      {r.product.name.length > 16
                        ? r.product.name.slice(0, 15) + '…'
                        : r.product.name}
                      <ArrowSquareOut size={10} style={{ marginLeft: 3, opacity: .6 }} />
                    </Link>
                    <span className="reel-prod-price">{money(r.product.price)}</span>
                  </div>
                  <button
                    className="reel-atc"
                    onClick={e => addToCart(r.product, e)}
                    aria-label={`Add ${r.product.name} to cart`}
                  >
                    <ShoppingCartSimple size={13} weight="bold" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll arrow */}
          <button className="reels-arrow" onClick={scrollRight} aria-label="Scroll reels right">
            <CaretRight size={22} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}
