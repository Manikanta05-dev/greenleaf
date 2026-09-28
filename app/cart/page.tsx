'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2, ShoppingBag, Tag, ChevronRight, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { money } from '@/lib/format';

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    // Restore any previously applied coupon
    const saved = JSON.parse(localStorage.getItem('coupon') || 'null');
    if (saved) {
      setCoupon(saved.code);
      setDiscount(saved.discount);
      setCouponMsg(`✓ ${saved.discount}% discount applied!`);
    }
  }, []);

  function update(i: number, q: number) {
    const c = [...cart];
    c[i].quantity = Math.max(0, Math.min(c[i].product.stock, q));
    const next = c.filter(x => x.quantity > 0);
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (code === 'GREEN10') {
      setDiscount(10);
      setCouponMsg('✓ 10% discount applied!');
      localStorage.setItem('coupon', JSON.stringify({ code: 'GREEN10', discount: 10 }));
    } else if (code === 'WELCOME') {
      setDiscount(5);
      setCouponMsg('✓ 5% welcome discount applied!');
      localStorage.setItem('coupon', JSON.stringify({ code: 'WELCOME', discount: 5 }));
    } else {
      setDiscount(0);
      setCouponMsg('✗ Invalid coupon code');
      localStorage.removeItem('coupon');
    }
  }

  const subtotal  = cart.reduce((s, x) => s + x.product.price * x.quantity, 0);
  const shipping  = subtotal >= 999 ? 0 : 99;
  const discountAmt = Math.round(subtotal * discount / 100);
  const total     = subtotal + shipping - discountAmt;
  const itemCount = cart.reduce((s, x) => s + x.quantity, 0);

  if (!cart.length) return (
    <main className="container" style={{ padding: '80px 20px' }}>
      <div className="empty">
        <ShoppingBag size={64} strokeWidth={1} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
        <h2>Your cart is empty</h2>
        <p>Browse our collection and find your perfect plant.</p>
        <Link className="btn primary" href="/shop">Start Shopping</Link>
      </div>
    </main>
  );

  return (
    <main className="container" style={{ padding: '32px 20px 64px' }}>
      <h1 className="cart-page-title">
        Shopping Cart <span className="cart-count-pill">{itemCount}</span>
      </h1>

      <div className="cart-page-layout">
        {/* ── Left: items ── */}
        <div className="cart-items-col">
          {cart.map((x, i) => (
            <div className="cart-card" key={x.productId}>
              <div className="cart-card-img">
                <Image
                  src={x.product.imageUrl}
                  alt={x.product.name}
                  fill
                  sizes="88px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="cart-card-info">
                <div className="cart-card-name">{x.product.name}</div>
                {x.product.size && <div className="cart-card-meta">{x.product.size}</div>}
                <div className="cart-card-unit">{money(x.product.price)} each</div>
              </div>
              <div className="cart-card-right">
                <div className="cart-card-total">{money(x.product.price * x.quantity)}</div>
                <div className="qty-ctrl">
                  <button onClick={() => update(i, x.quantity - 1)} aria-label="Decrease">−</button>
                  <span>{x.quantity}</span>
                  <button onClick={() => update(i, x.quantity + 1)} aria-label="Increase">+</button>
                </div>
                <button
                  className="cart-remove"
                  onClick={() => update(i, 0)}
                  aria-label={`Remove ${x.product.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Trust badges */}
          <div className="cart-trust">
            <div className="cart-trust-item"><ShieldCheck size={15} /><span>Secure checkout</span></div>
            <div className="cart-trust-item"><Truck size={15} /><span>Free shipping above ₹999</span></div>
            <div className="cart-trust-item"><RefreshCw size={15} /><span>7-day replacement</span></div>
          </div>
        </div>

        {/* ── Right: summary ── */}
        <aside className="cart-summary-col">
          <div className="cart-summary-box">
            <h2 className="cart-summary-title">Order Summary</h2>

            {/* Coupon */}
            <div className="coupon-row">
              <Tag size={15} style={{ color: 'var(--brand)', flexShrink: 0 }} />
              <input
                className="coupon-input"
                placeholder="Discount code or gift card"
                value={coupon}
                onChange={e => { setCoupon(e.target.value); setCouponMsg(''); }}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                suppressHydrationWarning
              />
              <button className="coupon-btn" onClick={applyCoupon}>Apply</button>
            </div>
            {couponMsg && (
              <p style={{
                fontSize: 12, marginTop: 6,
                color: couponMsg.startsWith('✓') ? 'var(--brand)' : 'var(--danger)',
              }}>{couponMsg}</p>
            )}

            {/* Lines */}
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--brand)' : undefined, fontWeight: shipping === 0 ? 700 : undefined }}>
                  {shipping === 0 ? 'Free' : money(shipping)}
                </span>
              </div>
              {discountAmt > 0 && (
                <div className="summary-line" style={{ color: 'var(--brand)' }}>
                  <span>Discount ({discount}%)</span>
                  <span>−{money(discountAmt)}</span>
                </div>
              )}
              {shipping > 0 && (
                <p className="free-ship-nudge">
                  Add {money(999 - subtotal)} more to get <b>free shipping</b>
                </p>
              )}
            </div>

            <div className="summary-total-row">
              <span>Total</span>
              <span>
                <small style={{ fontSize: 12, fontWeight: 400, opacity: .7 }}>INR </small>
                {money(total)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="btn primary full checkout-cta"
            >
              Proceed to Checkout <ChevronRight size={16} />
            </Link>

            <Link href="/shop" className="btn ghost full" style={{ marginTop: 8, fontSize: 13 }}>
              ← Continue Shopping
            </Link>

            {/* 10M trust line */}
            <div className="cart-summary-trust">
              <ShieldCheck size={14} /> 10 Million+ Happy Customers Trust Us!
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
