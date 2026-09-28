import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

function money(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

  // Admin can view any order; customers only their own
  const where = session.role === 'ADMIN'
    ? { id }
    : { id, userId: session.id };

  const order = await db.order.findUnique({
    where,
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true } },
      address: true,
    },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GreenLeaf Order Receipt #${order.id.slice(-8)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#1a2e1a;background:#fff;padding:40px;}
  .logo{font-size:22px;font-weight:900;color:#2e7d32;display:flex;align-items:center;gap:6px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:2px solid #2e7d32;margin-bottom:28px;}
  .receipt-title{font-size:26px;font-weight:800;margin-bottom:4px;}
  .muted{color:#6b7a6b;font-size:13px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;}
  .box{background:#f8faf8;border:1px solid #e0ebe0;border-radius:10px;padding:16px;}
  .box h3{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#2e7d32;margin-bottom:10px;}
  .box p{font-size:13px;line-height:1.7;color:#1a2e1a;}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;}
  th{background:#f0f6f0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:10px 14px;text-align:left;color:#6b7a6b;border-bottom:2px solid #e0ebe0;}
  td{padding:12px 14px;border-bottom:1px solid #e0ebe0;font-size:14px;}
  .totals{margin-left:auto;width:320px;}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#6b7a6b;}
  .total-grand{display:flex;justify-content:space-between;padding:12px 0 4px;font-size:18px;font-weight:800;border-top:2px solid #1a2e1a;margin-top:6px;}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;}
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e0ebe0;text-align:center;font-size:12px;color:#6b7a6b;}
  @media print{
    body{padding:20px;}
    .no-print{display:none;}
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">🌿 GreenLeaf Nursery</div>
    <div class="muted" style="margin-top:4px;">India's favourite plant store</div>
  </div>
  <div style="text-align:right;">
    <div class="receipt-title">Tax Invoice</div>
    <div class="muted">Order #${order.id.slice(-8)}</div>
    <div class="muted">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>
</div>

<div class="grid">
  <div class="box">
    <h3>Bill To</h3>
    <p>
      <strong>${order.user.name}</strong><br/>
      ${order.user.email}<br/>
      ${order.user.phone ?? ''}
    </p>
  </div>
  <div class="box">
    <h3>Ship To</h3>
    <p>
      ${order.address.line1}${order.address.line2 ? ', ' + order.address.line2 : ''}<br/>
      ${order.address.city}, ${order.address.state} — ${order.address.postalCode}<br/>
      ${order.address.country}${order.address.phone ? '<br/>' + order.address.phone : ''}
    </p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Product</th>
      <th style="text-align:right;">Unit Price</th>
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${order.items.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.name}</td>
      <td style="text-align:right;">${money(item.price)}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;font-weight:700;">${money(item.price * item.quantity)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
  <div class="total-row"><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : money(order.shipping)}</span></div>
  <div class="total-row"><span>GST (5%)</span><span>${money(order.tax)}</span></div>
  <div class="total-grand"><span>Total</span><span>${money(order.total)}</span></div>
</div>

<div style="margin-top:24px;">
  <strong>Payment Status:</strong>
  <span class="badge" style="background:#e8f5e9;color:#2e7d32;margin-left:8px;">${order.paymentStatus}</span>
  &nbsp;&nbsp;
  <strong>Order Status:</strong>
  <span class="badge" style="background:#e3f2fd;color:#1565c0;margin-left:8px;">${order.status}</span>
  ${order.trackingNumber ? `<br/><br/><strong>Tracking:</strong> ${order.trackingNumber}` : ''}
</div>

<div class="footer">
  <p>Thank you for shopping with GreenLeaf Nursery 🌱</p>
  <p>For support: support@greenleaf.local | GSTIN: 29XXXXXX000X1ZX</p>
  <p style="margin-top:8px;" class="no-print">
    <button onclick="window.print()" style="padding:8px 20px;background:#2e7d32;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
      🖨️ Print / Save as PDF
    </button>
  </p>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
