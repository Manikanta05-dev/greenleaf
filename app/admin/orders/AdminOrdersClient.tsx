'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { money } from '@/lib/format';

const STATUSES = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', PAID: '#10b981', PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6', DELIVERED: '#2e7d32', CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const load = () =>
    fetch('/api/admin/orders-data')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []));

  useEffect(() => { load(); }, []);

  async function update(id: string, status: string) {
    await fetch('/api/admin/orders/' + id, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function refund(id: string) {
    if (!confirm('Issue a full Razorpay refund and restock items?')) return;
    const r = await fetch('/api/admin/orders/' + id, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'refund' }),
    });
    const d = await r.json();
    if (!r.ok) alert(d.error);
    load();
  }

  const visible = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <main className="container section">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="muted">{orders.length} total orders</p>
        </div>
        <div className="adminnav" style={{ margin: 0 }}>
          <Link className="btn" href="/admin">Dashboard</Link>
          <Link className="btn" href="/admin/products">Products</Link>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className={`btn ${!filter ? 'primary' : ''}`} onClick={() => setFilter('')}>All</button>
        {STATUSES.map(s => (
          <button
            key={s}
            className={`btn ${filter === s ? 'primary' : ''}`}
            style={{ fontSize: 12 }}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(o => (
              <tr key={o.id}>
                <td>
                  <code style={{ fontSize: 12 }}>#{o.id.slice(-8)}</code>
                  <div className="muted" style={{ fontSize: 11 }}>{new Date(o.createdAt).toLocaleString()}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.user.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{o.user.email}</div>
                </td>
                <td style={{ fontSize: 13 }}>
                  {o.items.map((i: any) => (
                    <div key={i.id}>{i.name} × {i.quantity}</div>
                  ))}
                </td>
                <td style={{ fontWeight: 700 }}>{money(o.total)}</td>
                <td>
                  <span className="badge" style={{ background: (STATUS_COLOR[o.paymentStatus] ?? '#ccc') + '22', color: STATUS_COLOR[o.paymentStatus] ?? '#555' }}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td>
                  {/* Controlled select — uses value not defaultValue */}
                  <select
                    className="select"
                    value={o.status}
                    onChange={e => update(o.id, e.target.value)}
                    style={{ fontSize: 13 }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {/* PDF Receipt */}
                    <a
                      href={`/api/orders/receipt?id=${o.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                    >
                      📄 Receipt <ExternalLink size={10} />
                    </a>
                    {/* Refund */}
                    {o.paymentStatus === 'PAID' && (
                      <button
                        className="btn"
                        style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)' }}
                        onClick={() => refund(o.id)}
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
