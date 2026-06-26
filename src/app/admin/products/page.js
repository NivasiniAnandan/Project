'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { Plus, Edit2, Trash2, Check, X, Loader2, Save } from 'lucide-react';

export default function AdminProducts() {
  const { token } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Custom specifications (simple text box parsing or key-value object)
  const [specGrade, setSpecGrade] = useState('');
  const [specShelfLife, setSpecShelfLife] = useState('');
  const [specPackaging, setSpecPackaging] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch catalog products & categories
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?type=catalog');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load products in admin CRUD', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setUnit('');
    setStock('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setImageUrl('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80');
    
    // specs
    setSpecGrade('Grade A');
    setSpecShelfLife('12 Months');
    setSpecPackaging('Standard Pack');

    setErrorMsg('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setUnit(product.unit);
    setStock(product.stock);
    setCategoryId(product.categoryId);
    setImageUrl(product.images[0] || '');
    
    // specs
    setSpecGrade(product.specs?.Grade || product.specs?.['Extraction Method'] || 'Grade A');
    setSpecShelfLife(product.specs?.['Shelf Life'] || '12 Months');
    setSpecPackaging(product.specs?.Packaging || 'Pack');

    setErrorMsg('');
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !unit || !stock || !categoryId || !imageUrl) {
      setErrorMsg('Please fill in all required product fields.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const productPayload = {
      name,
      description,
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      categoryId,
      images: [imageUrl],
      specs: {
        'Grade': specGrade,
        'Shelf Life': specShelfLife,
        'Packaging': specPackaging
      },
      benefits: ['Premium quality ingredients', 'FSSAI certified processing', 'Direct source pricing'],
      usage: ['Perfect for wholesale commercial setups', 'Store in dry storage places']
    };

    try {
      let url = '/api/products';
      let method = 'POST';

      if (editingProduct) {
        productPayload.id = editingProduct.id;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Saving product failed');
      }

      setIsEditorOpen(false);
      loadProducts();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Delete product failed.');
      }

      loadProducts();
    } catch (err) {
      alert(err.message || 'Could not delete product.');
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Wholesale Products</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Add, update pricing, edit catalog details, and replenish inventory levels.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary-color)' }} />
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Refreshing products list...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Wholesale Price</th>
                <th>Unit</th>
                <th>Inventory Stock</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.categoryId.replace('-', ' ')}</td>
                  <td>₹{p.price.toLocaleString('en-IN')}</td>
                  <td>{p.unit}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: p.stock === 0 ? 'var(--color-danger)' : p.stock <= 10 ? 'var(--color-warning)' : 'var(--color-success)'
                    }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div className="btn-actions" style={{ justifyContent: 'center' }}>
                      <button onClick={() => handleOpenEdit(p)} className="btn-sm btn-edit" title="Edit Product">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="btn-sm btn-delete" title="Delete Product">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal Popup Overlay */}
      {isEditorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-color)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                {editingProduct ? `Edit Details: ${editingProduct.name}` : 'Add New Wholesale Product'}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} style={{ padding: '1.5rem' }}>
              {errorMsg && (
                <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Cold Pressed Sesame Oil"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed description of ingredients, benefits, packaging style..."
                  className="form-control"
                  style={{ resize: 'none' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Wholesale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Price per unit"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Wholesale Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15L Tin, 25kg Bag"
                    className="form-control"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock Level *</label>
                  <input
                    type="number"
                    required
                    placeholder="Available Units"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Category *</label>
                  <select
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Product Image URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com..."
                    className="form-control"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Specifications Box */}
              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Specifications details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Grade / Extraction</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                      value={specGrade}
                      onChange={(e) => setSpecGrade(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Shelf Life</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                      value={specShelfLife}
                      onChange={(e) => setSpecShelfLife(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Packaging Style</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                      value={specPackaging}
                      onChange={(e) => setSpecPackaging(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ backgroundColor: '#e2e8f0', color: 'var(--text-main)', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
