import './globals.css';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Leaf } from 'lucide-react';

export const metadata = {
  title: 'GreenLeaf Nursery — Plants, Pots & Garden Essentials',
  description: 'Shop healthy indoor plants, outdoor greenery, pots, soil and garden tools. Fast delivery across India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <footer>
          <div className="footer-top">
            <div className="container">
              <div className="footer-grid">
                {/* Brand column */}
                <div className="footer-brand">
                  <div className="logo">
                    <Leaf size={20} strokeWidth={2.5} />
                    GreenLeaf
                  </div>
                  <p>
                    India's trusted online plant nursery. We deliver healthy, well-rooted plants
                    to your doorstep with care. Grow beautiful spaces, effortlessly.
                  </p>
                </div>

                {/* Company */}
                <div className="footer-col">
                  <h4>Company</h4>
                  <ul>
                    <li><Link href="/">About Us</Link></li>
                    <li><Link href="/">Our Story</Link></li>
                    <li><Link href="/">Blog</Link></li>
                    <li><Link href="/">Careers</Link></li>
                  </ul>
                </div>

                {/* Help */}
                <div className="footer-col">
                  <h4>Get Help</h4>
                  <ul>
                    <li><Link href="/account">My Account</Link></li>
                    <li><Link href="/">Track Order</Link></li>
                    <li><Link href="/">Returns & Refunds</Link></li>
                    <li><Link href="/">Shipping Policy</Link></li>
                    <li><Link href="/">Contact Us</Link></li>
                  </ul>
                </div>

                {/* Shop */}
                <div className="footer-col">
                  <h4>Shop</h4>
                  <ul>
                    <li><Link href="/shop?category=indoor-plants">Indoor Plants</Link></li>
                    <li><Link href="/shop?category=outdoor-plants">Outdoor Plants</Link></li>
                    <li><Link href="/shop?category=pots-planters">Pots & Planters</Link></li>
                    <li><Link href="/shop?category=soil-fertilizer">Soil & Fertilizer</Link></li>
                    <li><Link href="/shop?category=tools">Tools</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} GreenLeaf Nursery. All rights reserved.</span>
              <span>Made with 🌿 for plant lovers</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
