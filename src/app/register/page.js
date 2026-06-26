'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/Context';
import Link from 'next/link';
import { Loader2, User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register, user } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Already logged in redirect
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await register(name, email, password, phone, address);
    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '450px' }}>
      <h1 className="auth-title">Register Business Account</h1>
      
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Business Contact Name *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              placeholder="e.g. Senthil Kumar"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              placeholder="e.g. store@gmail.com"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Create Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              required
              placeholder="Min 6 characters"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contact Phone Number *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              placeholder="10-digit number"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Default Shipping / Warehouse Address</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. No 45, Bazaar Street, Madurai"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Registering Account...
            </>
          ) : (
            'Create Business Account'
          )}
        </button>
      </form>

      <div className="auth-link-text">
        Already have a wholesale account? <Link href="/login">Sign In</Link>
      </div>
    </div>
  );
}
