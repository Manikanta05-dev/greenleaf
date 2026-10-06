import './globals.css';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ClerkProvider } from '@clerk/nextjs';
import { Leaf, InstagramLogo, YoutubeLogo, FacebookLogo } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'GreenLeaf Nursery — Plants, Pots & Garden Essentials',
  description: 'Shop healthy indoor plants, outdoor greenery, pots, soil and garden tools. Fast delivery across India.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body>
          <Header />
          {children}

          {/* ── Footer ── */}
          <footer>
            <div className="footer-top">
              <div className="container">
                <div className="footer-grid">

                  {/* Brand column */}
                  <div className="footer-brand">
                    <div className="logo">
                      <Leaf size={20} weight="fill" />
                      GreenLeaf
                    </div>
                    <p>
                      India's trusted online plant nursery. We deliver healthy,
                      well-rooted plants to your doorstep with care. Grow beautiful
                      spaces, effortlessly.
                    </p>
                    <div className="footer-social">
                      <a href="https://instagram.com" target="_blank" rel="noreferrer"
                         className="footer-social-btn" aria-label="Instagram">
                        <InstagramLogo size={16} weight="bold" />
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noreferrer"
                         className="footer-social-btn" aria-label="YouTube">
                        <YoutubeLogo size={16} weight="bold" />
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noreferrer"
                         className="footer-social-btn" aria-label="Facebook">
                        <FacebookLogo size={16} weight="bold" />
                      </a>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="footer-col">
                    <h4>Company</h4>
                    <ul>
                      <li><Link href="/">About Us</Link></li>
                      <li><Link href="/">Our Story</Link></li>
                      <li><Link href="/">Blog</Link></li>
                      <li><Link href="/">Sustainability</Link></li>
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
                      <li><Link href="/">Plant Care Guide</Link></li>
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
                      <li><Link href="/shop?category=tools">Garden Tools</Link></li>
                      <li><Link href="/shop">View All</Link></li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>

            <div className="container">
              <div className="footer-bottom">
                <span>© {new Date().getFullYear()} GreenLeaf Nursery. All rights reserved.</span>
                <div className="footer-bottom-links">
                  <Link href="/">Privacy Policy</Link>
                  <Link href="/">Terms of Service</Link>
                  <Link href="/">Sitemap</Link>
                </div>
                <span style={{ color: 'rgba(255,255,255,.25)' }}>Made with 🌿 in India</span>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
