import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { addressSchema } from '@/lib/validators';

/* ── POST /api/addresses — create ── */
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

/* ── PUT /api/addresses?id=xxx — update ── */
export async function PUT(req: Request) {
  try {
    const u = await requireUser();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Make sure the address belongs to this user
    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== u.id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const b = addressSchema.parse(await req.json());
    const address = await db.address.update({ where: { id }, data: b });
    return NextResponse.json({ address });
  } catch (e: any) {
    const unauth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: unauth ? 'Please log in' : 'Invalid address' },
      { status: unauth ? 401 : 400 }
    );
  }
}

/* ── DELETE /api/addresses?id=xxx — delete ── */
export async function DELETE(req: Request) {
  try {
    const u = await requireUser();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Make sure the address belongs to this user
    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== u.id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.address.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const unauth = e?.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: unauth ? 'Please log in' : 'Failed to delete' },
      { status: unauth ? 401 : 400 }
    );
  }
}
