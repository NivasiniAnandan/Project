'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/components/Context';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Truck, Mail, LogOut, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading, logout } = useApp();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=admin');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Authenticating administrator credentials...</p>
      </div>
    );
  }

  const menuItems = [
    { name: 'Analytics Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Manage Products', path: '/admin/products', icon: <ShoppingBag size={18} /> },
    { name: 'Manage Orders', path: '/admin/orders', icon: <Truck size={18} /> },
    { name: 'Customer Inquiries', path: '/admin/inquiries', icon: <Mail size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid #1f2937' }}>
          <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'block' }}>Bommal Admin</strong>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.email}</span>
        </div>

        <nav style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`admin-menu-item ${pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid #1f2937', padding: '1rem 0' }}>
          <Link href="/">
            <div className="admin-menu-item">
              <ArrowLeft size={18} />
              <span>Back to Storefront</span>
            </div>
          </Link>
          <div className="admin-menu-item" style={{ color: '#ef4444' }} onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Content area */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
