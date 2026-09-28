'use client';
import Link from 'next/link';
import { ShoppingCart, User, Search, Leaf, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

/* ── Mega-menu data ── */
const NAV = [
  {
    label: 'Plants',
    href: '/shop',
    columns: [
      {
        heading: 'Plants by Type',
        links: [
          { label: 'Indoor Plants',       href: '/shop?category=indoor-plants' },
          { label: 'Outdoor Plants',      href: '/shop?category=outdoor-plants' },
          { label: 'Flowering Plants',    href: '/shop?q=flowering' },
          { label: 'Succulents & Cacti',  href: '/shop?q=succulent' },
          { label: 'Herb Plants',         href: '/shop?q=herb' },
          { label: 'Fruit Plants',        href: '/shop?q=fruit' },
          { label: 'Climbers & Creepers', href: '/shop?q=climber' },
          { label: 'Bamboos',             href: '/shop?q=bamboo' },
          { label: 'Ornamental Plants',   href: '/shop?q=ornamental' },
          { label: 'Shrubs',              href: '/shop?q=shrubs' },
        ],
      },
      {
        heading: 'Plants by Feature',
        links: [
          { label: 'Air Purifier Plants',     href: '/shop?q=air+purifier' },
          { label: 'Low Maintenance',         href: '/shop?difficulty=Beginner' },
          { label: 'Easy Care',               href: '/shop?difficulty=Easy' },
          { label: 'Lucky Plants',            href: '/shop?q=lucky' },
          { label: 'Medicinal Plants',        href: '/shop?q=medicinal' },
          { label: 'Fragrant Plants',         href: '/shop?q=fragrant' },
          { label: 'Vastu Plants',            href: '/shop?q=vastu' },
          { label: 'Spice & Herb Plants',     href: '/shop?q=spice' },
          { label: 'Foliage Plants',          href: '/shop?q=foliage' },
          { label: 'Hanging Plants',          href: '/shop?q=hanging' },
        ],
      },
      {
        heading: 'Plants by Location',
        links: [
          { label: 'Plants for Balcony',     href: '/shop?q=balcony' },
          { label: 'Plants for Bedroom',     href: '/shop?q=bedroom' },
          { label: 'Plants for Living Room', href: '/shop?q=living+room' },
          { label: 'Plants for Office Desk', href: '/shop?q=office' },
          { label: 'Plants for Terrace',     href: '/shop?q=terrace' },
          { label: 'Large Indoor Plants',    href: '/shop?q=large+indoor' },
          { label: 'Indoor Flower Plants',   href: '/shop?q=indoor+flower' },
          { label: 'Vertical Garden',        href: '/shop?q=vertical' },
          { label: 'Outdoor Garden',         href: '/shop?category=outdoor-plants' },
        ],
      },
      {
        heading: 'Top 10 Plants',
        links: [
          { label: 'Top 10 Air Purifiers',   href: '/shop?q=air+purifier' },
          { label: 'Top 10 Flowering',       href: '/shop?q=flowering' },
          { label: 'Top 10 Indoor Plants',   href: '/shop?category=indoor-plants' },
          { label: 'Top 10 Succulents',      href: '/shop?q=succulent' },
          { label: 'Top 10 Hardy Plants',    href: '/shop?difficulty=Beginner' },
          { label: 'Top 10 Fragrant',        href: '/shop?q=fragrant' },
          { label: 'Top 10 Mosquito Repel.', href: '/shop?q=mosquito' },
        ],
      },
    ],
  },
  {
    label: 'Pots & Planters',
    href: '/shop?category=pots-planters',
    columns: [
      {
        heading: 'By Material',
        links: [
          { label: 'Terracotta Pots',    href: '/shop?q=terracotta' },
          { label: 'Ceramic Pots',       href: '/shop?q=ceramic' },
          { label: 'Plastic Pots',       href: '/shop?q=plastic' },
          { label: 'Metal Planters',     href: '/shop?q=metal' },
          { label: 'Eco-friendly Pots',  href: '/shop?q=eco' },
          { label: 'Hanging Planters',   href: '/shop?q=hanging+planter' },
        ],
      },
      {
        heading: 'By Size',
        links: [
          { label: 'Small Pots (4–5")',  href: '/shop?q=small+pot' },
          { label: 'Medium Pots (6–8")', href: '/shop?q=medium+pot' },
          { label: 'Large Pots (10"+)',  href: '/shop?q=large+pot' },
          { label: 'Troughs & Trays',    href: '/shop?q=trough' },
          { label: 'Window Boxes',       href: '/shop?q=window+box' },
        ],
      },
      {
        heading: 'By Style',
        links: [
          { label: 'Modern & Minimal',   href: '/shop?q=modern+planter' },
          { label: 'Rustic & Earthy',    href: '/shop?q=rustic+planter' },
          { label: 'Decorative Pots',    href: '/shop?q=decorative+pot' },
          { label: 'Self-Watering Pots', href: '/shop?q=self+watering' },
        ],
      },
    ],
  },
  {
    label: 'Soil & Fertilizer',
    href: '/shop?category=soil-fertilizer',
    columns: [
      {
        heading: 'Soil & Compost',
        links: [
          { label: 'Potting Mix',        href: '/shop?q=potting+mix' },
          { label: 'Cactus Mix',         href: '/shop?q=cactus+mix' },
          { label: 'Vermicompost',       href: '/shop?q=vermicompost' },
          { label: 'Organic Compost',    href: '/shop?q=compost' },
          { label: 'Cocopeat',           href: '/shop?q=cocopeat' },
          { label: 'Perlite & Pumice',   href: '/shop?q=perlite' },
        ],
      },
      {
        heading: 'Fertilizers',
        links: [
          { label: 'Liquid Fertilizer',  href: '/shop?q=liquid+fertilizer' },
          { label: 'Granular Fertilizer',href: '/shop?q=granular' },
          { label: 'Organic Fertilizer', href: '/shop?q=organic+fertilizer' },
          { label: 'NPK Fertilizer',     href: '/shop?q=npk' },
          { label: 'Neem Oil',           href: '/shop?q=neem' },
          { label: 'Seaweed Extract',    href: '/shop?q=seaweed' },
        ],
      },
    ],
  },
  {
    label: 'Tools',
    href: '/shop?category=tools',
    columns: [
      {
        heading: 'Garden Tools',
        links: [
          { label: 'Pruning Shears',     href: '/shop?q=pruning' },
          { label: 'Trowels & Shovels',  href: '/shop?q=trowel' },
          { label: 'Watering Cans',      href: '/shop?q=watering+can' },
          { label: 'Garden Gloves',      href: '/shop?q=gloves' },
          { label: 'Sprayers',           href: '/shop?q=sprayer' },
          { label: 'Seed Trays',         href: '/shop?q=seed+tray' },
        ],
      },
      {
        heading: 'Care & Accessories',
        links: [
          { label: 'Plant Stakes',       href: '/shop?q=stakes' },
          { label: 'Grow Bags',          href: '/shop?q=grow+bag' },
          { label: 'Pebbles & Stones',   href: '/shop?q=pebbles' },
          { label: 'Moisture Meters',    href: '/shop?q=moisture+meter' },
          { label: 'Grow Lights',        href: '/shop?q=grow+light' },
        ],
      },
    ],
  },
];

export function Header() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sync = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCount(cart.reduce((a: number, x: any) => a + x.quantity, 0));
      } catch {}
    };
    sync();
    window.addEventListener('cart-updated', sync);
    return () => window.removeEventListener('cart-updated', sync);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  /* Keep mega-menu open while mouse moves between trigger and panel */
  function openNav(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }
  function closeNav() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="announcement">
        🌱 Free shipping on orders above ₹999 &nbsp;·&nbsp; 7-day free replacement guarantee
      </div>

      {/* ── Main header: logo + search + icons ── */}
      <header className="header">
        <div className="container header-inner">
          {/* Hamburger — mobile only */}
          <button
            className="mobile-menu-btn"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link className="logo" href="/">
            <Leaf size={22} strokeWidth={2.5} />
            GreenLeaf
          </Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search plants, pots, tools…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search"
            />
            <button type="submit" aria-label="Submit search">
              <Search size={15} />
            </button>
          </form>

          <div className="header-actions">
            <Link className="icon-btn" href="/account">
              <User size={17} />
              <span>Account</span>
            </Link>
            <Link className="icon-btn" href="/cart" aria-label={`Cart (${count} items)`}>
              <ShoppingCart size={17} />
              <span>Cart</span>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Navigation menu">
          <div className="mobile-nav-inner">
            <form className="mobile-nav-search" onSubmit={e => { handleSearch(e); setMobileOpen(false); }}>
              <input
                type="search"
                placeholder="Search plants, pots, tools…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search"
              />
              <button type="submit" aria-label="Search"><Search size={15} /></button>
            </form>

            {NAV.map(item => (
              <div key={item.label} className="mobile-nav-section">
                <button
                  className="mobile-nav-item-btn"
                  onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  aria-expanded={mobileExpanded === item.label}
                >
                  <span>{item.label}</span>
                  <ChevronDown size={16} style={{ transform: mobileExpanded === item.label ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
                {mobileExpanded === item.label && (
                  <div className="mobile-nav-sub">
                    {item.columns.flatMap(col => col.links).slice(0, 8).map(l => (
                      <Link
                        key={l.label}
                        href={l.href}
                        className="mobile-nav-link"
                        onClick={() => setMobileOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                    <Link href={item.href} className="mobile-nav-link mobile-nav-link-all" onClick={() => setMobileOpen(false)}>
                      View all {item.label} →
                    </Link>
                  </div>
                )}
              </div>
            ))}

            <div className="mobile-nav-footer">
              <Link href="/account" className="mobile-nav-footer-link" onClick={() => setMobileOpen(false)}>
                <User size={16} /> Account
              </Link>
              <Link href="/cart" className="mobile-nav-footer-link" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={16} /> Cart {count > 0 && `(${count})`}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Mega-nav bar ── */}
      <nav className="mega-nav" onMouseLeave={closeNav}>
        <div className="container mega-nav-inner">
          {NAV.map(item => (
            <div
              key={item.label}
              className={`mega-nav-item${openMenu === item.label ? ' open' : ''}`}
              onMouseEnter={() => openNav(item.label)}
            >
              <Link
                href={item.href}
                className="mega-nav-trigger"
                onClick={() => setOpenMenu(null)}
              >
                {item.label}
                <ChevronDown size={13} className="mega-chevron" />
              </Link>

              {/* Dropdown panel */}
              {openMenu === item.label && (
                <div
                  className="mega-dropdown"
                  onMouseEnter={cancelClose}
                  onMouseLeave={closeNav}
                >
                  <div className="container mega-dropdown-inner">
                    {item.columns.map(col => (
                      <div key={col.heading} className="mega-col">
                        <div className="mega-col-heading">{col.heading}</div>
                        <ul>
                          {col.links.map(l => (
                            <li key={l.label}>
                              <Link
                                href={l.href}
                                className="mega-link"
                                onClick={() => setOpenMenu(null)}
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Quick direct links */}
          <Link href="/shop" className="mega-nav-trigger mega-nav-plain">
            All Products
          </Link>
        </div>
      </nav>
    </>
  );
}
