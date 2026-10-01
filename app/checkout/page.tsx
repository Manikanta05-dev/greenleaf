'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, ArrowCounterClockwise, Truck, CreditCard, DeviceMobile } from '@phosphor-icons/react';
import { money } from '@/lib/format';

declare global {
  interface Window { Razorpay: any; }
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function Checkout() {
  const [user, setUser]         = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState('');
  const [cart, setCart]         = useState<any[]>([]);
  const [step, setStep]         = useState<'delivery' | 'payment'>('delivery');
  const [form, setForm]         = useState({
    label: 'Home', line1: '', line2: '', city: '',
    state: 'Karnataka', postalCode: '', country: 'India', phone: '',
  });
  const [payMethod, setPayMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [upiId, setUpiId]       = useState('');
  const [couponCode, setCouponCode]       = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [msg, setMsg]           = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/account?redirect=/checkout'); return; }
      setUser(d.user);
      setAddresses(d.user.addresses || []);
      if (d.user.addresses?.[0]) setAddressId(d.user.addresses[0].id);
    });
    // Restore applied coupon from cart page
    const savedCoupon = JSON.parse(localStorage.getItem('coupon') || 'null');
    if (savedCoupon) {
      setCouponCode(savedCoupon.code);
      setCouponDiscount(savedCoupon.discount);
    }
    // Load Razorpay SDK
    if (!document.getElementById('rzp-script')) {
      const s = document.createElement('script');
      s.id  = 'rzp-script';
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(s);
    }
  }, []);

  const subtotal = cart.reduce((s, x) => s + x.product.price * x.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax      = Math.round(subtotal * 0.05);
  const discountAmt = Math.round(subtotal * couponDiscount / 100);
  const total    = subtotal + shipping + tax - discountAmt;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleDeliveryContinue() {
    if (!addressId) {
      if (!form.line1 || !form.city || !form.state || !form.postalCode || !form.phone) {
        setMsg('Please fill in all required delivery fields.'); return;
      }
    }
    setMsg('');
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function pay() {
    setMsg('');
    setLoading(true);

    // Save address if new
    let aid = addressId;
    if (!aid) {
      const r = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error || 'Could not save address'); setLoading(false); return; }
      aid = d.address.id;
    }

    // Create order
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        addressId: aid,
        items: cart.map(x => ({ productId: x.productId, quantity: x.quantity })),
        couponCode: couponCode || undefined,
      }),
    });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || 'Checkout failed'); setLoading(false); return; }

    const options: any = {
      key:          d.keyId,
      amount:       d.amount,
      currency:     d.currency,
      name:         'GreenLeaf Nursery',
      description:  d.description,
      order_id:     d.rzpOrderId,
      prefill: {
        name:    d.customerName,
        email:   d.customerEmail,
        contact: d.customerPhone,
      },
      theme:        { color: '#2e7d32' },
      method:       payMethod === 'upi' ? { upi: true, card: false, netbanking: false, wallet: false } : {},
    };

    if (payMethod === 'upi' && upiId) {
      options.prefill.vpa = upiId;
    }

    options.handler = async (response: any) => {
      const vr = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderId:       d.orderId,
          rzpOrderId:    response.razorpay_order_id,
          rzpPaymentId:  response.razorpay_payment_id,
          rzpSignature:  response.razorpay_signature,
        }),
      });
      const vd = await vr.json();
      if (vr.ok && vd.success) {
        localStorage.removeItem('cart');
        localStorage.removeItem('coupon');
        window.dispatchEvent(new Event('cart-updated'));
        router.push(`/checkout/success?order=${d.orderId}`);
      } else {
        setMsg(vd.error || 'Payment verification failed');
        setLoading(false);
      }
    };

    options.modal = {
      ondismiss: async () => {
        // Cancel the pending order and restock
        if (d.orderId) {
          await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ orderId: d.orderId }),
          });
        }
        setMsg('Payment cancelled. Your cart has been restored.');
        setLoading(false);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  const selectedAddress = addresses.find(a => a.id === addressId);

  return (
    <main className="checkout-page">
      <div className="checkout-page-inner">
        {/* ── Left: form ── */}
        <div className="co-left">
          {/* breadcrumb */}
          <div className="co-breadcrumb">
            <Link href="/cart">Cart</Link>
            <span>›</span>
            <span className={step === 'delivery' ? 'co-bc-active' : ''}>Delivery</span>
            <span>›</span>
            <span className={step === 'payment' ? 'co-bc-active' : ''}>Payment</span>
          </div>

          {/* ── Step 1: Delivery ── */}
          {step === 'delivery' && (
            <>
              <div className="co-section-head">
                <span className="co-step-num">1</span> Delivery
              </div>

              {addresses.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {addresses.map(a => (
                    <label key={a.id} className={`co-addr-option ${addressId === a.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{a.label}</div>
                        <div className="muted" style={{ fontSize: 13 }}>
                          {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}
                        </div>
                      </div>
                    </label>
                  ))}
                  <label className={`co-addr-option ${addressId === '' ? 'selected' : ''}`}>
                    <input type="radio" name="address" value="" checked={addressId === ''} onChange={() => setAddressId('')} />
                    <div style={{ fontWeight: 600 }}>+ Enter a new address</div>
                  </label>
                </div>
              )}

              {!addressId && (
                <div className="co-form-grid">
                  <div className="co-field full">
                    <label>Country / Region</label>
                    <select className="select" value={form.country} onChange={e => set('country', e.target.value)}>
                      <option>India</option>
                    </select>
                  </div>
                  <div className="co-field">
                    <label>Address Label *</label>
                    <input className="input" value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Home / Work / Office" suppressHydrationWarning />
                  </div>
                  <div className="co-field">
                    <label>Phone *</label>
                    <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile number" suppressHydrationWarning />
                  </div>
                  <div className="co-field full">
                    <label>Address *</label>
                    <input className="input" value={form.line1} onChange={e => set('line1', e.target.value)} placeholder="House no., Street, Area" suppressHydrationWarning />
                  </div>
                  <div className="co-field full">
                    <label>Apartment, suite, etc.</label>
                    <input className="input" value={form.line2} onChange={e => set('line2', e.target.value)} placeholder="Optional" suppressHydrationWarning />
                  </div>
                  <div className="co-field">
                    <label>City *</label>
                    <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" suppressHydrationWarning />
                  </div>
                  <div className="co-field">
                    <label>State *</label>
                    <select className="select" value={form.state} onChange={e => set('state', e.target.value)}>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="co-field">
                    <label>PIN code *</label>
                    <input className="input" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="6-digit PIN" maxLength={6} suppressHydrationWarning />
                  </div>
                </div>
              )}

              {msg && <p className="co-error">{msg}</p>}
              <button className="btn primary full co-continue-btn" onClick={handleDeliveryContinue}>
                Continue to Payment
              </button>
            </>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'payment' && (
            <>
              {/* Delivery summary bar */}
              <div className="co-delivery-summary">
                <div>
                  <div className="co-ds-label">Ship to</div>
                  <div className="co-ds-value">
                    {selectedAddress
                      ? `${selectedAddress.line1}, ${selectedAddress.city}, ${selectedAddress.state}`
                      : `${form.line1}, ${form.city}, ${form.state}`}
                  </div>
                </div>
                <button className="btn ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--brand)' }} onClick={() => setStep('delivery')}>
                  Change
                </button>
              </div>

              <div className="co-section-head">
                <span className="co-step-num">2</span> Payment Method
              </div>

              <div className="co-pay-options">
                <label className={`co-pay-option ${payMethod === 'razorpay' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="razorpay" checked={payMethod === 'razorpay'} onChange={() => setPayMethod('razorpay')} />
                  <CreditCard size={18} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Card / Net Banking / Wallet</div>
                    <div className="muted" style={{ fontSize: 12 }}>Visa, Mastercard, UPI, PhonePe, Paytm & more</div>
                  </div>
                </label>
                <label className={`co-pay-option ${payMethod === 'upi' ? 'selected' : ''}`}>
                  <input type="radio" name="paymethod" value="upi" checked={payMethod === 'upi'} onChange={() => setPayMethod('upi')} />
                  <DeviceMobile size={18} />
                  <div>
                    <div style={{ fontWeight: 600 }}>UPI / QR</div>
                    <div className="muted" style={{ fontSize: 12 }}>Google Pay, PhonePe, BHIM UPI</div>
                  </div>
                </label>
              </div>

              {payMethod === 'upi' && (
                <div className="co-field" style={{ marginTop: 14 }}>
                  <label>UPI ID (optional — pre-fills in Razorpay)</label>
                  <input
                    className="input"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              )}

              {msg && <p className="co-error">{msg}</p>}

              <button
                className="btn primary full co-continue-btn"
                onClick={pay}
                disabled={loading}
              >
                {loading ? 'Opening payment…' : `Pay ${money(total)} securely`}
              </button>

              <div className="co-secure-note">
                <ShieldCheck size={13} /> All payments are 256-bit SSL encrypted via Razorpay
              </div>
            </>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <aside className="co-right">
          <div className="co-summary-box">
            {/* Items */}
            <div className="co-items-list">
              {cart.map(x => (
                <div className="co-item-row" key={x.productId}>
                  <div className="co-item-img-wrap">
                    <Image src={x.product.imageUrl} alt={x.product.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
                    <span className="co-item-qty-badge">{x.quantity}</span>
                  </div>
                  <div className="co-item-name">{x.product.name}</div>
                  <div className="co-item-price">{money(x.product.price * x.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="co-divider" />

            {/* Totals */}
            <div className="co-total-lines">
              <div className="co-total-line">
                <span>Subtotal</span><span>{money(subtotal)}</span>
              </div>
              <div className="co-total-line">
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--brand)' : undefined }}>
                  {shipping === 0 ? 'Free' : money(shipping)}
                </span>
              </div>
              <div className="co-total-line">
                <span>GST (5%)</span><span>{money(tax)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="co-total-line" style={{ color: 'var(--brand)', fontWeight: 600 }}>
                  <span>Coupon ({couponCode})</span>
                  <span>−{money(discountAmt)}</span>
                </div>
              )}
            </div>

            <div className="co-divider" />

            <div className="co-grand-total">
              <span>Total</span>
              <span><small>INR </small>{money(total)}</span>
            </div>

            {/* Trust strip */}
            <div className="co-trust-strip">
              <div><Truck size={13} /> Free shipping ≥ ₹999</div>
              <div><ArrowCounterClockwise size={13} /> 7-day replacement</div>
              <div><ShieldCheck size={13} /> 100% genuine plants</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
