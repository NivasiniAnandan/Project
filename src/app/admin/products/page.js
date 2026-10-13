'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/Context';
import { Plus, Edit2, Trash2, Check, X, Loader2, Save } from 'lucide-react';
import { getCategoryPackSizes, normalizeProduct } from '@/lib/productVariants';

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
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productVariants, setProductVariants] = useState([]);
  const [customPackSize, setCustomPackSize] = useState('');
  
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProducts();
  // loadProducts is defined above and stable — intentionally omitted from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setProductVariants([]);
    setCustomPackSize('');
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
    const normalizedProduct = normalizeProduct(product);
    setCategoryId(product.categoryId);
    setProductVariants(normalizedProduct.variants.map((variant) => ({
      ...variant,
      price: String(variant.price),
      stock: String(variant.stock),
      wholesalePrice: variant.wholesalePrice == null ? '' : String(variant.wholesalePrice),
      wholesaleMinimumQuantity: String(variant.wholesaleMinimumQuantity || 1)
    })));
    setCustomPackSize('');
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
    if (!name || !categoryId || !imageUrl || productVariants.length === 0) {
      setErrorMsg('Enter the product details and select at least one pack size.');
      return;
    }
    if (productVariants.some((variant) => variant.price === '' || variant.stock === '' || (variant.wholesalePrice !== '' && Number(variant.wholesalePrice) < 0))) {
      setErrorMsg('Enter a retail price and stock quantity for every selected pack size.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const productPayload = {
      name,
      description,
      price: Number(productVariants[0].price),
      unit: productVariants[0].packSize,
      packSize: productVariants[0].packSize,
      stock: Number(productVariants[0].stock),
      variants: productVariants.map((variant) => ({
        packSize: variant.packSize,
        price: Number(variant.price),
        stock: Number(variant.stock),
        wholesalePrice: variant.wholesalePrice === '' ? null : Number(variant.wholesalePrice),
        wholesaleMinimumQuantity: Number(variant.wholesaleMinimumQuantity) || 1
      })),
      categoryId,
      images: [imageUrl],
      specs: {
        'Grade': specGrade,
        'Shelf Life': specShelfLife,
        'Packaging': specPackaging
      },
      benefits: ['Premium quality ingredients', 'FSSAI certified processing', 'Direct source pricing'],
      usage: ['Perfect for commercial setups', 'Store in dry storage places']
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

  const categoryName = categories.find((category) => category.id === categoryId)?.name || '';
  const packSizeOptions = [...new Set([
    ...getCategoryPackSizes(categoryId, categoryName),
    ...productVariants.map((variant) => variant.packSize)
  ])];

  const togglePackSize = (packSize, checked) => {
    setProductVariants((current) => checked
      ? [...current, { packSize, price: '', stock: '', wholesalePrice: '', wholesaleMinimumQuantity: '1' }]
      : current.filter((variant) => variant.packSize !== packSize));
  };

  const addCustomPackSize = () => {
    const packSize = customPackSize.trim();
    if (!packSize || packSizeOptions.some((option) => option.toLowerCase() === packSize.toLowerCase())) return;
    setProductVariants((current) => [...current, { packSize, price: '', stock: '', wholesalePrice: '', wholesaleMinimumQuantity: '1' }]);
    setCustomPackSize('');
  };

  const updateVariant = (packSize, field, value) => {
    setProductVariants((current) => current.map((variant) => variant.packSize === packSize
      ? { ...variant, [field]: value }
      : variant));
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
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Manage Products</h1>
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
                <th>Price</th>
                <th>Pack Sizes</th>
                <th>Manufacture Date</th>
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
                  <td>₹{Math.min(...normalizeProduct(p).variants.map((variant) => variant.price)).toLocaleString('en-IN')}+</td>
                  <td>{normalizeProduct(p).variants.map((variant) => variant.packSize).join(', ')}</td>
                  <td>{p.manufactureDate || 'N/A'}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: p.stock === 0 ? 'var(--color-danger)' : p.stock <= 10 ? 'var(--color-warning)' : 'var(--color-success)'
                    }}>
                      {normalizeProduct(p).variants.reduce((sum, variant) => sum + variant.stock, 0)} units
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
                {editingProduct ? `Edit Details: ${editingProduct.name}` : 'Add New Product'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Category *</label>
                  <select
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setProductVariants([]);
                    }}
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

              <section style={{ margin: '1rem 0 1.5rem', padding: '1rem', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Pack Sizes and Variant Pricing</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem 1rem', marginBottom: '1rem' }}>
                  {packSizeOptions.map((packSize) => (
                    <label key={packSize} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={productVariants.some((variant) => variant.packSize === packSize)}
                        onChange={(event) => togglePackSize(packSize, event.target.checked)}
                      />
                      {packSize}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={customPackSize}
                    onChange={(event) => setCustomPackSize(event.target.value)}
                    placeholder="Custom pack size"
                    className="form-control"
                  />
                  <button type="button" className="btn-sm btn-edit" onClick={addCustomPackSize}>Add size</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {productVariants.map((variant) => (
                    <div key={variant.packSize} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) repeat(4, minmax(100px, 1fr))', gap: '0.6rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{variant.packSize}</strong>
                      <input aria-label={`${variant.packSize} retail price`} type="number" min="0" step="0.01" required placeholder="Retail price" className="form-control" value={variant.price} onChange={(event) => updateVariant(variant.packSize, 'price', event.target.value)} />
                      <input aria-label={`${variant.packSize} wholesale price`} type="number" min="0" step="0.01" placeholder="Wholesale price" className="form-control" value={variant.wholesalePrice} onChange={(event) => updateVariant(variant.packSize, 'wholesalePrice', event.target.value)} />
                      <input aria-label={`${variant.packSize} stock`} type="number" min="0" step="1" required placeholder="Stock" className="form-control" value={variant.stock} onChange={(event) => updateVariant(variant.packSize, 'stock', event.target.value)} />
                      <input aria-label={`${variant.packSize} wholesale minimum quantity`} type="number" min="1" step="1" placeholder="Wholesale MOQ" className="form-control" value={variant.wholesaleMinimumQuantity || '1'} onChange={(event) => updateVariant(variant.packSize, 'wholesaleMinimumQuantity', event.target.value)} />
                    </div>
                  ))}
                </div>
              </section>

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
