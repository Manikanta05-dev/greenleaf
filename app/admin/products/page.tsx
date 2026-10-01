import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminProductList } from './AdminProductList';

export default async function AdminProductsPage() {
  try { await requireAdmin(); } catch { redirect('/account'); }
  return (
    <Suspense fallback={<main className="container section"><p className="muted">Loading…</p></main>}>
      <AdminProductList />
    </Suspense>
  );
}
