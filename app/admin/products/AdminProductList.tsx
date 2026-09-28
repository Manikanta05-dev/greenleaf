'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Archive, Upload, X, Check, Star } from 'lucide-react';
import { money } from '@/lib/format';

const EMPTY_FORM = {
  name: '', slug: '', description: '', careInstructions: '',
  price: '', compareAtPrice: '', stock: '', categoryId: '',
  imageUrl: '', plantType: '', sunlight: '', waterNeeds: '',
  size: '', difficulty: 'Easy', featured: false, active: true,
};

type Form = typeof EMPTY_FORM;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function AdminProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch('/api/products?categories=1')
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setCats(d.categories || []);
      });

  useEffect(() => { load(); }, []);

  function set(k: keyof Form, v: any) {
    setForm(f => {
      const next = { ...f, [k]: v };
      // auto-slug when typing name for new product
      if (k === 'name' && !editing) next.slug = slugify(v);
      return next;
    });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setUploading(false);
    if (r.ok) set('imageUrl', d.url);
    else setMsg(d.error || 'Upload failed');
  }

  async function save() {
    setMsg('');
    if (!form.name || !form.slug || !form.categoryId || !form.price) {
      setMsg('Name, slug, category and price are required.');
      return;
    }
    setSaving(true);
    const url = editing ? `/api/admin/products/${editing}` : '/api/admin/products';
    const r = await fetch(url, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || 'Could not save product'); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    load();
  }

  function startEdit(p: any) {
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      careInstructions: p.careInstructions || '', price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
      stock: String(p.stock), categoryId: p.categoryId, imageUrl: p.imageUrl,
      plantType: p.plantType || '', sunlight: p.sunlight || '',
      waterNeeds: p.waterNeeds || '', size: p.size || '',
      difficulty: p.difficulty || 'Easy', featured: p.featured, active: p.active,
    });
    setEditing(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancel() {
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setMsg('');
  }

  async function archive(id: string) {
    if (!confirm('Archive this product? It will be hidden from the store.')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container section">
      {/* ── Page header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="muted">{products.length} total products</p>
        </div>
        <div className="adminnav" style={{ margin: 0 }}>
          <Link className="btn" href="/admin">Dashboard</Link>
          <Link className="btn" href="/admin/orders">Orders</Link>
          {!showForm && (
            <button className="btn primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* ── Product form ── */}
      {showForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="btn ghost" onClick={cancel}><X size={18} /></button>
          </div>

          {msg && <div className="admin-msg-error">{msg}</div>}

          <div className="admin-form-body">
            {/* Left: image upload */}
            <div className="admin-img-col">
              <div
                className="admin-img-drop"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) uploadImage(f);
                }}
              >
                {form.imageUrl ? (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                    <Image src={form.imageUrl} alt="preview" fill style={{ objectFit: 'cover', borderRadius: 10 }} />
                    <button
                      className="admin-img-clear"
                      onClick={e => { e.stopPropagation(); set('imageUrl', ''); }}
                    ><X size={14} /></button>
                  </div>
                ) : (
                  <div className="admin-img-placeholder">
                    <Upload size={28} />
                    <span>{uploading ? 'Uploading…' : 'Click or drag to upload'}</span>
                    <span style={{ fontSize: 11, opacity: .6 }}>JPEG, PNG, WebP · max 5 MB</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
              />
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
                Or paste a URL:
              </p>
              <input
                className="input"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={e => set('imageUrl', e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>

            {/* Right: fields */}
            <div className="admin-fields-col">
              {/* Basic info */}
              <div className="admin-form-section">Basic Information</div>
              <div className="formgrid">
                <div className="form-group full">
                  <label>Product Name *</label>
                  <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Monstera Deliciosa" />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input className="input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="monstera-deliciosa" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                    <option value="">Select category</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea className="textarea" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short product description…" />
                </div>
                <div className="form-group full">
                  <label>Care Instructions</label>
                  <textarea className="textarea" rows={2} value={form.careInstructions} onChange={e => set('careInstructions', e.target.value)} placeholder="Watering, light, repotting tips…" />
                </div>
              </div>

              {/* Pricing & stock */}
              <div className="admin-form-section">Pricing & Inventory</div>
              <div className="formgrid">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input className="input" type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="799" />
                </div>
                <div className="form-group">
                  <label>Compare-at Price (₹)</label>
                  <input className="input" type="number" min="0" value={form.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} placeholder="999" />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input className="input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
                </div>
              </div>

              {/* Plant details */}
              <div className="admin-form-section">Plant Details</div>
              <div className="formgrid">
                {([
                  ['plantType', 'Plant Type', 'Tropical'],
                  ['size', 'Size', '5 inch pot'],
                  ['sunlight', 'Sunlight', 'Bright indirect'],
                  ['waterNeeds', 'Water Needs', 'Moderate'],
                ] as [keyof Form, string, string][]).map(([k, l, ph]) => (
                  <div className="form-group" key={k}>
                    <label>{l}</label>
                    <input className="input" value={form[k] as string} onChange={e => set(k, e.target.value)} placeholder={ph} />
                  </div>
                ))}
                <div className="form-group">
                  <label>Difficulty</label>
                  <select className="select" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                    <option>Beginner</option>
                    <option>Easy</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </div>
              </div>

              {/* Flags */}
              <div className="admin-form-section">Visibility</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <label className="admin-toggle">
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                  <span>Mark as Featured / Bestseller</span>
                </label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                  <span>Active (visible in store)</span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn primary" onClick={save} disabled={saving}>
                  <Check size={15} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
                </button>
                <button className="btn" onClick={cancel}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Product table ── */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />
          <span className="muted" style={{ fontSize: 13 }}>{filtered.length} products</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#f0f4f0', flexShrink: 0, position: 'relative' }}>
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="52px" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.slug}</div>
                    {p.featured && (
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={10} style={{ display: 'inline' }} /> Featured
                      </span>
                    )}
                  </td>
                  <td className="muted">{p.category?.name || '—'}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{money(p.price)}</div>
                    {p.compareAtPrice && (
                      <div className="muted" style={{ fontSize: 12, textDecoration: 'line-through' }}>{money(p.compareAtPrice)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 10 ? 'badge-warn' : ''}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.active ? '' : 'badge-muted'}`}>
                      {p.active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn" style={{ padding: '5px 10px' }} onClick={() => startEdit(p)}>
                        <Pencil size={13} /> Edit
                      </button>
                      <button className="btn" style={{ padding: '5px 10px', color: 'var(--danger)' }} onClick={() => archive(p.id)}>
                        <Archive size={13} /> Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
