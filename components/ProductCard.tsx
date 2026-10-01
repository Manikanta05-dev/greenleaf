'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCartSimple, Heart } from '@phosphor-icons/react';
import { money } from '@/lib/format';

export function ProductCard({ p }: { p: any }) {
  const hasDiscount   = p.compareAtPrice && p.compareAtPrice > p.price;
  const discountPct   = hasDiscount
    ? Math.round((1 - p.price / p.compareAtPrice) * 100)
    : null;
  const outOfStock    = p.stock === 0;
  const reviewCount   = p.stock > 10 ? '120+' : p.stock > 0 ? `${p.stock * 4}` : '0';

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx  = cart.findIndex((x: any) => x.productId === p.id);
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
      {/* ── Image area ── */}
      <Link href={`/product/${p.slug}`} className="pcard-img-link" tabIndex={-1} aria-label={p.name}>
        <div className="pcard-img-wrap">
          <Image
            src={p.imageUrl}
            alt={p.name}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 40vw, 248px"
            style={{ objectFit: 'cover' }}
          />

          {/* Discount badge — top left, accent orange */}
          {discountPct && (
            <span className="pcard-badge-discount" aria-label={`${discountPct}% off`}>
              -{discountPct}%
            </span>
          )}

          {/* Bestseller badge — only when no discount */}
          {!discountPct && p.featured && (
            <span className="pcard-badge-featured">★ Bestseller</span>
          )}

          {/* Wishlist button — top right */}
          <button
            className="pcard-wishlist"
            aria-label={`Save ${p.name}`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart size={16} weight="bold" />
          </button>

          {/* Rating pill — bottom left, above quick-add */}
          {!outOfStock && (
            <div className="pcard-rating" aria-label="Rating">
              <Star size={11} weight="fill" color="#c8980a" />
              <span className="pcard-rating-score">4.8</span>
              <span className="pcard-rating-sep">·</span>
              <span className="pcard-rating-count">{reviewCount}</span>
            </div>
          )}

          {/* Quick-add button — slides up on hover */}
          {outOfStock ? (
            <div className="pcard-quick-add pcard-out-of-stock">Out of Stock</div>
          ) : (
            <button
              className="pcard-quick-add"
              onClick={addToCart}
              aria-label={`Add ${p.name} to cart`}
            >
              <ShoppingCartSimple size={14} weight="bold" />
              Add to Cart
            </button>
          )}
        </div>
      </Link>

      {/* ── Card body ── */}
      <div className="pcard-body">
        {/* Category label */}
        {p.category?.name && (
          <span className="pcard-cat">{p.category.name}</span>
        )}

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
            {discountPct && (
              <span className="pcard-discount-pct">{discountPct}% off</span>
            )}
          </div>
          <Link
            href={`/product/${p.slug}`}
            className="pcard-btn"
            aria-label={`View ${p.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
