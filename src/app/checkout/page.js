'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Context';
import { Truck, CreditCard, Receipt, ShieldCheck, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Checkout() {
  const router = useRouter();
  const { cart, user, token, clearCart } = useApp();

  // Redirect if cart is empty or user not logged in
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
    if (!user && !orderSuccess) {
      router.push('/login?redirect=checkout');
    }
  }, [cart, user]);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('invoice'); // 'credit-card' or 'invoice' (bank transfer)
  
  // Credit Card Details (Mock)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Page States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let discountPercent = 0;
  if (subtotal >= 50000) {
    discountPercent = 8;
  } else if (subtotal >= 25000) {
    discountPercent = 5;
  } else if (subtotal >= 10000) {
    discountPercent = 2;
  }
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shippingFee = subtotal > 0 && subtotal < 15000 ? 500 : 0;
  const total = subtotal - discountAmount + shippingFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!shippingName || !shippingPhone || !address || !city || !pincode) {
      setErrorMsg('Please fill in all shipping details.');
      return;
    }

    if (paymentMethod === 'credit-card' && (!cardNumber || !cardExpiry || !cardCVV)) {
      setErrorMsg('Please fill in card payment details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const shippingDetails = {
      name: shippingName,
      businessName: businessName || 'Retailer / Distributor Store',
      phone: shippingPhone,
      address,
      city,
      state,
      pincode
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          subtotal,
          total,
          shippingAddress: shippingDetails,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Order submission failed.');
      }

      setCreatedOrder(data.order);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while placing order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess && createdOrder) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-success)', display: 'inline-block', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={64} fill="var(--primary-light)" />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Thank you for choosing Bommal Foods. Your order <strong>#{createdOrder.id}</strong> has been successfully placed.
        </p>

        {/* Order Details Card */}
        <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}>Order Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div><strong>Business Name:</strong> {createdOrder.shippingAddress.businessName}</div>
            <div><strong>Deliver To:</strong> {createdOrder.shippingAddress.name}</div>
            <div><strong>Phone Number:</strong> {createdOrder.shippingAddress.phone}</div>
            <div><strong>Shipping Address:</strong> {createdOrder.shippingAddress.address}, {createdOrder.shippingAddress.city} - {createdOrder.shippingAddress.pincode}</div>
            <div><strong>Payment Method:</strong> {createdOrder.paymentMethod === 'invoice' ? 'Wholesale Invoice (15-day Terms)' : 'Credit Card (Paid)'}</div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700 }}>
              <span>Total Price:</span>
              <span style={{ color: 'var(--primary-color)' }}>₹{createdOrder.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {createdOrder.paymentMethod === 'invoice' && (
          <div style={{ backgroundColor: 'var(--secondary-light)', border: '1px solid #fde68a', color: 'var(--secondary-hover)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'left', marginBottom: '2rem', lineHeight: '1.5' }}>
            <strong>Wholesale Invoice Sent:</strong> A copy of the commercial invoice detailing bank account details for RTGS / NEFT transfer has been sent to your email ({createdOrder.userEmail}). Please settle the outstanding within 15 business days.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/orders" className="btn-primary">
            View Order History
          </Link>
          <Link href="/" className="btn-secondary" style={{ backgroundColor: '#cbd5e1', color: 'var(--text-main)' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '2rem 0 1.5rem 0' }}>Secure Wholesale Checkout</h1>
      
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <div className="cart-layout" style={{ gridTemplateColumns: '1fr 360px' }}>
        {/* Left: Shipping & Payment Forms */}
        <form onSubmit={handleSubmitOrder}>
          {/* Step 1: Shipping Details */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <Truck size={20} /> 1. Shipping Address & Business Info
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Business / Shop Name</label>
                <input
                  type="text"
                  placeholder="e.g. Senthil Stores (Optional)"
                  className="form-control"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="form-control"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Direct Delivery Contact) *</label>
              <input
                type="text"
                required
                placeholder="10-digit number"
                className="form-control"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Warehouse / Delivery Street Address *</label>
              <textarea
                required
                rows={3}
                placeholder="Enter detailed delivery street address, building number, block number"
                className="form-control"
                style={{ resize: 'none' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  className="form-control"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="6 digits"
                  className="form-control"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
              <CreditCard size={20} /> 2. Wholesale Payment Method
            </h2>

            {/* Payment Method Selector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  border: `2px solid ${paymentMethod === 'invoice' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'invoice' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
                onClick={() => setPaymentMethod('invoice')}
              >
                <Receipt size={24} style={{ color: 'var(--primary-color)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Wholesale Invoice</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay on Account via bank transfer (15-day Credit Terms)</span>
                </div>
              </div>

              <div
                style={{
                  border: `2px solid ${paymentMethod === 'credit-card' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'credit-card' ? 'var(--primary-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
                onClick={() => setPaymentMethod('credit-card')}
              >
                <CreditCard size={24} style={{ color: 'var(--secondary-color)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Credit / Debit Card</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant online payment clearance using mock credit credentials</span>
                </div>
              </div>
            </div>

            {/* Credit Card inputs */}
            {paymentMethod === 'credit-card' && (
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1.25rem', borderRadius: '8px', animation: 'slideDown 0.15s ease' }}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    className="form-control"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="form-control"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security CVV</label>
                    <input
                      type="password"
                      placeholder="3 digits"
                      className="form-control"
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'invoice' && (
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                <strong>Note on Wholesaler Terms:</strong> Placing this order issues an invoice. You will be requested to pay via RTGS / NEFT within 15 days of receiving the delivery goods.
              </div>
            )}
          </div>
        </form>

        {/* Right Side: Order Summary Checkout */}
        <aside className="cart-summary">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>Review Items ({cart.reduce((a,b)=>a+b.quantity,0)})</h2>
          
          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-main)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name} <strong style={{ color: 'var(--text-muted)' }}>x {item.quantity}</strong>
                </span>
                <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              <span>Bulk Discount</span>
              <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Shipping Freight</span>
            <span style={{ fontWeight: 700 }}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
          </div>

          <div className="summary-row summary-total" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <span>Order Total</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="btn-checkout"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Placing Order...
              </>
            ) : (
              <>
                <ShieldCheck size={18} /> Place Wholesale Order
              </>
            )}
          </button>

          <div style={{ marginTop: '1rem' }}>
            <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <ArrowLeft size={12} /> Edit Shopping Cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
