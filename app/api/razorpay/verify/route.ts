import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const { orderId, rzpOrderId, rzpPaymentId, rzpSignature } = await req.json();

    // Verify HMAC signature
    const body      = `${rzpOrderId}|${rzpPaymentId}`;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expected !== rzpSignature)
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });

    // Mark order paid
    const order = await db.order.findUnique({ where: { id: orderId, userId: u.id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    await db.order.update({
      where: { id: orderId },
      data:  { status: 'PAID', paymentStatus: 'PAID' },
    });

    return NextResponse.json({ success: true, orderId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Verification failed' }, { status: 400 });
  }
}
