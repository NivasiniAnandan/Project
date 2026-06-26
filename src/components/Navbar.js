'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApp } from './Context';
import { ShoppingCart, Search, User, Package, ChevronDown, LogOut, LayoutDashboard, Menu, PhoneCall } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart, user, logout } = useApp();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const suggestionsRef = useRef(null);

  // Fetch categories & setup click outside listener
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/products?type=catalog');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadData();

    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle autocomplete query updates
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const url = `/api/products?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // limit suggestions to 6
          setSuggestions(data.products ? data.products.slice(0, 6) : []);
        }
      } catch (error) {
        console.error('Error loading search suggestions:', error);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(`/catalog?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
  };

  const handleSuggestionClick = (prodId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(`/product/${prodId}`);
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="header-wrapper">
      {/* Top Main Nav */}
      <div className="nav-main container">
        {/* Brand Logo */}
        <Link href="/" className="logo">
          Bommal <span>Foods</span>
        </Link>

        {/* Search Bar */}
        <div className="search-container" ref={suggestionsRef}>
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <select
              className="search-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="search-input"
              placeholder="Search wholesale food items, oils, grains..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((prod) => (
                <div
                  key={prod.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(prod.id)}
                >
                  <Search size={14} style={{ color: '#9ca3af' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>{prod.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '8px' }}>
                      in {prod.categoryId.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Action Links */}
        <div className="nav-actions">
          {/* User Profile / Auth */}
          {user ? (
            <div className="nav-link-item" style={{ position: 'relative', cursor: 'pointer' }}>
              <span className="nav-link-sub">Hello, {user.name.split(' ')[0]}</span>
              <span className="nav-link-main" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                My Account <ChevronDown size={14} />
              </span>
              
              {mobileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: 'white',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  padding: '0.5rem 0',
                  minWidth: '160px',
                  zIndex: 2000,
                  border: '1px solid #e5e7eb',
                  marginTop: '5px'
                }}>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="suggestion-item" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard size={14} /> Admin Panel
                    </Link>
                  )}
                  <Link href="/orders" className="suggestion-item" onClick={() => setMobileMenuOpen(false)}>
                    <Package size={14} /> Order History
                  </Link>
                  <div className="suggestion-item" style={{ color: '#ef4444' }} onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}>
                    <LogOut size={14} /> Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="nav-link-item">
              <span className="nav-link-sub">Hello, Sign in</span>
              <span className="nav-link-main">
                Account <User size={14} />
              </span>
            </Link>
          )}

          {/* Orders */}
          <Link href="/orders" className="nav-link-item">
            <span className="nav-link-sub">Wholesale</span>
            <span className="nav-link-main">Orders</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="nav-link-item cart-icon-wrapper">
            <ShoppingCart size={24} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            <span className="nav-link-main" style={{ marginLeft: '4px' }}>Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub Nav Menu */}
      <div className="sub-nav">
        <Link href="/catalog" className="sub-nav-item">
          <Menu size={16} /> All Products
        </Link>
        {categories.slice(0, 7).map((cat) => (
          <Link key={cat.id} href={`/catalog?category=${cat.id}`} className="sub-nav-item">
            {cat.name}
          </Link>
        ))}
        <Link href="/contact" className="sub-nav-item" style={{ marginLeft: 'auto' }}>
          <PhoneCall size={14} /> Wholesaler Inquiries
        </Link>
      </div>
    </header>
  );
}
