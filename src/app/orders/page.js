'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Context';
import { Package, Clock, ShieldAlert, Truck, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import InvoiceButton from '@/components/InvoiceButton';

export default function OrderHistory() {
  const router = useRouter();
  const { user, token } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=orders');
      return;
    }

    async function loadOrders() {
      try {
        const res = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading order history...</p>
      </div>
    );
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge-status badge-pending">Pending Approval</span>;
      case 'processing':
        return <span className="badge-status badge-pending" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>Processing</span>;
      case 'confirmed':
        return <span className="badge-status badge-completed">Confirmed</span>;
      case 'shipped':
        return <span className="badge-status badge-shipped">Shipped</span>;
      case 'delivered':
        return <span className="badge-status badge-completed">Delivered</span>;
      case 'cancelled':
        return <span className="badge-status badge-out-of-stock" style={{ position: 'static', padding: '0.2rem 0.5rem' }}>Cancelled</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '2rem 0 1.5rem 0' }}>Order History</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
            <Package size={40} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            All orders you submit will be displayed here for delivery tracking and invoices.
          </p>
          <Link href="/catalog" className="btn-primary">
            Browse Product Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.orderId || order.id}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Order Header info bar */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.8rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Order ID</span>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>#{order.orderId || order.id}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date Placed</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Value</span>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px', color: 'var(--primary-color)' }}>
                    ₹{order.total.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '3px' }}>Delivery Status</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Content items */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                  {/* Items list */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>Items Ordered</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Pack Size: {item.packSize || item.unit} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery / Payment Info */}
                  <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem', fontSize: '0.85rem' }}>
                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
                      <div><strong>Deliver To:</strong> {order.shippingAddress.name}</div>
                      <div><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</div>
                      <div><strong>Phone Contact:</strong> {order.shippingAddress.phone}</div>
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                        <strong>Payment Status: </strong>
                        <span style={{
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          color: order.paymentStatus === 'paid' ? 'var(--color-success)' : 'var(--secondary-hover)'
                        }}>
                          {{
                            verification_pending: 'Verification Pending',
                            paid: 'Paid',
                            rejected: 'Rejected',
                            invoice_sent: 'Invoice Sent'
                          }[order.paymentStatus] || order.paymentStatus}
                        </span>
                      </div>
                      <div><strong>Payment Method:</strong> {order.transferId ? 'GPay' : order.paymentMethod === 'invoice' ? 'Commercial Invoice (15-day Credit)' : 'Credit / Debit Card'}</div>
                      {order.transferId && <div><strong>Transfer ID / UTR:</strong> {order.transferId}</div>}
                      {order.rejectionReason && <div><strong>Rejection Reason:</strong> {order.rejectionReason}</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <InvoiceButton order={order} token={token} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
