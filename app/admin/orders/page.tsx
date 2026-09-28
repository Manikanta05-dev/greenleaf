import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminOrdersClient } from './AdminOrdersClient';

export default async function AdminOrdersPage() {
  try { await requireAdmin(); } catch { redirect('/account'); }
  return <AdminOrdersClient />;
}
