import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkoutSchema } from '@/lib/validators';

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Valid coupon codes — in a real app these would be stored in the DB
const COUPONS: Record<string, number> = {
  GREEN10: 10,
  WELCOME: 5,
};

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const body = await req.json();
    const b = checkoutSchema.parse(body);
    const couponCode: string | undefined = typeof body.couponCode === 'string'
      ? body.couponCode.trim().toUpperCase()
      : undefined;

    const address = await db.address.findFirst({ where: { id: b.addressId, userId: u.id } });
    if (!address) return NextResponse.json({ error: 'Invalid shipping address' }, { status: 400 });

    const ids = b.items.map(x => x.productId);
    const products = await db.product.findMany({ where: { id: { in: ids }, active: true } });
    if (products.length !== ids.length)
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });

    const byId = new Map(products.map(p => [p.id, p]));
    const subtotal    = b.items.reduce((s, x) => s + byId.get(x.productId)!.price * x.quantity, 0);
    const shipping    = subtotal >= 999 ? 0 : 99;
    const tax         = Math.round(subtotal * 0.05);
    const discountPct = couponCode && COUPONS[couponCode] ? COUPONS[couponCode] : 0;
    const discountAmt = Math.round(subtotal * discountPct / 100);
    const total       = subtotal + shipping + tax - discountAmt;

    // Create the order record first (PENDING payment)
    const order = await db.$transaction(async tx => {
      for (const x of b.items) {
        const r = await tx.product.updateMany({
          where: { id: x.productId, stock: { gte: x.quantity } },
          data:  { stock: { decrement: x.quantity } },
        });
        if (r.count !== 1) throw new Error(`Insufficient stock for ${byId.get(x.productId)!.name}`);
      }
      return tx.order.create({
        data: {
          userId: u.id, addressId: address.id,
          subtotal, shipping, tax, total,
          items: {
            create: b.items.map(x => ({
              productId: x.productId,
              name:      byId.get(x.productId)!.name,
              price:     byId.get(x.productId)!.price,
              quantity:  x.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    // Create Razorpay order (amount in paise)
    const rzpOrder = await rzp.orders.create({
      amount:   total * 100,
      currency: 'INR',
      receipt:  order.id,
      notes:    { orderId: order.id, userId: u.id },
    });

    // Store the Razorpay order id so webhook can match it
    await db.order.update({
      where: { id: order.id },
      data:  { stripeSessionId: rzpOrder.id }, // reusing field for Razorpay order ID
    });

    return NextResponse.json({
      orderId:       order.id,
      rzpOrderId:    rzpOrder.id,
      amount:        total * 100,
      currency:      'INR',
      keyId:         process.env.RAZORPAY_KEY_ID,
      customerName:  u.name,
      customerEmail: u.email,
      customerPhone: u.phone ?? '',
      description:   `GreenLeaf order #${order.id.slice(-8)}`,
    });
  } catch (e: any) {
    const unauth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: unauth ? 'Please log in' : e?.message || 'Checkout failed' },
      { status: unauth ? 401 : 400 },
    );
  }
}
