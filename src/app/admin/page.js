'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { IndianRupee, ShoppingBag, Package, MessageSquare, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { token } = useApp();
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    ordersCount: 0,
    productsCount: 0,
    lowStockCount: 0,
    pendingInquiries: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch products, orders, and inquiries in parallel
        const [prodRes, ordRes, inqRes] = await Promise.all([
          fetch('/api/products?type=catalog'),
          fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/inquiries', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (prodRes.ok && ordRes.ok && inqRes.ok) {
          const prodsData = await prodRes.json();
          const ordsData = await ordRes.json();
          const inqsData = await inqRes.json();

          const productsList = prodsData.products || [];
          const ordersList = ordsData.orders || [];
          const inquiriesList = inqsData.inquiries || [];

          // Calculate metrics
          const salesTotal = ordersList.reduce((acc, o) => acc + o.total, 0);
          const lowStock = productsList.filter(p => p.stock <= 10).length;
          const pendingInqs = inquiriesList.filter(i => i.status === 'pending').length;

          setMetrics({
            totalSales: salesTotal,
            ordersCount: ordersList.length,
            productsCount: productsList.length,
            lowStockCount: lowStock,
            pendingInquiries: pendingInqs
          });

          // Recent 5 orders
          setRecentOrders(ordersList.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load admin dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Calculating sales analytics and metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalSales.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />,
      color: "var(--primary-color)"
    },
    {
      title: "Total Orders Placed",
      value: metrics.ordersCount,
      icon: <Package size={22} />,
      color: "var(--secondary-color)"
    },
    {
      title: "Active Products in Catalog",
      value: metrics.productsCount,
      icon: <ShoppingBag size={22} />,
      color: "#1e40af"
    },
    {
      title: "Pending Inquiries",
      value: metrics.pendingInquiries,
      icon: <MessageSquare size={22} />,
      color: "#0d9488"
    }
  ];

  return (
    <div>
      <div className="admin-header-row">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Analytics & Dashboard Overview</h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          System live monitoring: <strong>Online</strong>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="admin-card-stats">
        {statCards.map((card, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-info">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{card.title}</span>
              <span className="stat-val">{card.value}</span>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'var(--bg-light)', color: card.color }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Critical Warnings */}
      {metrics.lowStockCount > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          color: '#b45309',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> Alert: You have {metrics.lowStockCount} products running extremely low on inventory stock (≤ 10 items).
          </span>
          <Link href="/admin/products" style={{ textDecoration: 'underline', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Update Inventory Stock <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      {/* Main Grid content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Recent Orders table */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary-hover)', fontWeight: 700 }}>
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders placed yet.</p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Retailer</th>
                    <th>Total Value</th>
                    <th>Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700 }}>#{o.id}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                      <td>{o.shippingAddress.businessName || o.shippingAddress.name}</td>
                      <td style={{ fontWeight: 700 }}>₹{o.total.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge-status ${
                          o.status === 'pending' ? 'badge-pending' :
                          o.status === 'shipped' ? 'badge-shipped' : 'badge-completed'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info panel: Business stats */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem' }}>Business Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <strong>B2B Billing Currency:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>INR (Indian Rupee - ₹)</div>
            </div>
            
            <div>
              <strong>Dispatch Center Address:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
                Kowsalya Traders, Vaikalmedu Perundurai to Erode main road, Erode 638052
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
