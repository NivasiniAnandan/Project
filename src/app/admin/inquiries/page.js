'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { Mail, Check, Reply, MessageSquare, Loader2, X, Send } from 'lucide-react';

export default function AdminInquiries() {
  const { token } = useApp();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reply popup modal state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to load inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleOpenReplyModal = (inq) => {
    setSelectedInquiry(inq);
    setReplyMessage(inq.replyMessage || '');
    setErrorMsg('');
  };

  const handleSendReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setErrorMsg('Reply message cannot be empty.');
      return;
    }

    setSendingReply(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          replyMessage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit reply.');
      }

      setSelectedInquiry(null);
      setReplyMessage('');
      loadInquiries();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while sending reply.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Customer & Retailer Inquiries</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track business interest forms, bulk shipment queries, and dispatch replies.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary-color)' }} />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Fetching submissions from retailers...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No inquiries have been received yet.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client Name</th>
                <th>Subject</th>
                <th>Message Content</th>
                <th>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Reply</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>{new Date(inq.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                  <td>
                    <strong>{inq.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.email}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{inq.subject}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inq.message}
                  </td>
                  <td>
                    <span className={`badge-status ${inq.status === 'replied' ? 'badge-completed' : 'badge-pending'}`}>
                      {inq.status === 'replied' ? 'Replied' : 'Pending Response'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenReplyModal(inq)}
                      className="btn-sm btn-edit"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Reply size={12} /> {inq.status === 'replied' ? 'Edit' : 'Reply'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reply Modal Popup Overlay */}
      {selectedInquiry && (
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
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                Respond to Inquiry
              </h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Original inquiry message info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-light)', lineHeight: '1.5' }}>
                <div><strong>From:</strong> {selectedInquiry.name} ({selectedInquiry.email})</div>
                <div><strong>Subject:</strong> {selectedInquiry.subject}</div>
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                  &ldquo;{selectedInquiry.message}&rdquo;
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReplySubmit}>
                {errorMsg && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Email Response Message *</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Enter email response to client. Submitting this form simulates sending an email notification directly to their inbox."
                    className="form-control"
                    style={{ resize: 'none' }}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  ></textarea>
                </div>

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    style={{ backgroundColor: '#cbd5e1', color: 'var(--text-main)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1.25rem' }}
                  >
                    {sendingReply ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Dispatching...
                      </>
                    ) : (
                      <>
                        <Send size={12} /> Dispatch Email Reply
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
