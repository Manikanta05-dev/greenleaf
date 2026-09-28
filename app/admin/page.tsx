import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';

export default async function AdminPage() {
  try { await requireAdmin(); } catch { redirect('/account'); }
  return <AdminDashboard />;
}
