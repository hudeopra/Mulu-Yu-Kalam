import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://muluyukalam.com.np';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/login', '/login/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
