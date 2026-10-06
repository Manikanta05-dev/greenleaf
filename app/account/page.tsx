'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import {
  SquaresFour, Package as PhPackage, MapPin as PhMapPin,
  CaretDown, CaretUp, ArrowSquareOut, PencilSimple, Trash, Plus, X,
} from '@phosphor-icons/react';
import { money } from '@/lib/format';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', PAID: '#10b981', PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6', DELIVERED: '#2e7d32', CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

const EMPTY_ADDR = {
  label: 'Home', line1: '', line2: '', city: '', state: '',
  postalCode: '', country: 'India', phone: '',
};

function AccountInner() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [dbUser, setDbUser]           = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Address modal state
  const [addrModal, setAddrModal]     = useState(false);
  const [editingAddr, setEditingAddr] = useState<any>(null);
  const [addrForm, setAddrForm]       = useState({ ...EMPTY_ADDR });
  const [addrError, setAddrError]     = useState('');
  const [addrSaving, setAddrSaving]   = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setDbUser(d.user || null); setLoading(false); });
  }, [isLoaded, isSignedIn]);

  // ── Address modal helpers ────────────────────────────────────────────────
  function openNewAddr() {
    setEditingAddr(null);
    setAddrForm({ ...EMPTY_ADDR });
    setAddrError('');
    setAddrModal(true);
  }

  function openEditAddr(a: any) {
    setEditingAddr(a);
    setAddrForm({
      label:      a.label,
      line1:      a.line1,
      line2:      a.line2 ?? '',
      city:       a.city,
      state:      a.state,
      postalCode: a.postalCode,
      country:    a.country,
      phone:      a.phone ?? '',
    });
    setAddrError('');
    setAddrModal(true);
  }

  function closeAddrModal() {
    setAddrModal(false);
    setEditingAddr(null);
    setAddrError('');
  }

  async function saveAddr() {
    setAddrError('');
    if (!addrForm.line1 || !addrForm.city || !addrForm.state || !addrForm.postalCode) {
      setAddrError('Please fill in all required fields.'); return;
    }
    if (!/^\d{6}$/.test(addrForm.postalCode)) {
      setAddrError('PIN code must be exactly 6 digits.'); return;
    }
    if (addrForm.phone && !/^\d{10}$/.test(addrForm.phone)) {
      setAddrError('Mobile number must be exactly 10 digits.'); return;
    }

    setAddrSaving(true);
    try {
      const payload = { ...addrForm, phone: addrForm.phone || undefined };
      const url    = editingAddr ? `/api/addresses?id=${editingAddr.id}` : '/api/addresses';
      const method = editingAddr ? 'PUT' : 'POST';
      const r      = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) { setAddrError(d.error || 'Failed to save address.'); return; }

      const me = await fetch('/api/auth/me').then(x => x.json());
      setDbUser(me.user);
      closeAddrModal();
    } finally {
      setAddrSaving(false);
    }
  }

  async function deleteAddr(id: string) {
    if (!confirm('Delete this address?')) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (!r.ok) { alert('Failed to delete address.'); return; }
      const me = await fetch('/api/auth/me').then(x => x.json());
      setDbUser(me.user);
    } finally {
      setDeletingId(null);
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  if (!isLoaded || loading) return (
    <main className="container section"><p className="muted">Loading…</p></main>
  );

  // Not signed in — show a prompt
  if (!isSignedIn) return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 520, margin: 'auto', textAlign: 'center', padding: '48px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, marginBottom: 12 }}>
          Welcome to GreenLeaf
        </h1>
        <p className="muted" style={{ marginBottom: 28 }}>
          Sign in to view your orders, manage addresses, and more.
        </p>
        <SignInButton mode="modal">
          <button className="btn primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            Sign In / Create Account
          </button>
        </SignInButton>
      </div>
    </main>
  );

  const user = dbUser;

  if (!user) return (
    <main className="container section"><p className="muted">Loading your account…</p></main>
  );

  return (
    <main className="container section">
      <div className="account-layout">

        {/* ── Left sidebar ── */}
        <aside className="account-sidebar">
          <div className="account-sidebar-card">
            <div className="account-header-box">
              <div className="account-avatar">
                {clerkUser?.imageUrl
                  ? <img src={clerkUser.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  : user.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="account-name">{user.name}</div>
              <div className="account-email">{user.email}</div>
            </div>
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
            </nav>
          </div>
        </aside>

        {/* ── Right content ── */}
        <div className="account-content">
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
                      role="button" tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                    >
                      <div>
                        <div className="account-order-id">Order #{o.id.slice(-8)}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="badge" style={{ background: (STATUS_COLOR[o.status] ?? '#ccc') + '22', color: STATUS_COLOR[o.status] ?? '#555' }}>
                          {o.status}
                        </span>
                        <span style={{ fontWeight: 700 }}>{money(o.total)}</span>
                        {expandedOrder === o.id ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                      </div>
                    </div>

                    {expandedOrder === o.id && (
                      <div className="account-order-detail">
                        <div className="account-order-items">
                          {o.items?.map((item: any) => (
                            <div key={item.id} className="account-order-item">
                              <span>{item.name}</span>
                              <span className="muted">× {item.quantity}</span>
                              <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{money(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="account-order-totals">
                          <div><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
                          <div><span>Shipping</span><span>{o.shipping === 0 ? 'Free' : money(o.shipping)}</span></div>
                          <div><span>GST</span><span>{money(o.tax)}</span></div>
                          <div style={{ fontWeight: 700, borderTop: '1px solid var(--border-light)', paddingTop: 8, marginTop: 4 }}>
                            <span>Total</span><span>{money(o.total)}</span>
                          </div>
                        </div>
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
                        <div style={{ marginTop: 12 }}>
                          <a href={`/api/orders/receipt?id=${o.id}`} target="_blank" rel="noreferrer"
                            className="btn" style={{ fontSize: 13, gap: 6, padding: '8px 16px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="account-section-title" style={{ marginBottom: 0 }}>Saved Addresses</h2>
              <button className="btn primary" style={{ gap: 6, padding: '8px 16px', fontSize: 13 }} onClick={openNewAddr}>
                <Plus size={14} weight="bold" /> Add Address
              </button>
            </div>

            {user.addresses?.length ? (
              <div className="account-addr-grid">
                {user.addresses.map((a: any) => (
                  <div key={a.id} className={`account-addr-card${a.isDefault ? ' default' : ''}`}>
                    {a.isDefault && (
                      <span className="badge" style={{ fontSize: 10, marginBottom: 8, display: 'inline-flex' }}>Default</span>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                      {a.city}, {a.state} — {a.postalCode}<br />
                      {a.country}
                      {a.phone && <><br />📱 +91 {a.phone}</>}
                    </div>
                    <div className="account-addr-actions">
                      <button className="btn sm" style={{ gap: 5 }} onClick={() => openEditAddr(a)}>
                        <PencilSimple size={13} weight="bold" /> Edit
                      </button>
                      <button
                        className="btn sm"
                        style={{ gap: 5, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => deleteAddr(a.id)}
                        disabled={deletingId === a.id}
                      >
                        <Trash size={13} weight="bold" />
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No saved addresses yet. Add one to speed up checkout.</p>
            )}
          </section>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADDRESS MODAL
      ══════════════════════════════════════ */}
      {addrModal && (
        <div className="addr-modal-backdrop" onClick={closeAddrModal} role="dialog" aria-modal="true" aria-label="Address form">
          <div className="addr-modal" onClick={e => e.stopPropagation()}>
            <div className="addr-modal-header">
              <h3>{editingAddr ? 'Edit Address' : 'Add New Address'}</h3>
              <button className="addr-modal-close" onClick={closeAddrModal} aria-label="Close">
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="addr-modal-body">
              <div className="form-group">
                <label>Label</label>
                <select className="select" value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })}>
                  {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input className="input" placeholder="Flat / House no., Street name"
                  value={addrForm.line1} onChange={e => setAddrForm({ ...addrForm, line1: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input className="input" placeholder="Landmark, Area (optional)"
                  value={addrForm.line2} onChange={e => setAddrForm({ ...addrForm, line2: e.target.value })} />
              </div>

              <div className="addr-modal-row">
                <div className="form-group">
                  <label>City *</label>
                  <input className="input" placeholder="Mumbai"
                    value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    className="input"
                    placeholder="400001"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="\d{6}"
                    value={addrForm.postalCode}
                    onChange={e => setAddrForm({ ...addrForm, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>State *</label>
                <select className="select" value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}>
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Mobile Number (optional)</label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">+91</span>
                  <input
                    className="input phone-input"
                    placeholder="98765 43210"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={addrForm.phone}
                    onChange={e => setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
                {addrForm.phone && addrForm.phone.length < 10 && (
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                    {10 - addrForm.phone.length} more digit{10 - addrForm.phone.length !== 1 ? 's' : ''} needed
                  </span>
                )}
              </div>

              {addrError && (
                <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{addrError}</p>
              )}
            </div>

            <div className="addr-modal-footer">
              <button className="btn" onClick={closeAddrModal}>Cancel</button>
              <button className="btn primary" onClick={saveAddr} disabled={addrSaving}>
                {addrSaving ? 'Saving…' : editingAddr ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}
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
