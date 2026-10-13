'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../components/Context';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ShoppingBag, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle, Percent } from 'lucide-react';

export default function Home() {
  const { cart } = useApp();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Direct From Manufacturers to Retailers",
      tagline: "B2C Portal",
      desc: "Order bulk quantities of cold pressed oils, organic millets, high-quality spices, and flours. Enjoy competitive distributor pricing and reliable delivery.",
      img: "https://dms.mydukaan.io/original/webp/media/9f1fe248-f8df-42d1-8c00-4646e1d8aeec.png",
      link: "/catalog"
    },
    {
      title: "Premium Cold Wood Pressed Oils",
      tagline: "100% Pure & Traditional",
      desc: "Sourced from high-grade seeds. Pure groundnut oil, coconut oil, and sesame oil pressed in traditional wooden chekku. Free from sulfur, chemical solvents, or argemone oil.",
      img: "https://www.holar.com.tw/wp-content/uploads/Holar-Blog-What-are-the-uses-for-different-edible-oils-when-cooking-Cover.jpg",
      link: "/catalog?category=edible-oils"
    },
    {
      title: "Nutritious Sprouted Health Mix",
      tagline: "Traditional Sathu Maavu",
      desc: "Made from 33 natural grains, millets, pulses, and dry fruits. Rich in protein, dietary fibers, and minerals. Perfect healthy drink mix for wholesale retail distribution.",
      img: "https://png.pngtree.com/thumb_back/fh260/background/20240522/pngtree-a-large-number-of-grains-image_15674956.jpg",
      link: "/catalog?category=health-mix-products"
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/products?type=catalog');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error loading homepage catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Slide rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const bestSellers = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Slider */}
      <section className="hero-slider">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className="hero-slide"
            style={{
              backgroundImage: `url(${slide.img})`,
              opacity: idx === currentSlide ? 1 : 0,
              zIndex: idx === currentSlide ? 2 : 1
            }}
          >
            <div className="hero-slide-overlay"></div>
            <div className="hero-content">
              <span className="hero-tagline">{slide.tagline}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-desc">{slide.desc}</p>
              <Link href={slide.link} className="btn-primary">
                Explore Catalog <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        
        <button onClick={handlePrevSlide} className="hero-nav-btn hero-prev">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNextSlide} className="hero-nav-btn hero-next">
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
             gap: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>100% Quality Assurance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FSSAI licensed, unadulterated & naturally processed food items.</p>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary-color)' }}>
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Flexible Bulk Ordering</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders sorted by packs (10kg boxes, 15L tins, 25kg / 50kg sacks).</p>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af' }}>
              <Percent size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Price Margin</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highly competitive prices directly corresponding to production costs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container">
        <h2 className="section-title">
          Browse Categories
          <Link href="/catalog" style={{ fontSize: '0.85rem', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <ChevronRight size={14} />
          </Link>
        </h2>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 11 }).map((_, idx) => (
              <div key={idx} className="category-card" style={{ animation: 'pulse 1.5s infinite' }}>
                <div className="category-icon-bg" style={{ backgroundColor: '#e2e8f0' }}></div>
                <div style={{ width: '60px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`} className="category-card">
                <div className="category-icon-bg">
                  <img src={cat.image} alt={cat.name} className="category-img" />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>



      {/* Featured Products / Bestsellers */}
      <section className="container">
        <h2 className="section-title">
          Best Sellers
          <Link href="/catalog" style={{ fontSize: '0.85rem', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Browse Catalog <ChevronRight size={14} />
          </Link>
        </h2>
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ height: '350px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '100%', height: '180px', backgroundColor: '#e2e8f0', borderRadius: '8px' }}></div>
                <div style={{ width: '40%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ width: '80%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ width: '50%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: 'auto' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="container">
        <h2 className="section-title">
          New Arrivals
          <Link href="/catalog" style={{ fontSize: '0.85rem', color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            See All Arrivals <ChevronRight size={14} />
          </Link>
        </h2>
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ height: '350px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '100%', height: '180px', backgroundColor: '#e2e8f0', borderRadius: '8px' }}></div>
                <div style={{ width: '40%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ width: '80%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}></div>
                <div style={{ width: '50%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: 'auto' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
