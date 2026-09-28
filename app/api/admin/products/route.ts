import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    if (!b.name || !b.slug || !b.categoryId || !b.price)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const p = await db.product.create({
      data: {
        name:             b.name,
        slug:             b.slug,
        description:      b.description || '',
        careInstructions: b.careInstructions || null,
        price:            Number(b.price),
        compareAtPrice:   b.compareAtPrice ? Number(b.compareAtPrice) : null,
        stock:            Number(b.stock || 0),
        imageUrl:         b.imageUrl || 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85',
        categoryId:       b.categoryId,
        plantType:        b.plantType  || null,
        difficulty:       b.difficulty || null,
        sunlight:         b.sunlight   || null,
        waterNeeds:       b.waterNeeds || null,
        size:             b.size       || null,
        featured:         Boolean(b.featured),
        active:           b.active !== false,
      },
    });
    return NextResponse.json({ product: p });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not create product' }, { status: 400 });
  }
}

// GET all products including archived — admin only
export async function GET() {
  try {
    await requireAdmin();
    const products = await db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
