'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/components/Context';
import ProductCard from '@/components/ProductCard';
import { Star, ShoppingCart, ShieldCheck, Heart, ArrowLeft, Plus, Minus, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cart } = useApp();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadProductDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?id=${id}`);
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.related || []);
        setActiveImageIdx(0);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', gap: '1rem' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The wholesale item you are looking for does not exist or has been removed.</p>
        <Link href="/catalog" className="btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  // Calculate cart states
  const cartItem = cart.find(item => item.id === product.id);
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (qty + currentCartQty < product.stock) {
      setQty(prev => prev + 1);
    } else {
      alert(`Cannot add more. Available stock is ${product.stock} units.`);
    }
  };

  const handleDecrement = () => {
    setQty(prev => Math.max(1, prev - 1));
  };

  const handleAddToCartClick = () => {
    const success = addToCart(product, qty);
    if (success) {
      setIsAdded(true);
      setQty(1);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Star builder
  const stars = [];
  const fullStars = Math.floor(product.rating);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={16}
        fill={i < fullStars ? 'currentColor' : 'none'}
        stroke="currentColor"
        style={{ color: 'var(--secondary-color)' }}
      />
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Back link */}
      <div style={{ margin: '1.5rem 0' }}>
        <button
          onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--primary-hover)', fontWeight: 700, cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to listings
        </button>
      </div>

      {/* Product Details Section */}
      <div className="detail-layout">
        {/* Left Side: Images */}
        <div className="detail-gallery">
          <div className="main-img-container">
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
            />
          </div>
          
          {/* Thumbnails switcher */}
          {product.images.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`gallery-thumb ${activeImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Information */}
        <div className="detail-info">
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--primary-hover)',
            marginBottom: '0.5rem'
          }}>{product.categoryId.replace('-', ' ')}</span>
          
          <h1 className="detail-title">{product.name}</h1>

          {/* Rating */}
          <div className="detail-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ display: 'flex' }}>{stars}</div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', marginLeft: '5px' }}>{product.rating}</span>
            </div>
            <span style={{ color: 'var(--border-color)', height: '15px', borderLeft: '1px solid' }}></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.numReviews} Verified Reviews</span>
          </div>

          {/* Price Box */}
          <div className="detail-price-box">
            <div className="detail-price-row">
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>₹</span>
              <span className="detail-price">{product.price.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ {product.unit} (Wholesale Price)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', fontWeight: 600, marginTop: '0.25rem' }}>
              * FSSAI approved packing. Price includes local manufacturing duties.
            </p>
          </div>

          {/* Core specs list */}
          <div className="detail-specs">
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} className="spec-item">
                <span className="spec-label">{key}</span>
                <span className="spec-val">{val}</span>
              </div>
            ))}
          </div>

          {/* Stock & Quantity Add to Cart */}
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Stock Availability: </span>
              {product.stock > 0 ? (
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.95rem' }}>
                  In Stock ({product.stock} units available)
                </span>
              ) : (
                <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.95rem' }}>
                  Temporarily Out of Stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="quantity-selector" style={{ width: '120px' }}>
                  <button onClick={handleDecrement} className="qty-btn" type="button">
                    <Minus size={16} />
                  </button>
                  <span className="qty-val">{qty}</span>
                  <button onClick={handleIncrement} className="qty-btn" type="button">
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCartClick}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    backgroundColor: isAdded ? '#10b981' : 'var(--secondary-color)',
                    justifyContent: 'center'
                  }}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Wholesale Order
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs description / benefits / usage */}
      <div style={{ marginTop: '2.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
        <div className="detail-tabs">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Product Description
          </button>
          <button
            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            Health & Quality Benefits
          </button>
          <button
            className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            Usage Instructions
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div>
              <p style={{ marginBottom: '1rem' }}>{product.description}</p>
              <h4 style={{ fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>Technical Specifications:</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {Object.entries(product.specs).map(([key, val]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {val}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'benefits' && (
            <ul className="benefits-list">
              {product.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          )}

          {activeTab === 'usage' && (
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {product.usage.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Related Products Recommendation */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '4rem' }}>
          <h2 className="section-title">Similar Wholesale Products</h2>
          <div className="products-grid">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
