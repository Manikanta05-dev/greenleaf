'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { money } from '@/lib/format';
import {
  ShoppingBag, TrendingUp, Package, AlertTriangle,
  CheckCircle, Clock, Truck, XCircle,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', PAID: '#10b981', PROCESSING: '#3b82f6',
  SHIPPED: '#8b5cf6', DELIVERED: '#2e7d32', CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className="container section">
      <div className="admin-loading">Loading dashboard…</div>
    </main>
  );

  const s = data?.summary ?? {};
  const revenueChart: { date: string; revenue: number }[] = data?.revenueChart ?? [];
  const maxRev = Math.max(...revenueChart.map((d: any) => d.revenue), 1);

  const ordersByStatus: { status: string; _count: { id: number } }[] = data?.ordersByStatus ?? [];
  const totalOrders = ordersByStatus.reduce((s: number, x: any) => s + x._count.id, 0) || 1;

  return (
    <main className="container section">
      {/* ── Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="muted">Overview of your store performance</p>
        </div>
        <div className="adminnav" style={{ margin: 0 }}>
          <Link className="btn primary" href="/admin/products/new">+ Add Product</Link>
          <Link className="btn" href="/admin/products">Products</Link>
          <Link className="btn" href="/admin/orders">Orders</Link>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#e8f5e9' }}>
            <TrendingUp size={22} color="#2e7d32" />
          </div>
          <div>
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{money(s.totalRevenue ?? 0)}</div>
            <div className="kpi-sub">{s.paidOrders ?? 0} paid orders</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#e3f2fd' }}>
            <ShoppingBag size={22} color="#1565c0" />
          </div>
          <div>
            <div className="kpi-label">Total Orders</div>
            <div className="kpi-value">{s.totalOrders ?? 0}</div>
            <div className="kpi-sub">{s.paidOrders ?? 0} completed</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#f3e5f5' }}>
            <Package size={22} color="#6a1b9a" />
          </div>
          <div>
            <div className="kpi-label">Products</div>
            <div className="kpi-value">{s.activeProducts ?? 0}</div>
            <div className="kpi-sub">{s.totalProducts ?? 0} total</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#fff3e0' }}>
            <AlertTriangle size={22} color="#e65100" />
          </div>
          <div>
            <div className="kpi-label">Low / Out of Stock</div>
            <div className="kpi-value">{s.lowStockCount ?? 0}</div>
            <div className="kpi-sub">{s.outOfStock ?? 0} out of stock</div>
          </div>
        </div>
      </div>

      {/* ── Revenue chart + Order status ── */}
      <div className="dash-row">
        {/* Revenue sparkline */}
        <div className="panel dash-chart-panel">
          <h3 className="dash-panel-title">Revenue — Last 30 Days</h3>
          <div className="rev-chart">
            {revenueChart.map((d, i) => (
              <div key={i} className="rev-bar-wrap" title={`${d.date}: ${money(d.revenue)}`}>
                <div
                  className="rev-bar"
                  style={{ height: `${Math.max(4, (d.revenue / maxRev) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="rev-chart-labels">
            <span>{revenueChart[0]?.date?.slice(5)}</span>
            <span>{revenueChart[14]?.date?.slice(5)}</span>
            <span>{revenueChart[29]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Order status donut-ish breakdown */}
        <div className="panel dash-status-panel">
          <h3 className="dash-panel-title">Orders by Status</h3>
          <div className="status-list">
            {ordersByStatus.map((s: any) => (
              <div key={s.status} className="status-row">
                <div className="status-dot" style={{ background: STATUS_COLORS[s.status] ?? '#ccc' }} />
                <span className="status-name">{s.status}</span>
                <div className="status-bar-wrap">
                  <div
                    className="status-bar"
                    style={{
                      width: `${(s._count.id / totalOrders) * 100}%`,
                      background: STATUS_COLORS[s.status] ?? '#ccc',
                    }}
                  />
                </div>
                <span className="status-count">{s._count.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top products + Low stock ── */}
      <div className="dash-row">
        {/* Top selling */}
        <div className="panel">
          <h3 className="dash-panel-title">Top Selling Products</h3>
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {(data?.topProducts ?? []).map((p: any) => (
                <tr key={p.productId}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p._sum.quantity ?? 0}</td>
                  <td>{money((p._sum.quantity ?? 0) * (p._sum.price ?? 0))}</td>
                </tr>
              ))}
              {!(data?.topProducts?.length) && (
                <tr><td colSpan={3} className="muted" style={{ textAlign: 'center', padding: 24 }}>No sales data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low stock alerts */}
        <div className="panel">
          <h3 className="dash-panel-title">
            <AlertTriangle size={15} style={{ color: '#e65100', marginRight: 6 }} />
            Low Stock Alerts
          </h3>
          {(data?.lowStock ?? []).length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2e7d32', padding: '12px 0' }}>
              <CheckCircle size={16} /> All products are well stocked
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Product</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {(data?.lowStock ?? []).map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warn'}`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/products/${p.id}/edit`} className="btn" style={{ padding: '4px 10px', fontSize: 12 }}>
                        Restock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Recent orders ── */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="dash-panel-title" style={{ margin: 0 }}>Recent Orders</h3>
          <Link href="/admin/orders" className="btn" style={{ padding: '6px 14px', fontSize: 13 }}>View all</Link>
        </div>
        <table className="table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(data?.recentOrders ?? []).map((o: any) => (
              <tr key={o.id}>
                <td><code style={{ fontSize: 12 }}>#{o.id.slice(-8)}</code></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.user.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{o.user.email}</div>
                </td>
                <td className="muted" style={{ fontSize: 13 }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                <td style={{ fontWeight: 700 }}>{money(o.total)}</td>
                <td>
                  <span className="badge" style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                    {o.status}
                  </span>
                </td>
                <td className="muted" style={{ fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!(data?.recentOrders?.length) && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>No recent orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
