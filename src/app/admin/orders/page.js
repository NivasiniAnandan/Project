'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { Truck, Check, Loader2, Eye, EyeOff, X } from 'lucide-react';
import InvoiceButton from '@/components/InvoiceButton';

export default function AdminOrders() {
  const { token } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
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
      console.error('Failed to load orders in admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, newPaymentStatus, action = null, reason = '') => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          paymentStatus: newPaymentStatus,
          action,
          rejectionReason: reason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Status update failed.');
      }

      // Sync modal view details if open
      if (selectedOrder && (selectedOrder.orderId || selectedOrder.id) === orderId) {
        setSelectedOrder(data.order);
      }

      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Orders</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review order logs, update freight dispatch statuses, and check commercial invoice payments.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary-color)' }} />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Retrieving bulk orders database...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No orders have been submitted to the database yet.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Retailer / Business</th>
                <th>Order Date</th>
                <th>Total Price</th>
                <th>Delivery Status</th>
                <th>Payment Status</th>
                <th>Method</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId || o.id}>
                  <td style={{ fontWeight: 700 }}>#{o.orderId || o.id}</td>
                  <td>
                    <strong>{o.shippingAddress.businessName || o.shippingAddress.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.userEmail}</div>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>₹{o.total.toLocaleString('en-IN')}</td>
                  <td>
                    <select
                      value={o.status}
                      disabled={updatingId === (o.orderId || o.id)}
                      onChange={(e) => handleUpdateStatus(o.orderId || o.id, e.target.value, null)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#f8fafc',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending Approval</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {o.transferId ? (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {{ verification_pending: 'Verification Pending', paid: 'Paid', rejected: 'Rejected' }[o.paymentStatus] || o.paymentStatus}
                      </span>
                    ) : (
                      <select
                        value={o.paymentStatus}
                        disabled={updatingId === (o.orderId || o.id)}
                        onChange={(e) => handleUpdateStatus(o.orderId || o.id, null, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#f8fafc',
                          outline: 'none'
                        }}
                      >
                        <option value="invoice_sent">Invoice Issued</option>
                        <option value="paid">Paid (Cleared)</option>
                        <option value="overdue">Overdue / Alert</option>
                      </select>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{o.transferId ? 'GPay' : o.paymentMethod.replace('-', ' ')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setRejectionReason('');
                        setSelectedOrder(o);
                      }}
                      className="btn-sm btn-edit"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order Invoice Details: #{selectedOrder.orderId || selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
              
              {/* Shipping section */}
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Dispatch & Delivery Address</h4>
                <div><strong>Business Name:</strong> {selectedOrder.shippingAddress.businessName}</div>
                <div><strong>Deliver To:</strong> {selectedOrder.shippingAddress.name}</div>
                <div><strong>Contact Phone:</strong> {selectedOrder.shippingAddress.phone}</div>
                <div><strong>Delivery Address:</strong> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.pincode}</div>
              </div>

              {/* Payment verification details */}
              <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Payment Verification</h4>
                <div><strong>Payment Method:</strong> {selectedOrder.transferId ? 'GPay' : selectedOrder.paymentMethod.replace('-', ' ')}</div>
                {selectedOrder.transferId && <div><strong>Transfer ID / UTR:</strong> {selectedOrder.transferId}</div>}
                <div><strong>Payment Status:</strong> {{ verification_pending: 'Verification Pending', paid: 'Paid', rejected: 'Rejected', invoice_sent: 'Invoice Sent' }[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}</div>
                <div><strong>Order Status:</strong> {selectedOrder.status}</div>
                {selectedOrder.verifiedAt && <div><strong>Verified Date:</strong> {new Date(selectedOrder.verifiedAt).toLocaleString('en-IN')}</div>}
                {selectedOrder.verifiedByEmail && <div><strong>Verified By:</strong> {selectedOrder.verifiedByEmail}</div>}
                {selectedOrder.rejectionReason && <div><strong>Rejection Reason:</strong> {selectedOrder.rejectionReason}</div>}

                {selectedOrder.transferId && selectedOrder.paymentStatus === 'verification_pending' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button
                      type="button"
                      disabled={updatingId === (selectedOrder.orderId || selectedOrder.id)}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId || selectedOrder.id, null, null, 'verify_payment')}
                      style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none', padding: '0.55rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Verify Payment
                    </button>
                    <label htmlFor="payment-rejection-reason" style={{ fontWeight: 700 }}>Rejection Reason</label>
                    <textarea
                      id="payment-rejection-reason"
                      value={rejectionReason}
                      onChange={(event) => setRejectionReason(event.target.value)}
                      placeholder="Enter reason"
                      rows={3}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '6px', resize: 'vertical' }}
                    />
                    <button
                      type="button"
                      disabled={updatingId === (selectedOrder.orderId || selectedOrder.id) || !rejectionReason.trim()}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId || selectedOrder.id, null, null, 'reject_payment', rejectionReason.trim())}
                      style={{ backgroundColor: '#b91c1c', color: 'white', border: 'none', padding: '0.55rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div>
                <h4 style={{ fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary-color)' }}>Purchased Products</h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Pack Size: {item.packSize || item.unit} • Quantity: {item.quantity} units • Price: ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.subtotal - selectedOrder.total > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    <span>Bulk Discount:</span>
                    <span>- ₹{(selectedOrder.subtotal - selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                  <span>Grand Total Invoice Value:</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Actions details inside modal */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <InvoiceButton order={selectedOrder} token={token} />
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{ backgroundColor: '#cbd5e1', color: 'var(--text-main)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
