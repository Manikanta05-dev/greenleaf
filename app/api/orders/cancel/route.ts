import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const { orderId } = await req.json();

    const order = await db.order.findUnique({
      where: { id: orderId, userId: u.id },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.paymentStatus === 'PAID')
      return NextResponse.json({ error: 'Cannot cancel a paid order' }, { status: 400 });

    await db.$transaction([
      db.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } }),
      ...order.items.map(i =>
        db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } })
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Cancel failed' }, { status: 400 });
  }
}
