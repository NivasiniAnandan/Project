'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/Context';
import Link from 'next/link';
import { Loader2, Lock, Mail } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useApp();

  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already logged in redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    }
  }, [user, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Welcome To Bommal Foods</h1>
      
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* Info Badge */}
      

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              placeholder="name@business.com"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Password</label>
            <Link href="#" style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', fontWeight: 600 }} onClick={() => alert('Password recovery: Please contact Bommal IT support at support@bommalfoods.com to reset your credentials.')}>
              Forgot Password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing In...
            </>
          ) : (
            'Sign In to Account'
          )}
        </button>
      </form>

      <div className="auth-link-text">
        New to Bommal Foods? <Link href="/register">Register Business Account</Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}