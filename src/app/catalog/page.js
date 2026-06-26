'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, Check, Loader2 } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search Param Inputs
  const paramSearch = searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || '';

  // Local State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Load Categories & Products initially
  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?type=catalog');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Fetch filtered products whenever filters or search terms change
  useEffect(() => {
    async function fetchFilteredProducts() {
      try {
        setLoading(true);
        let url = `/api/products?search=${encodeURIComponent(paramSearch)}&category=${paramCategory}&sort=${sortBy}`;
        
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (inStockOnly) url += `&availability=instock`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch filtered products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProducts();
  }, [paramSearch, paramCategory, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleCategorySelect = (catId) => {
    // Navigate updating URL query parameter
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set('category', catId);
    } else {
      params.delete('category');
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('default');
    router.push('/catalog');
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumb or Search Results Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 0.5rem 0' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {paramSearch ? `Search Results for "${paramSearch}"` : 'Wholesale Food Catalog'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {products.length} products
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort by:</span>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Relevance</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="latest">New Arrivals</option>
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Left Filters Sidebar */}
        <aside className="catalog-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.95rem' }}>
              <SlidersHorizontal size={16} /> Filters
            </span>
            <button
              onClick={handleClearAllFilters}
              style={{ background: 'none', border: 'none', color: 'var(--primary-hover)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>

          {/* Categories Filter list */}
          <div className="filter-section">
            <h4 className="filter-title">Product Categories</h4>
            <div className="filter-list">
              <div
                className={`filter-item ${!paramCategory ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                All Categories
              </div>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`filter-item ${paramCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                >
                  <span>{cat.name}</span>
                  {paramCategory === cat.id && <Check size={14} style={{ color: 'var(--primary-color)' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter Inputs */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range (₹)</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                placeholder="Min"
                className="form-control"
                style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                className="form-control"
                style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div className="filter-section" style={{ borderBottom: 'none', marginBottom: 0 }}>
            <h4 className="filter-title">Availability</h4>
            <label className="filter-item">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Right Product Grid */}
        <section>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
              <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Updating catalog listings...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We couldn't find any products matching your current search criteria or filters.
              </p>
              <button onClick={handleClearAllFilters} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary-color)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading search catalog...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
