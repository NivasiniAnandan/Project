'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/components/Context';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingCart, Percent } from 'lucide-react';

export default function Cart() {
  const { cart, updateCartQty, removeFromCart } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Wholesale bulk discounts tier math
  let discountPercent = 0;
  if (subtotal >= 50000) {
    discountPercent = 8;
  } else if (subtotal >= 25000) {
    discountPercent = 5;
  } else if (subtotal >= 10000) {
    discountPercent = 2;
  }

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shippingFee = subtotal > 0 && subtotal < 15000 ? 500 : 0; // free shipping above 15k
  const total = subtotal - discountAmount + shippingFee;

  // Next discount target message
  let targetMsg = "";
  if (subtotal < 10000) {
    targetMsg = `Add ₹${(10000 - subtotal).toLocaleString('en-IN')} more to unlock 2% wholesale discount.`;
  } else if (subtotal < 25000) {
    targetMsg = `Add ₹${(25000 - subtotal).toLocaleString('en-IN')} more to unlock 5% wholesale discount!`;
  } else if (subtotal < 50000) {
    targetMsg = `Add ₹${(50000 - subtotal).toLocaleString('en-IN')} more to unlock the maximum 8% wholesale discount!`;
  } else {
    targetMsg = "Congratulations! You have unlocked the maximum 8% wholesale discount.";
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
          <ShoppingCart size={48} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't added any products to your wholesale cart yet.</p>
        <Link href="/catalog" className="btn-primary">
          Go To Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '2rem 0 1rem 0' }}>Wholesale Shopping Cart</h1>

      {/* Target Discount Alert Banner */}
      <div style={{
        backgroundColor: 'var(--primary-light)',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        color: 'var(--primary-color)',
        fontSize: '0.9rem',
        fontWeight: 600
      }}>
        <Percent size={18} />
        <span>{targetMsg}</span>
      </div>

      <div className="cart-layout">
        {/* Left: Items list */}
        <div className="cart-items-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Product Detail</span>
            <span>Subtotal</span>
          </div>

          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <Link href={`/product/${item.id}`} style={{ hover: { textDecoration: 'underline' } }}>
                  <h3 className="cart-item-title">{item.name}</h3>
                </Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unit: {item.unit}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')} / unit</span>
                
                {/* Quantity picker & delete inline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="quantity-selector" style={{ width: '100px' }}>
                    <button onClick={() => updateCartQty(item.id, item.quantity - 1)} className="qty-btn" type="button">
                      <Minus size={12} />
                    </button>
                    <span className="qty-val" style={{ fontSize: '0.85rem' }}>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.id, item.quantity + 1)} className="qty-btn" type="button">
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="cart-item-remove">
                    <Trash2 size={14} style={{ display: 'inline', marginRight: '3px', marginBottom: '3px' }} /> Remove
                  </button>
                </div>
              </div>
              
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.05rem' }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}

          {/* Back to shopping link */}
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-hover)', fontWeight: 700, fontSize: '0.85rem' }}>
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="cart-summary">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>Wholesale Order Summary</h2>
          
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} units)</span>
            <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountPercent > 0 && (
            <div className="summary-row" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Percent size={14} /> {discountPercent}% Bulk Discount
              </span>
              <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Shipping Freight</span>
            <span style={{ fontWeight: 700 }}>
              {shippingFee === 0 ? (
                <span style={{ color: 'var(--color-success)' }}>FREE</span>
              ) : (
                `₹${shippingFee.toLocaleString('en-IN')}`
              )}
            </span>
          </div>
          
          {shippingFee > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.25rem', marginBottom: '0.75rem' }}>
              * Free shipping applies for orders above ₹15,000.
            </p>
          )}

          <div className="summary-row summary-total">
            <span>Estimated Total</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <Link href="/checkout" style={{ display: 'block' }}>
            <button className="btn-checkout">
              Proceed to Checkout <ArrowRight size={16} style={{ display: 'inline', marginLeft: '5px', marginBottom: '2px' }} />
            </button>
          </Link>

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <strong>Wholesale Terms:</strong> All invoices must be cleared within 15 days of dispatch. Special container loads require customized logistics agreements.
          </div>
        </aside>
      </div>
    </div>
  );
}
