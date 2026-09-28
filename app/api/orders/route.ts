import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/orders — fetch the authenticated user's orders
export async function GET() {
  try {
    const u = await requireUser();
    const orders = await db.order.findMany({
      where: { userId: u.id },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ orders });
  } catch (e: any) {
    const unauth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: unauth ? 'Please log in' : 'Failed to fetch orders' },
      { status: unauth ? 401 : 500 },
    );
  }
}
