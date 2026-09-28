'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Props {
  products: any[];
}

export function ProductRow({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }

  if (!products.length) return null;

  return (
    <div className="prow-wrap">
      <button
        className="prow-arrow prow-arrow-left"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="prow-track" ref={trackRef}>
        {products.map(p => (
          <div className="prow-item" key={p.id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>

      <button
        className="prow-arrow prow-arrow-right"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
