import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ user: null });

  const full = await db.user.findUnique({
    where: { id: user.id },
    include: {
      addresses: true,
      orders: { include: { items: true }, orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  return NextResponse.json({ user: full });
}
