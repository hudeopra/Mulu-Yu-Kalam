import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Josefin_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#ff7b01',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://muluyukalam.com.np',
  ),
  title: {
    default: 'Mulu Yu Kalam | Ink Your Story | Premier Tattoo Studio Lalitpur',
    template: '%s | Mulu Yu Kalam Tattoo Studio',
  },
  description:
    "Mulu Yu Kalam is Lalitpur's premier custom tattoo studio in Harisiddhi, Nepal. Specializing in bespoke fine-line, realism, illustrative, and hygienic custom body art. Book your consultation today.",
  keywords: [
    'Mulu Yu Kalam',
    'Tattoo Studio Nepal',
    'Tattoo Artist Lalitpur',
    'Best Tattoo Kathmandu',
    'Harisiddhi Tattoo',
    'Custom Tattoo Designs',
    'Fine Line Tattoo Nepal',
    'Sterile Tattoo Shop Nepal',
    'Tattoo Booking Nepal',
    'Ink Your Story',
  ],
  authors: [{ name: 'Mulu Yu Kalam Studio' }],
  creator: 'Mulu Yu Kalam',
  publisher: 'Mulu Yu Kalam',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Mulu Yu Kalam | Ink Your Story',
    description:
      'Premier custom tattoo studio in Harisiddhi, Lalitpur, Nepal. Explore our portfolio and book your session online.',
    url: 'https://muluyukalam.com.np',
    siteName: 'Mulu Yu Kalam',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/img/banner-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Mulu Yu Kalam Tattoo Studio Showcase',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mulu Yu Kalam | Ink Your Story',
    description:
      'Premier custom tattoo studio in Harisiddhi, Lalitpur, Nepal. Explore curated masterpieces and book an appointment.',
    images: ['/assets/img/banner-bg.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/assets/img/Mulu-Yu-Kalam.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/assets/img/Mulu-Yu-Kalam.svg',
    apple: '/assets/img/Mulu-Yu-Kalam.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TattooParlor',
  name: 'Mulu Yu Kalam',
  alternateName: 'Mulu Yu Kalam Tattoo Studio',
  description:
    'Premier custom tattoo & body art studio located in Harisiddhi, Lalitpur, Nepal. Specializing in bespoke tattoo designs, fine line, illustrative, and sterile hygienic tattoo procedures.',
  url: 'https://muluyukalam.com.np',
  telephone: '+9779768404187',
  email: 'contact@muluyakalam.com.np',
  priceRange: '$$',
  image: 'https://muluyukalam.com.np/assets/img/banner-bg.jpg',
  logo: 'https://muluyukalam.com.np/assets/img/Mulu-Yu-Kalam.svg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Harisiddhi, LMC-29',
    addressLocality: 'Lalitpur',
    addressRegion: 'Bagmati',
    postalCode: '44700',
    addressCountry: 'NP',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 27.6441,
    longitude: 85.3406,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '19:00',
    },
  ],
  sameAs: [
    'https://instagram.com',
    'https://facebook.com',
    'https://tiktok.com',
    'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
  ],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={josefinSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased text-[#2e0249] selection:bg-[#ff7b01] selection:text-white bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
