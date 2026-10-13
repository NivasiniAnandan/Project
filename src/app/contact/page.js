'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Bulk Purchase Inquiry');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setErrorMsg('Please fill in all form fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '2rem 0 0.5rem 0' }}>Contact & Inquiries</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Are you a retailer looking to stock Bommal Foods products or a distributor inquiring about regional permissions? Please submit details below. Our manager will contact you within 24 hours.
      </p>

      <div className="cart-layout" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        {/* Left: Contact Form */}
        <div style={{ background: 'white', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Inquiry Submitted Successfully!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Thank you for contacting Bommal Foods. A simulated email notification has been dispatched to our sales team. We will get back to you shortly.
              </p>
              <button onClick={() => setSuccess(false)} className="btn-primary">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Send a Message</h3>
              
              {errorMsg && (
                <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@business.com"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Purpose *</label>
                <select
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="Bulk Purchase Inquiry">Bulk Purchase Inquiry (Quantities)</option>
                  <option value="Distributor Application">Regional Dealership / Distributor Application</option>
                  <option value="Product Quality Inquiry">Product Quality & Specifications (FSSAI/Organic)</option>
                  <option value="Logistics/Delivery Inquiry">Direct Shipping & Logistics Inquiries</option>
                  <option value="Other Inquiries">Other Query</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Detailed Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your inquiry, shop location, estimated monthly volume, or any specific questions..."
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '180px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Info Card */}
          <div style={{ background: 'white', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary-color)' }}>Contact Office</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={20} style={{ color: 'var(--primary-color)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong>Bommal Foods</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Kowsalya Traders, Vaikalmedu Perundurai to Erode main road, Erode 638052                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone size={20} style={{ color: 'var(--primary-color)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong>Direct Inquiry Hotlines</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Distributor Support: +91 9171994151<br />
                    Office Line: +91 9677112113
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Mail size={20} style={{ color: 'var(--primary-color)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <strong>Email</strong>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    General: bommalfoods@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timings Card */}
          <div style={{ background: 'var(--primary-light)', border: '1px solid #d1fae5', padding: '1.5rem', borderRadius: '12px', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Dispatch Timings</h4>
            <p style={{ lineHeight: '1.5' }}>
              Our Koyambedu loading warehouse operates from <strong>Monday to Saturday (8:00 AM to 6:00 PM)</strong>. Direct truck dispatches are scheduled within 48 hours of payment clearance or invoice confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
