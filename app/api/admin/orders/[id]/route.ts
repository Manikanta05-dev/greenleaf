import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, trackingNumber, trackingUrl } = await req.json();
    const o = await db.order.update({ where: { id }, data: { status, trackingNumber, trackingUrl } });
    return NextResponse.json({ order: o });
  } catch {
    return NextResponse.json({ error: 'Could not update order' }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { action } = await req.json();

    const o = await db.order.findUnique({ where: { id }, include: { items: true } });
    if (!o) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (action === 'cancel') {
      if (o.status === 'CANCELLED' || o.status === 'REFUNDED')
        return NextResponse.json({ error: 'Order already cancelled/refunded' }, { status: 400 });
      await db.$transaction([
        db.order.update({ where: { id }, data: { status: 'CANCELLED' } }),
        ...o.items.map(i => db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })),
      ]);
      return NextResponse.json({ ok: true });
    }

    if (action === 'refund') {
      if (o.paymentStatus !== 'PAID' || !o.stripeSessionId)
        return NextResponse.json({ error: 'Order is not paid or has no payment reference' }, { status: 400 });

      // stripeSessionId now holds the Razorpay order ID
      const rzpOrderId = o.stripeSessionId;

      // Fetch Razorpay payments for this order
      const payments = await rzp.orders.fetchPayments(rzpOrderId);
      const paid = (payments.items as any[]).find((p: any) => p.status === 'captured');
      if (!paid) return NextResponse.json({ error: 'No captured payment found for this order' }, { status: 400 });

      await rzp.payments.refund(paid.id, { amount: o.total * 100 });

      await db.$transaction([
        db.order.update({ where: { id }, data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' } }),
        ...o.items.map(i => db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })),
      ]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Action failed' }, { status: 400 });
  }
}
