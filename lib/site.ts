export const site = {
  name: 'Intercity Riders',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://intercityriders.example',
  phone: process.env.NEXT_PUBLIC_PHONE || '+919944942223',
  email: process.env.NEXT_PUBLIC_EMAIL || 'info@onewaytaxi.com',
  location: 'Tamil Nadu, India',
};
export const navigation = [
  ['HOME', '/'],
  ['ABOUT', '/about-us'],
  ['SERVICES', '/services'],
  ['TARIFF', '/tariff'],
  ['ROUTES', '/service-routes'],
  ['CONTACT US', '/contact-us'],
] as const;
export const journeys = [
  {
    from: 'Coimbatore',
    to: 'Ooty',
    note: 'Trade the everyday for a little mountain air.',
    tag: 'THE HILLS ARE CALLING',
    image: '/images/destination-2.webp',
  },
  {
    from: 'Chennai',
    to: 'Pondicherry',
    note: 'Slow mornings. Sea breezes. A change of pace.',
    tag: 'TAKE THE COAST ROAD',
    image: '/images/destination-4.webp',
  },
  {
    from: 'Madurai',
    to: 'Rameswaram',
    note: 'A meaningful journey, all the way to the shore.',
    tag: 'A LITTLE SOUL SEARCHING',
    image: '/images/rameswaram.webp',
  },
  {
    from: 'Coimbatore',
    to: 'Munnar',
    note: 'Make room for misty hills and green horizons.',
    tag: 'THE SCENIC WAY',
    image: '/images/hero.webp',
  },
  {
    from: 'Chennai',
    to: 'Bengaluru',
    note: 'From one city chapter to the next.',
    tag: 'CITY CONNECTIONS',
    image: '/images/destination-1.webp',
  },
  {
    from: 'Coimbatore',
    to: 'Chennai',
    note: 'A comfortable connection to the capital.',
    tag: 'GO THE DISTANCE',
    image: '/images/airport.webp',
  },
];
export const cities = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tiruppur',
  'Erode',
  'Thanjavur',
  'Vellore',
  'Bengaluru',
  'Pondicherry',
  'Ooty',
];
export function bookingLink(from?: string, to?: string, trip = 'oneway') {
  const search = new URLSearchParams({ trip });
  if (from) search.set('pickup', from);
  if (to) search.set('drop', to);
  return `/booking?${search}`;
}
export const footerCities = [
  { name: 'Chennai', pickup: 'Chennai, Tamil Nadu, India' },
  { name: 'Coimbatore', pickup: 'Coimbatore, Tamil Nadu, India' },
  { name: 'Bangalore', pickup: 'Bengaluru, Karnataka, India' },
  { name: 'Madurai', pickup: 'Madurai, Tamil Nadu, India' },
  { name: 'Trichy', pickup: 'Tiruchirappalli, Tamil Nadu, India' },
];
export const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/onewaytaxi' },
  { label: 'Twitter', href: 'https://twitter.com/onewaytaxi' },
  { label: 'Instagram', href: 'https://instagram.com/onewaytaxi' },
];
