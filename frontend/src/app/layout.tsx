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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-xc-black text-xc-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
