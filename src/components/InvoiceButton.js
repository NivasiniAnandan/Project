'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { downloadInvoice } from '@/lib/exportHelpers';

export default function InvoiceButton({ order, token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const orderId = order.orderId || order.id;
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invoice request failed');
      await downloadInvoice(data.order);
    } catch (downloadError) {
      console.error('Invoice generation failed:', downloadError);
      setError('Unable to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
      <button type="button" className="btn-primary" onClick={handleDownload} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        {loading ? 'Generating Invoice...' : 'Download Invoice PDF'}
      </button>
      {error && <small style={{ color: '#b91c1c' }}>{error}</small>}
    </span>
  );
}