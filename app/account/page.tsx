'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SquaresFour, Package as PhPackage, MapPin as PhMapPin, SignOut, CaretDown, CaretUp, ArrowSquareOut } from '@phosphor-icons/react';
import { money } from '@/lib/format';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', PAID: '#10b981', PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6', DELIVERED: '#2e7d32', CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};

function AccountInner() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d.user || null); setLoading(false); });
  }, []);

  async function submit() {
    setMsg('');
    const r = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || 'Something went wrong'); return; }
    setUser(d.user);
    const redirect = sp.get('redirect');
    if (redirect) router.push(redirect);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
  }

  if (loading) return (
    <main className="container section">
      <p className="muted">Loading…</p>
    </main>
  );

  if (user) return (
    <main className="container section">
      <div className="account-layout">
        {/* ── Left sidebar ── */}
        <aside className="account-sidebar">
          <div className="account-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="account-name">{user.name}</div>
          <div className="account-email">{user.email}</div>

          {/* Role badge */}
          {user.role === 'ADMIN' && (
            <span className="account-role-badge">Admin</span>
          )}

          <nav className="account-nav">
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="account-nav-item admin-nav-item">
                <SquaresFour size={16} weight="duotone" />
                Admin Dashboard
              </Link>
            )}
            <a href="#orders" className="account-nav-item">
              <PhPackage size={16} weight="duotone" />
              My Orders
            </a>
            <a href="#addresses" className="account-nav-item">
              <PhMapPin size={16} weight="duotone" />
              Saved Addresses
            </a>
            <button className="account-nav-item danger" onClick={logout}>
              <SignOut size={16} weight="bold" />
              Log Out
            </button>
          </nav>
        </aside>

        {/* ── Right content ── */}
        <div className="account-content">
          {/* Admin quick-access banner */}
          {user.role === 'ADMIN' && (
            <div className="admin-banner">
              <SquaresFour size={18} weight="duotone" />
              <div>
                <strong>You're logged in as Admin.</strong>
                <span> Manage products, orders, and inventory from the dashboard.</span>
              </div>
              <Link href="/admin" className="btn primary" style={{ flexShrink: 0, padding: '8px 18px' }}>
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* ── Orders ── */}
          <section id="orders" className="account-section">
            <h2 className="account-section-title">My Orders</h2>
            {user.orders?.length ? (
              <div className="account-orders-list">
                {user.orders.map((o: any) => (
                  <div key={o.id} className="account-order-card">
                    <div
                      className="account-order-header"
                      onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                    >
                      <div>
                        <div className="account-order-id">Order #{o.id.slice(-8)}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="badge" style={{ background: (STATUS_COLOR[o.status] ?? '#ccc') + '22', color: STATUS_COLOR[o.status] ?? '#555' }}>
                          {o.status}
                        </span>
                        <span style={{ fontWeight: 800 }}>{money(o.total)}</span>
                        {expandedOrder === o.id ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                      </div>
                    </div>

                    {expandedOrder === o.id && (
                      <div className="account-order-detail">
                        {/* Items */}
                        <div className="account-order-items">
                          {o.items?.map((item: any) => (
                            <div key={item.id} className="account-order-item">
                              <span>{item.name}</span>
                              <span className="muted">× {item.quantity}</span>
                              <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{money(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        {/* Totals */}
                        <div className="account-order-totals">
                          <div><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
                          <div><span>Shipping</span><span>{o.shipping === 0 ? 'Free' : money(o.shipping)}</span></div>
                          <div><span>GST</span><span>{money(o.tax)}</span></div>
                          <div style={{ fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                            <span>Total</span><span>{money(o.total)}</span>
                          </div>
                        </div>
                        {/* Tracking */}
                        {o.trackingNumber && (
                          <div className="account-tracking">
                            <span>📦 Tracking: <strong>{o.trackingNumber}</strong></span>
                            {o.trackingUrl && (
                              <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '4px 12px', fontSize: 12, gap: 4 }}>
                                Track <ArrowSquareOut size={11} />
                              </a>
                            )}
                          </div>
                        )}
                        {/* Download receipt */}
                        <div style={{ marginTop: 12 }}>
                          <a
                            href={`/api/orders/receipt?id=${o.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn"
                            style={{ fontSize: 13, gap: 6, padding: '8px 16px' }}
                          >
                            📄 Download Receipt (PDF)
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty" style={{ padding: '32px 0' }}>
                <p>No orders yet.</p>
                <Link className="btn primary" href="/shop">Start Shopping</Link>
              </div>
            )}
          </section>

          {/* ── Addresses ── */}
          <section id="addresses" className="account-section">
            <h2 className="account-section-title">Saved Addresses</h2>
            {user.addresses?.length ? (
              <div className="account-addr-grid">
                {user.addresses.map((a: any) => (
                  <div key={a.id} className="account-addr-card">
                    <div className="account-addr-label">{a.label}</div>
                    <div className="account-addr-text">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                      {a.city}, {a.state} — {a.postalCode}<br />
                      {a.country}{a.phone ? ` · ${a.phone}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No saved addresses. Add one during checkout.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );

  // ── Login / Register ──
  return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 520, margin: 'auto' }}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        {mode === 'register' && (
          <input className="input" style={{ marginTop: 12 }} placeholder="Full name" autoComplete="name"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} suppressHydrationWarning />
        )}
        <input className="input" style={{ marginTop: 12 }} placeholder="Email" type="email" autoComplete="email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} suppressHydrationWarning />
        <input className="input" style={{ marginTop: 12 }} placeholder="Password" type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} suppressHydrationWarning />
        {mode === 'register' && (
          <input className="input" style={{ marginTop: 12 }} placeholder="Phone (optional)" type="tel" autoComplete="tel"
            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} suppressHydrationWarning />
        )}
        <button className="btn primary" style={{ marginTop: 16, width: '100%' }} onClick={submit}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        {msg && <p style={{ color: 'var(--danger)', marginTop: 8, fontSize: 13 }}>{msg}</p>}
        <button className="btn ghost" style={{ marginTop: 8, width: '100%' }}
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMsg(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </div>
    </main>
  );
}

export default function Account() {
  return (
    <Suspense fallback={<main className="container section"><p className="muted">Loading…</p></main>}>
      <AccountInner />
    </Suspense>
  );
}
