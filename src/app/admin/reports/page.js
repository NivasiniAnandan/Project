'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { BarChart3, Calendar, Download, TrendingUp } from 'lucide-react';
import ReportDashboard from '@/components/ReportDashboard';
import ReportCharts from '@/components/ReportCharts';
import { exportToPDF, exportToExcel } from '@/lib/exportHelpers';

export default function ReportsPage() {
  const { token } = useApp();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('dashboard');
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [orderStatus, setOrderStatus] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // Quick filter handlers
  const handleQuickFilter = (days) => {
    const today = new Date();
    const from = subDays(today, days);
    setFromDate(format(from, 'yyyy-MM-dd'));
    setToDate(format(today, 'yyyy-MM-dd'));
  };

  const handleThisMonth = () => {
    const today = new Date();
    setFromDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setToDate(format(endOfMonth(today), 'yyyy-MM-dd'));
  };

  const handleThisYear = () => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);
    setFromDate(format(yearStart, 'yyyy-MM-dd'));
    setToDate(format(yearEnd, 'yyyy-MM-dd'));
  };

  // Generate report
  async function generateReport() {
    try {
      setLoading(true);
      setError('');
      
      let url = `/api/admin/reports?type=${reportType}&fromDate=${fromDate}&toDate=${toDate}`;
      
      if (reportType === 'orders') {
        url = `/api/admin/reports/orders?fromDate=${fromDate}&toDate=${toDate}&status=${orderStatus}&export=true`;
      } else if (reportType === 'sales') {
        url = `/api/admin/reports/sales?fromDate=${fromDate}&toDate=${toDate}`;
      } else if (reportType === 'products') {
        url = `/api/admin/reports/products?type=products&fromDate=${fromDate}&toDate=${toDate}`;
      } else if (reportType === 'categories') {
        url = `/api/admin/reports/products?type=categories&fromDate=${fromDate}&toDate=${toDate}`;
      } else if (reportType === 'customers') {
        url = `/api/admin/reports/customers?type=customers&fromDate=${fromDate}&toDate=${toDate}`;
      } else if (reportType === 'payments') {
        url = `/api/admin/reports/customers?type=payments&fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Unable to generate report. Please try again.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }

  // Handle PDF export
  const handlePDFExport = async () => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }
    try {
      setLoading(true);
      await exportToPDF(reportType, reportData, fromDate, toDate);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = () => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }
    try {
      exportToExcel(reportType, reportData, fromDate, toDate);
    } catch (err) {
      console.error('Excel export failed:', err);
      alert('Failed to export Excel. Check console for details.');
    }
  };

  return (
    <div className="admin-reports-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
          Reports
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate and analyze business reports</p>
      </div>

      {/* Filter Section */}
      <div className="reports-filter-section">
        <div className="filter-card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Quick Filters
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
              <button className="quick-filter-btn" onClick={() => handleQuickFilter(0)}>Today</button>
              <button className="quick-filter-btn" onClick={() => handleQuickFilter(1)}>Yesterday</button>
              <button className="quick-filter-btn" onClick={() => handleQuickFilter(7)}>Last 7 Days</button>
              <button className="quick-filter-btn" onClick={handleThisMonth}>This Month</button>
              <button className="quick-filter-btn" onClick={() => handleQuickFilter(30)}>Last Month</button>
              <button className="quick-filter-btn" onClick={handleThisYear}>This Year</button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Custom Date Range
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
              Report Type
            </h3>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <option value="dashboard">Dashboard Summary</option>
              <option value="sales">Sales Report</option>
              <option value="orders">Order Report</option>
              <option value="products">Product Sales Report</option>
              <option value="categories">Category Sales Report</option>
              <option value="customers">Customer/Retailer Report</option>
              <option value="payments">Payment Report</option>
            </select>
          </div>

          {reportType === 'orders' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>
                Order Status Filter
              </h3>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary"
              style={{
                gridColumn: '1 / 4',
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#999' : 'var(--primary-color)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              onClick={handlePDFExport}
              disabled={!reportData || loading}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: reportData && !loading ? '#1f2937' : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: reportData && !loading ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
            >
              <Download size={16} />
              PDF
            </button>
            <button
              onClick={handleExcelExport}
              disabled={!reportData || loading}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: reportData && !loading ? '#059669' : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: reportData && !loading ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
            >
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ marginTop: '2rem' }}>
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        {reportData && !loading && (
          <>
            <ReportCharts reportType={reportType} reportData={reportData} />
            <ReportDashboard reportType={reportType} reportData={reportData} />
          </>
        )}
      </div>

      <style>{`
        .admin-reports-container {
          padding: 2rem;
          maxWidth: 1400px;
          margin: 0 auto;
        }

        .reports-filter-section {
          marginBottom: 2rem;
        }

        .filter-card {
          backgroundColor: var(--bg-card);
          borderRadius: var(--radius-lg);
          padding: 1.5rem;
          boxShadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }

        .quick-filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          backgroundColor: var(--bg-secondary);
          color: var(--text-main);
          borderRadius: var(--radius-md);
          cursor: pointer;
          fontSize: 0.85rem;
          fontWeight: 500;
          transition: all 0.2s;
        }

        .quick-filter-btn:hover {
          backgroundColor: var(--primary-light);
          borderColor: var(--primary-color);
          color: var(--primary-color);
        }

        .btn-primary {
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          backgroundColor: var(--primary-hover);
          boxShadow: var(--shadow-md);
        }

        @media (max-width: 768px) {
          .admin-reports-container {
            padding: 1rem;
          }

          .filter-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
