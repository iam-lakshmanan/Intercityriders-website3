import type { Metadata, Viewport } from 'next';
import { Header, Footer } from '@/components/shell';
import { MotionProvider } from '@/components/motion';
import { site } from '@/lib/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Intercity Riders — Go somewhere. Go well.',
    template: '%s · Intercity Riders',
  },
  description:
    'One-way, round-trip and airport taxi journeys across Tamil Nadu. Thoughtfully arranged. Clearly priced. Made for you.',
  applicationName: site.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: site.name,
    images: [
      {
        url: '/images/hero.webp',
        width: 1600,
        height: 900,
        alt: 'A scenic road journey through the hills',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.svg', apple: '/icons/icon-192.png' },
};
export const viewport: Viewport = { themeColor: '#FFF9EB', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <MotionProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
