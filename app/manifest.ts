import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Intercity Riders — One Way Taxi',
    short_name: 'Intercity Riders',
    description: 'Book one-way, round-trip and airport taxi journeys across Tamil Nadu.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FFF9EB',
    theme_color: '#200F07',
    categories: ['travel', 'navigation'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Book a ride',
        short_name: 'Book',
        description: 'Start a new Intercity Riders booking',
        url: '/#start-journey',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Explore routes',
        short_name: 'Routes',
        description: 'Browse popular intercity routes',
        url: '/service-routes',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
