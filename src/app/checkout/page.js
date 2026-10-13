'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Context';
import {
  Truck,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import InvoiceButton from '@/components/InvoiceButton';

export default function Checkout() {
  const router = useRouter();
  const { cart, user, token, clearCart } = useApp();

  // =========================================================
  // PAGE STATES
  // =========================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // =========================================================
  // REDIRECT IF CART IS EMPTY OR USER NOT LOGGED IN
  // =========================================================

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.push('/cart');
    }

    if (!user && !orderSuccess) {
      router.push('/login?redirect=checkout');
    }
  }, [cart, user, orderSuccess, router]);

  // =========================================================
  // FORM FIELDS
  // =========================================================

  const [businessName, setBusinessName] = useState('');
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(
    user?.phone || ''
  );
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [transferId, setTransferId] = useState('');

  // =========================================================
  // PAYMENT METHOD
  // =========================================================
  // Keeping invoice internally so existing backend remains compatible

  const [paymentMethod] = useState('invoice');

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  let discountPercent = 0;

  if (subtotal >= 50000) {
    discountPercent = 8;
  } else if (subtotal >= 25000) {
    discountPercent = 5;
  } else if (subtotal >= 10000) {
    discountPercent = 2;
  }

  const discountAmount = Math.round(
    subtotal * (discountPercent / 100)
  );

  // Shipping Freight
  // ₹50 for orders below ₹15,000
  // FREE for orders ₹15,000 and above

  const shippingFee =
    subtotal > 0 && subtotal < 15000 ? 50 : 0;

  const total =
    subtotal - discountAmount + shippingFee;

  // =========================================================
  // HANDLE ORDER SUBMISSION
  // =========================================================

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const normalizedTransferId = transferId.trim();
    if (!normalizedTransferId) {
      setErrorMsg('Please enter your GPay Transfer ID / UTR Number.');
      return;
    }

    if (
      !shippingName ||
      !shippingPhone ||
      !address ||
      !city ||
      !pincode
    ) {
      setErrorMsg('Please fill in all shipping details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const shippingDetails = {
      name: shippingName,
      businessName:
        businessName || 'Retailer / Distributor Store',
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          subtotal,
          discountAmount,
          shippingFee,
          total,
          shippingAddress: shippingDetails,
          paymentMethod,
          transferId: normalizedTransferId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Order submission failed.'
        );
      }

      setCreatedOrder(data.order);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      setErrorMsg(
        err.message ||
          'An error occurred while placing order.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // ORDER SUCCESS PAGE
  // =========================================================

  if (orderSuccess && createdOrder) {
    return (
      <div
        className="container"
        style={{
          maxWidth: '600px',
          padding: '4rem 1.5rem',
          textAlign: 'center'
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            color: 'var(--color-success)',
            display: 'inline-block',
            marginBottom: '1.5rem'
          }}
        >
          <CheckCircle2
            size={64}
            fill="var(--primary-light)"
          />
        </div>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--primary-color)',
            marginBottom: '0.5rem'
          }}
        >
          Order Submitted
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            marginBottom: '2rem'
          }}
        >
          Thank you for choosing Bommal Foods. Your order{' '}
          <strong>
            #{createdOrder.orderId || createdOrder.id}
          </strong>{' '}
          has been successfully placed.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3
            style={{
              borderBottom:
                '1px solid var(--border-color)',
              paddingBottom: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1rem'
            }}
          >
            Order Details
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <strong>Business Name:</strong>{' '}
              {createdOrder.shippingAddress.businessName}
            </div>

            <div>
              <strong>Deliver To:</strong>{' '}
              {createdOrder.shippingAddress.name}
            </div>

            <div>
              <strong>Phone Number:</strong>{' '}
              {createdOrder.shippingAddress.phone}
            </div>

            <div>
              <strong>Shipping Address:</strong>{' '}
              {createdOrder.shippingAddress.address},{' '}
              {createdOrder.shippingAddress.city} -{' '}
              {createdOrder.shippingAddress.pincode}
            </div>

            {/* Payment Method */}
            <div>
              <strong>Payment Method:</strong>{' '}
              GPay
            </div>

            <div>
              <strong>Transfer ID / UTR Number:</strong>{' '}
              {createdOrder.transferId}
            </div>

            <div>
              <strong>Payment Status:</strong>{' '}
              {createdOrder.paymentStatus === 'verification_pending' ? 'Verification Pending' : createdOrder.paymentStatus}
            </div>

            <div>
              <strong>Order Status:</strong>{' '}
              {createdOrder.status === 'pending' ? 'Pending' : createdOrder.status}
            </div>

            {/* Shipping Freight */}
            <div
              style={{
                borderTop:
                  '1px solid var(--border-color)',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Shipping Freight:</span>

              <span style={{ fontWeight: 700 }}>
                {createdOrder.shippingFee !== undefined
                  ? createdOrder.shippingFee === 0
                    ? 'FREE'
                    : `₹${createdOrder.shippingFee.toLocaleString(
                        'en-IN'
                      )}`
                  : '₹50'}
              </span>
            </div>

            {/* Total */}
            <div
              style={{
                borderTop:
                  '1px solid var(--border-color)',
                paddingTop: '0.5rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <span>Total Price:</span>

              <span
                style={{
                  color: 'var(--primary-color)'
                }}
              >
                ₹
                {createdOrder.total.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Message */}
        <div
          style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-color)',
            color: 'var(--primary-color)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            textAlign: 'left',
            marginBottom: '2rem',
            lineHeight: '1.5'
          }}
        >
          <strong>Payment Information:</strong>{' '}
          Your GPay payment is pending verification. Keep
          your Transfer ID for reference.
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <InvoiceButton
            order={createdOrder}
            token={token}
          />

          <Link
            href="/orders"
            className="btn-primary"
          >
            View Order History
          </Link>

          <Link
            href="/"
            className="btn-secondary"
            style={{
              backgroundColor: '#cbd5e1',
              color: 'var(--text-main)'
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // CHECKOUT PAGE
  // =========================================================

  return (
    <div
      className="container"
      style={{
        paddingBottom: '4rem'
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          margin: '2rem 0 1.5rem 0'
        }}
      >
        Secure Checkout
      </h1>

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        className="cart-layout"
        style={{
          gridTemplateColumns: '1fr 360px'
        }}
      >
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <form onSubmit={handleSubmitOrder}>

          {/* =====================================================
              STEP 1: SHIPPING DETAILS
          ====================================================== */}

          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border:
                '1px solid var(--border-color)',
              padding: '2rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                borderBottom:
                  '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary-color)'
              }}
            >
              <Truck size={20} />

              1. Shipping Address & Business Info
            </h2>

            {/* Business & Name */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Business / Shop Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Senthil Stores (Optional)"
                  className="form-control"
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contact Person Name *
                </label>

                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="form-control"
                  value={shippingName}
                  onChange={(e) =>
                    setShippingName(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                Phone Number (Direct Delivery Contact) *
              </label>

              <input
                type="text"
                required
                placeholder="10-digit number"
                className="form-control"
                value={shippingPhone}
                onChange={(e) =>
                  setShippingPhone(e.target.value)
                }
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">
                Warehouse / Delivery Street Address *
              </label>

              <textarea
                required
                rows={3}
                placeholder="Enter detailed delivery street address, building number, block number"
                className="form-control"
                style={{
                  resize: 'none'
                }}
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
              />
            </div>

            {/* City / State / Pincode */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr 1fr',
                gap: '1rem'
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  City *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Madurai"
                  className="form-control"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  State *
                </label>

                <select
                  className="form-control"
                  value={state}
                  onChange={(e) =>
                    setState(e.target.value)
                  }
                >
                  <option value="Tamil Nadu">
                    Tamil Nadu
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Kerala">
                    Kerala
                  </option>

                  <option value="Andhra Pradesh">
                    Andhra Pradesh
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Postal Pincode *
                </label>

                <input
                  type="text"
                  required
                  placeholder="6 digits"
                  className="form-control"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              STEP 2: PAYMENT METHOD
          ====================================================== */}

          <div
            style={{
              background: 'white',
              borderRadius: '10px',
              border:
                '1px solid var(--border-color)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                borderBottom:
                  '1px solid var(--border-color)',
                paddingBottom: '0.6rem',
                marginBottom: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary-color)'
              }}
            >
              <CreditCard size={19} />

              2. Payment Method
            </h2>

            {/* =================================================
                SMALL QR PAYMENT CARD
            ================================================== */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '0.8rem'
              }}
            >
              <div
                style={{
                  width: '280px',
                  border:
                    '2px solid var(--primary-color)',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  backgroundColor:
                    'var(--primary-light)',
                  textAlign: 'center'
                }}
              >
                {/* QR ICON */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '0.3rem',
                    color: 'var(--primary-color)'
                  }}
                >
                  <QrCode size={22} />
                </div>

                {/* TITLE */}
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    color: 'var(--primary-color)',
                    marginBottom: '0.25rem'
                  }}
                >
                  Scan to Pay
                </strong>

                {/* DESCRIPTION */}
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem',
                    lineHeight: '1.3'
                  }}
                >
                  Scan this QR code to make payment
                </p>

                {/* =================================================
                    QR IMAGE
                ================================================== */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0.5rem auto'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      padding: '6px',
                      border:
                        '1px solid var(--border-color)',
                      boxShadow:
                        '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <img
                      src="/Gpay.jpeg"
                      alt="Payment QR Code"
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>

                {/* UPI TEXT */}
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <strong
                    style={{
                      color: 'var(--text-main)'
                    }}
                  >
                    UPI Payment
                  </strong>

                  <br />

                  Google Pay • PhonePe • Paytm
                </div>
              </div>
            </div>
            {/* SECURITY NOTE */}
            <div
              style={{
                marginTop: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.68rem',
                color: 'var(--text-muted)'
              }}
            >
              <ShieldCheck size={14} />

              Secure UPI Payment
            </div>

            <label
              htmlFor="transferId"
              style={{
                display: 'block',
                marginTop: '1rem',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              Transfer ID / UTR Number
            </label>
            <input
              id="transferId"
              name="transferId"
              type="text"
              required
              value={transferId}
              onChange={(event) => setTransferId(event.target.value)}
              placeholder="Enter your GPay Transfer ID"
              autoComplete="off"
              style={{
                width: '100%',
                marginTop: '0.4rem',
                padding: '0.7rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </form>

        {/* =====================================================
            RIGHT SIDE: ORDER SUMMARY
        ====================================================== */}

        <aside className="cart-summary">

          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              marginBottom: '1.25rem'
            }}
          >
            Review Items (
            {cart.reduce(
              (a, b) => a + b.quantity,
              0
            )}
            )
          </h2>

          {/* CART ITEMS */}
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              marginBottom: '1rem',
              borderBottom:
                '1px solid var(--border-color)',
              paddingBottom: '0.5rem'
            }}
          >
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '0.5rem'
                }}
              >
                <span
                  style={{
                    color: 'var(--text-main)',
                    maxWidth: '200px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.name} ({item.packSize || item.unit}){' '}

                  <strong
                    style={{
                      color: 'var(--text-muted)'
                    }}
                  >
                    x {item.quantity}
                  </strong>
                </span>

                <span
                  style={{
                    fontWeight: 700
                  }}
                >
                  ₹
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* SUBTOTAL */}
          <div className="summary-row">
            <span
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Subtotal
            </span>

            <span
              style={{
                fontWeight: 700
              }}
            >
              ₹
              {subtotal.toLocaleString(
                'en-IN'
              )}
            </span>
          </div>

          {/* DISCOUNT */}
          {discountAmount > 0 && (
            <div
              className="summary-row"
              style={{
                color:
                  'var(--color-success)',
                fontWeight: 600
              }}
            >
              <span>
                Bulk Discount
              </span>

              <span>
                - ₹
                {discountAmount.toLocaleString(
                  'en-IN'
                )}
              </span>
            </div>
          )}

          {/* SHIPPING */}
          <div className="summary-row">
            <span
              style={{
                color: 'var(--text-muted)'
              }}
            >
              Shipping Freight
            </span>

            <span
              style={{
                fontWeight: 700,
                color:
                  shippingFee > 0
                    ? 'var(--primary-color)'
                    : 'var(--color-success)'
              }}
            >
              {shippingFee === 0
                ? 'FREE'
                : `₹${shippingFee.toLocaleString(
                    'en-IN'
                  )}`}
            </span>
          </div>

          {/* TOTAL */}
          <div
            className="summary-row summary-total"
            style={{
              borderTop:
                '1px solid var(--border-color)',
              paddingTop: '0.75rem',
              marginTop: '0.75rem'
            }}
          >
            <span>
              Order Total
            </span>

            <span
              style={{
                color:
                  'var(--primary-color)'
              }}
            >
              ₹
              {total.toLocaleString(
                'en-IN'
              )}
            </span>
          </div>

          {/* PLACE ORDER */}
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="btn-checkout"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Placing Order...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />

                Place Order
              </>
            )}
          </button>

          {/* EDIT CART */}
          <div
            style={{
              marginTop: '1rem'
            }}
          >
            <Link
              href="/cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
              }}
            >
              <ArrowLeft size={12} />

              Edit Shopping Cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}