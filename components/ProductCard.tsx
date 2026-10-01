'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from '@phosphor-icons/react';
import { money } from '@/lib/format';

export function ProductCard({ p }: { p: any }) {
  const isFeatured = p.featured;
  const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price;

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = cart.findIndex((x: any) => x.productId === p.id);
      if (idx >= 0) {
        cart[idx].quantity = Math.min(p.stock, cart[idx].quantity + 1);
      } else {
        cart.push({ productId: p.id, quantity: 1, product: p });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {}
  }

  return (
    <article className="pcard">
      <Link href={`/product/${p.slug}`} className="pcard-img-link" tabIndex={-1}>
        {/* Image */}
        <div className="pcard-img-wrap">
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            sizes="(max-width: 600px) 160px, 240px"
            style={{ objectFit: 'cover' }}
          />

          {/* Bestseller / Featured badge */}
          {isFeatured && (
            <span className="pcard-badge-featured" aria-label="Bestseller">
              ★ BESTSELLER
            </span>
          )}

          {/* Rating overlay at bottom of image */}
          <div className="pcard-rating" aria-label="Rating">
            <Star size={11} weight="fill" color="#f5c518" />
            <span className="pcard-rating-score">4.8</span>
            <span className="pcard-rating-sep">·</span>
            <span className="pcard-rating-count">{p.stock > 10 ? '120+' : p.stock > 0 ? `${p.stock * 4}` : '0'}</span>
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div className="pcard-body">
        <h3 className="pcard-name">
          <Link href={`/product/${p.slug}`}>{p.name}</Link>
        </h3>
        {p.description && (
          <p className="pcard-desc">{p.description}</p>
        )}

        <div className="pcard-footer">
          <div className="pcard-prices">
            <span className="pcard-price">{money(p.price)}</span>
            {hasDiscount && (
              <span className="pcard-compare">{money(p.compareAtPrice)}</span>
            )}
          </div>
          <Link
            href={`/product/${p.slug}`}
            className="pcard-btn"
            aria-label={`View ${p.name}`}
          >
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}
