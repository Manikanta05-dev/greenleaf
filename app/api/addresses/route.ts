import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { addressSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const u = await requireUser();
    const b = addressSchema.parse(await req.json());
    const address = await db.address.create({ data: { ...b, userId: u.id } });
    return NextResponse.json({ address });
  } catch (e: any) {
    const unauth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: unauth ? 'Please log in' : 'Invalid address' },
      { status: unauth ? 401 : 400 }
    );
  }
}
