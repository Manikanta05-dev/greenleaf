import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const b = await req.json();
    const p = await db.product.update({
      where: { id },
      data: {
        ...b,
        price:          b.price          !== undefined ? Number(b.price)                        : undefined,
        compareAtPrice: b.compareAtPrice !== undefined ? (b.compareAtPrice ? Number(b.compareAtPrice) : null) : undefined,
        stock:          b.stock          !== undefined ? Number(b.stock)                        : undefined,
      },
    });
    return NextResponse.json({ product: p });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not update product' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not archive product' }, { status: 400 });
  }
}

// Restore archived product
export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.product.update({ where: { id }, data: { active: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not restore product' }, { status: 400 });
  }
}
