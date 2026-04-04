import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'X-CAPITAL — Multi-Rail Capital Execution System',
  description: 'The interface where capital grows and gets deployed into the systems shaping the future of civilization.',
  keywords: ['investing', 'trading', 'private equity', 'tokenization', 'infrastructure', 'AI', 'space economy'],
  authors: [{ name: 'X-CAPITAL' }],
  openGraph: {
    title: 'X-CAPITAL',
    description: 'Public markets. Private equity. Real-world commerce. Infrastructure. One interface.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* DNS prefetch + preconnect for instant image/video loading */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://cdn.pixabay.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.pixabay.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload the hero video for instant playback */}
        <link
          rel="preload"
          as="video"
          href="https://cdn.pixabay.com/video/2022/06/03/119193-717336704_large.mp4"
        />
      </head>
      <body className="bg-xc-black text-xc-text antialiased min-h-screen">
        {/* ═══ FUTURISTIC SPLASH SCREEN ═══ */}
        <div id="xc-splash" className="xc-splash">
          <div className="xc-splash-content">
            {/* Animated grid lines */}
            <div className="xc-splash-grid" />
            {/* Particle field */}
            <div className="xc-splash-particles">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="xc-splash-dot" style={{
                  left: `${5 + (i * 4.7) % 90}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                }} />
              ))}
            </div>
            {/* Logo */}
            <div className="xc-splash-logo">
              <div className="xc-splash-icon">
                <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="xc-splash-title">CAPITAL</span>
            </div>
            {/* Loading bar */}
            <div className="xc-splash-bar-track">
              <div className="xc-splash-bar-fill" />
            </div>
            <div className="xc-splash-status">
              INITIALIZING SYSTEMS<span className="xc-splash-dots" />
            </div>
          </div>
        </div>
        {/* Inline script to dismiss splash after load — no React dependency */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var splash = document.getElementById('xc-splash');
                if (!splash) return;
                function dismiss() {
                  splash.classList.add('xc-splash-exit');
                  setTimeout(function() { splash.remove(); }, 600);
                }
                // Dismiss when page is interactive OR after 2.8s max
                if (document.readyState === 'complete') { setTimeout(dismiss, 400); }
                else { window.addEventListener('load', function() { setTimeout(dismiss, 400); }); }
                setTimeout(dismiss, 2800);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
