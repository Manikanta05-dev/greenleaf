import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { money } from '@/lib/format';

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/account');

  const q = await searchParams;
  const o = q.order
    ? await db.order.findUnique({
        where: { id: q.order, userId: session.id },
        include: { items: true },
      })
    : null;

  return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 700, margin: 'auto', textAlign: 'center' }}>
        <div className="tag">Order received</div>
        <h1>Thank you for your order 🌱</h1>
        <p className="muted">
          {o
            ? `Order #${o.id.slice(-8)} · ${money(o.total)}`
            : 'Your payment was received.'}
        </p>
        <p>We'll email you updates as your plants move through packing and delivery.</p>
        <Link className="btn primary" href="/account">View my orders</Link>
      </div>
    </main>
  );
}
