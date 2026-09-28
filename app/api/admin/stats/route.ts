import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOf30Days = new Date(now);
    startOf30Days.setDate(now.getDate() - 29);
    startOf30Days.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      paidOrders,
      revenueAgg,
      lowStock,
      outOfStock,
      recentOrders,
      topProducts,
      dailyRevenue,
      ordersByStatus,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { active: true } }),
      db.order.count(),
      db.order.count({ where: { paymentStatus: 'PAID' } }),
      db.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
      db.product.findMany({
        where: { active: true, stock: { gt: 0, lte: 10 } },
        orderBy: { stock: 'asc' },
        take: 10,
        select: { id: true, name: true, stock: true, imageUrl: true },
      }),
      db.product.count({ where: { active: true, stock: 0 } }),
      db.order.findMany({
        where: { createdAt: { gte: startOf30Days } },
        include: { user: { select: { name: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Top selling products by revenue
      db.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      // Orders in last 30 days grouped by day
      db.order.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: startOf30Days } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Order count by status
      db.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Build daily revenue map for last 30 days
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(startOf30Days);
      d.setDate(d.getDate() + i);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of dailyRevenue) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key] += o.total;
    }
    const revenueChart = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

    return NextResponse.json({
      summary: {
        totalProducts,
        activeProducts,
        totalOrders,
        paidOrders,
        totalRevenue: revenueAgg._sum.total ?? 0,
        outOfStock,
        lowStockCount: lowStock.length,
      },
      lowStock,
      recentOrders,
      topProducts,
      revenueChart,
      ordersByStatus,
    });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
