'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from './Context';
import { Star, ShoppingCart, Plus, Minus, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, cart, user } = useApp();
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Check if item is already in cart to sync local qty if needed
  const cartItem = cart.find((item) => item.id === product.id && (item.packSize || item.unit) === (product.packSize || product.unit));
  const currentCartQty = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (qty + currentCartQty < product.stock) {
      setQty((prev) => prev + 1);
    } else {
      alert(`Cannot exceed available stock of ${product.stock} units.`);
    }
  };

  const handleDecrement = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault(); // prevent navigation when clicking in card
    const success = addToCart(product, qty);
    if (success) {
      setIsAdded(true);
      setQty(1);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Determine stock badge
  let stockBadge = <span className="badge-stock badge-in-stock">In Stock</span>;
  if (product.stock === 0) {
    stockBadge = <span className="badge-stock badge-out-of-stock">Out of Stock</span>;
  } else if (product.stock <= 10) {
    stockBadge = <span className="badge-stock badge-low-stock">Only {product.stock} left</span>;
  }

  // Generate stars
  const stars = [];
  const fullStars = Math.floor(product.rating);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={13}
        fill={i < fullStars ? 'currentColor' : 'none'}
        stroke="currentColor"
      />
    );
  }

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}?packSize=${encodeURIComponent(product.packSize || product.unit || '')}`} className="product-card-img-wrapper">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />
        {stockBadge}
      </Link>

      <div className="product-card-body">
        <span className="product-card-category">{product.categoryId.replace('-', ' ')}</span>
        
        <Link href={`/product/${product.id}?packSize=${encodeURIComponent(product.packSize || product.unit || '')}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="product-rating">
          <div className="rating-stars">{stars}</div>
          <span className="rating-count">({product.numReviews})</span>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Pack Size: {product.packSize || product.unit}
        </div>

        {/* Price */}
        <div className="product-card-price-row">
          <span className="price-symbol">₹</span>
          <span className="price-amt">{(user?.role === 'wholesale' && product.wholesalePrice != null ? product.wholesalePrice : product.price).toLocaleString('en-IN')}</span>
          <span className="price-unit">/ {product.packSize || product.unit}</span>
        </div>

        <div className="product-card-date" style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Manufactured: {product.manufactureDate || 'N/A'}
        </div>

        {/* Actions */}
        {product.stock > 0 ? (
          <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
            <div className="quantity-selector">
              <button onClick={handleDecrement} className="qty-btn" type="button">
                <Minus size={14} />
              </button>
              <span className="qty-val">{qty}</span>
              <button onClick={handleIncrement} className="qty-btn" type="button">
                <Plus size={14} />
              </button>
            </div>
            
            <button
              onClick={handleAddToCartClick}
              className="btn-card-add"
              style={{ backgroundColor: isAdded ? '#10b981' : 'var(--secondary-color)' }}
              type="button"
            >
              {isAdded ? (
                <>
                  <Check size={16} /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Add to Cart
                </>
              )}
            </button>
          </div>
        ) : (
          <button className="btn-card-add" disabled type="button">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}
