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
    "Mulu Yu Kalam is Lalitpur's (Yala) premier custom tattoo studio located in Harisiddhi (Jala), Nepal. Specializing in bespoke fine-line, realism, illustrative, and hygienic custom body art. Book your consultation today.",
  keywords: [
    'Mulu Yu Kalam',
    'Mulu Yu Kalam Tattoo Studio',

    // Town: Harisiddhi (Jala)
    'Harisiddhi Tattoo',
    'Harisiddhi Tattoo Studio',
    'Harisiddhi Tattoo House',
    'Tattoo in Harisiddhi',
    'Tattoo Shop Harisiddhi',
    'Tattoo Parlor Harisiddhi',
    'Harisiddhi Ink',
    'Jala Tattoo',
    'Jala Tattoo Studio',
    'Jala Tattoo House',
    'Tattoo in Jala',
    'Jala Harisiddhi Tattoo',

    // Town (Jala) in City (Yala) Combinations
    'Jala Yala Tattoo',
    'Jala Yalla Tattoo Studio',
    'Tattoo Studio Jala Yala',
    'Jala Yala Tattoo Studio',

    // City: Lalitpur (Yala)
    'Yala Tattoo',
    'Yala Tattoo Studio',
    'Yala Tattoo House',
    'Tattoo in Yala',
    'Yalla Tattoo Studio',
    'Tattoo Studio Yala',
    'Tattoo Studio Yala Lalitpur',
    'Tattoo Studio Lalitpur',
    'Tattoo Artist Lalitpur',
    'Tattoo Shop Lalitpur',

    // "Near Me" Searches & Common Misspellings
    'Tattoo Studio Near Me',
    'Tattoo Shop Near Me',
    'Tattoo Parlor Near Me',
    'Tattoo Artist Near Me',
    'Best Tattoo Near Me',
    'Tattoo Studeo Near Me',

    // Valley & National Searches
    'Tattoo Studio Nepal',
    'Best Tattoo Kathmandu',
    'Custom Tattoo Designs',
    'Fine Line Tattoo Nepal',
    'Realism Tattoo Nepal',
    'Mandala Tattoo Kathmandu',
    'Sterile Tattoo Shop Nepal',
    'Tattoo Booking Nepal',
    'Tattoo Coverup Nepal',
    'Tattoo Coverup Lalitpur',
    'Tattoo Completion',
    'Free Tattoo Consultation',
    'Walk In Tattoo Studio',
    'Open Studio Visit',
    'Ink Your Story',
    'Tattoo Price Nepal',
    'Piercing Studio Lalitpur',
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
  other: {
    'geo.region': 'NP-BA',
    'geo.placename': 'Harisiddhi, Lalitpur',
    'geo.position': '27.6441;85.3406',
    ICBM: '27.6441, 85.3406',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'TattooParlor',
    '@id': 'https://muluyukalam.com.np/#studio',
    name: 'Mulu Yu Kalam',
    alternateName: [
      'Mulu Yu Kalam Tattoo Studio',
      'Mulu Yu Kalam Harisiddhi',
      'Mulu Yu Kalam Body Art',
      'Harisiddhi Tattoo Studio',
      'Harisiddhi Tattoo House',
      'Jala Tattoo Studio',
      'Jala Tattoo House',
      'Yala Tattoo Studio',
      'Yala Tattoo House',
    ],
    description:
      "Premier custom tattoo & body art studio located in Harisiddhi (Jala), Lalitpur (Yala), Nepal. Specializing in bespoke tattoo designs, fine line, realism, illustrative, and sterile hygienic tattoo procedures. Serving clients across Lalitpur, Kathmandu, and Bhaktapur.",
    url: 'https://muluyukalam.com.np',
    telephone: '+9779861341995',
    email: 'contact@muluyakalam.com.np',
    priceRange: '$$',
    currenciesAccepted: 'NPR',
    paymentAccepted: 'Cash, Fonepay, Mobile Banking',
    image: 'https://muluyukalam.com.np/assets/img/banner-bg.jpg',
    logo: 'https://muluyukalam.com.np/assets/img/Mulu-Yu-Kalam.svg',
    hasMap: 'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Harisiddhi (Jala), LMC-29',
      addressLocality: 'Lalitpur (Yala)',
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
    areaServed: [
      {
        '@type': 'City',
        name: 'Lalitpur (Yala)',
      },
      {
        '@type': 'City',
        name: 'Kathmandu',
      },
      {
        '@type': 'City',
        name: 'Bhaktapur',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Harisiddhi (Jala)',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tattoo Art & Piercing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Tattoo Design & Consultation',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Fine Line Tattoo',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Micro & Portrait Realism Tattoo',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Illustrative & Neo-Traditional Tattoo',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mandala & Sacred Geometry Tattoo',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Black & Grey Body Art',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tattoo Coverup & Restoration',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tattoo Completion & Finishing',
          },
        },
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NPR',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Consultation & Design Discussion',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Open Studio Visit & Walk-In Inquiry',
          },
        },
      ],
    },
    sameAs: [
      'https://www.instagram.com/mulu_yu_kalam/',
      'https://www.facebook.com/MuluYuKalam',
      'https://www.tiktok.com/@mulu_yu_kalam',
      'https://maps.app.goo.gl/HW5GvBYDiaNLx4rK6',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Where is Mulu Yu Kalam located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mulu Yu Kalam is located in Harisiddhi, LMC-29, Lalitpur, Nepal, easily accessible for clients throughout Lalitpur, Kathmandu, and Bhaktapur.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an appointment for a tattoo session?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Appointments are strongly recommended for custom designs and dedicated artist consultations. You can book directly through our online appointment form.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I bring my own tattoo references and custom ideas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We encourage clients to bring reference photos, sketches, or ideas. Our artists collaborate closely with you to craft a 100% bespoke tattoo design.',
        },
      },
      {
        '@type': 'Question',
        name: 'What hygiene and sterilization protocols are followed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We adhere to hospital-grade sterilization standards: 100% single-use disposable needle cartridges, medical autoclave equipment, and certified high-grade skin-safe inks.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does a tattoo cost at Mulu Yu Kalam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tattoo pricing depends on design complexity, placement, sizing, and detail. We provide transparent quotes during your initial consultation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you provide tattoo aftercare guidance?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, every client receives detailed aftercare instructions and recommended healing care to ensure your tattoo heals cleanly and vibrantly.',
        },
      },
    ],
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={josefinSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
        />
      </head>
      <body className="font-sans antialiased text-[#2e0249] selection:bg-[#ff7b01] selection:text-white bg-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
