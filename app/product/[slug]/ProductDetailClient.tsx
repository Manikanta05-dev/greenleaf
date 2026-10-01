'use client';
import { useState } from 'react';
import { ShoppingCartSimple, Check } from '@phosphor-icons/react';

export function ProductDetailClient({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function add() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const i = cart.findIndex((x: any) => x.productId === product.id);
    if (i >= 0) cart[i].quantity = Math.min(product.stock, cart[i].quantity + qty);
    else cart.push({ productId: product.id, quantity: qty, product });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (product.stock === 0) {
    return (
      <div className="pd-atc-wrap">
        <button className="btn full" disabled style={{ opacity: .5, cursor: 'not-allowed', padding: '14px' }}>
          Out of Stock
        </button>
      </div>
    );
  }

  return (
    <div className="pd-atc-wrap">
      {/* Qty selector */}
      <div className="pd-qty-row">
        <span className="pd-qty-label">Quantity</span>
        <div className="qty-ctrl">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="Increase">+</button>
        </div>
        <span className="pd-stock-note">{product.stock} in stock</span>
      </div>

      {/* Add to cart */}
      <button
        className={`btn ${added ? 'outline' : 'primary'} full pd-atc-btn`}
        onClick={add}
      >
        {added ? <Check size={18} weight="bold" /> : <ShoppingCartSimple size={18} weight="bold" />}
        {added ? 'Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}
