import type { Metadata } from 'next';
import { BookingConfirmation } from '@/components/estimate';

export const metadata: Metadata = {
  title: 'Booking confirmation',
  robots: { index: false, follow: false },
};

export default function BookingConfirmationPage() {
  return <BookingConfirmation />;
}
