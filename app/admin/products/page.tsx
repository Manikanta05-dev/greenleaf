import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminProductList } from './AdminProductList';

export default async function AdminProductsPage() {
  try { await requireAdmin(); } catch { redirect('/account'); }
  return <AdminProductList />;
}
