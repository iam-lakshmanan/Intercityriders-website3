import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Intercity Riders',
    short_name: 'Intercity',
    description: 'Go somewhere. Go well.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF9EB',
    theme_color: '#200F07',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
