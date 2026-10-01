'use client';
import { useState } from 'react';
import { ShoppingCartSimple } from '@phosphor-icons/react';

export function AddToCart({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function add() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const i = cart.findIndex((x: any) => x.productId === product.id);
    if (i >= 0) {
      cart[i].quantity = Math.min(product.stock, cart[i].quantity + qty);
    } else {
      cart.push({ productId: product.id, quantity: qty, product });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (product.stock === 0) {
    return (
      <button className="btn" disabled style={{ opacity: .5, cursor: 'not-allowed' }}>
        Out of Stock
      </button>
    );
  }

  return (
    <div className="stack">
      <div className="qty-row">
        <div className="qty-ctrl">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            aria-label="Decrease quantity"
          >−</button>
          <span>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            aria-label="Increase quantity"
          >+</button>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{product.stock} in stock</span>
      </div>
      <button
        className={`btn ${added ? 'outline' : 'primary'} full`}
        onClick={add}
        style={{ gap: 8, padding: '13px 20px', fontSize: 15 }}
      >
        <ShoppingCartSimple size={17} weight="bold" />
        {added ? '✓ Added to Cart!' : 'Add to Cart'}
      </button>
    </div>
  );
}
