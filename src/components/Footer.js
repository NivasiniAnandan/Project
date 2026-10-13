'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck, Truck, Clock } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">

          {/* Column 1: Brand Info */}
          <div>
            <h3 className="footer-col-title" style={{ fontSize: '1.25rem' }}>
              Bommal Foods
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Premium manufacturers and distributors of pure wood-pressed edible oils, organic millets, high-quality spices, grains, and traditional health mixes. Serving retailers, restaurants, and households since 2020.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>

              {/* WhatsApp Chat + Call */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} className="text-muted" />

                {/* WhatsApp chat link */}
                <a
                  href="https://wa.me/919677112113?text=Hi%20Bommal%20Foods%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  +91 9677112113
                </a>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} className="text-muted" />
                <span>bommalfoods@gmail.com</span>
              </div>

              {/* Instagram */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaInstagram size={16} color="#E4405F" />

                <a
                  href="https://www.instagram.com/bommalfoods_erode"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  @bommalfoods_erode
                </a>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={14} className="text-muted" style={{ marginTop: '3px' }} />
                <span>
                  Kowsalya Traders, Vaikalmedu Perundurai to Erode main road, Erode 638052
                </span>
              </div>

            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="footer-col-title">Product Categories</h4>
            <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
              <li><Link href="/catalog?category=edible-oils">Pure Edible Oils</Link></li>
              <li><Link href="/catalog?category=rice-varieties">Premium Rice Varieties</Link></li>
              <li><Link href="/catalog?category=groundnuts">Raw & Roasted Groundnuts</Link></li>
              <li><Link href="/catalog?category=masala-items">Spices & Masala Powders</Link></li>
              <li><Link href="/catalog?category=health-mix-products">Nutritious Health Mixes</Link></li>
              <li><Link href="/catalog?category=millet-rice">Organic Millet Varieties</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="footer-col-title">Services</h4>
            <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
              <li><Link href="/contact">Apply for Distributor Account</Link></li>
              <li><Link href="/contact">Bulk Pricing Quotation</Link></li>
              <li><Link href="/contact">Submit Retailer Inquiries</Link></li>
              <li><Link href="/catalog">View Active Offers</Link></li>
              <li><Link href="/orders">Track Direct Truck Shipments</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="footer-col-title">Why Bommal Foods?</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ShieldCheck size={28} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>
                    100% Quality Assured
                  </strong>
                  FSSAI Certified processing using premium-grade natural food ingredients.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Truck size={28} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>
                    Direct Bulk Logistics
                  </strong>
                  Timely shipping through reliable freight systems and local trucks.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Clock size={28} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>
                    24/7 Portal
                  </strong>
                  Manage inventory orders, view invoice histories, and track status.
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Bommal Foods Private Limited. All Rights Reserved. FSSAI Lic No: 12421008000342.
          </p>
        </div>
      </div>
    </footer>
  );
}