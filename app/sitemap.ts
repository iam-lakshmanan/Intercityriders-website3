import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://onewaydroptaxis.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '',
    '/services',
    '/airport-transfers',
    '/service-routes',
    '/service-areas',
    '/tariff',
    '/booking',
    '/about-us',
    '/contact-us',
    '/privacy',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority: path ? 0.7 : 1,
  }));
}
