import type { Metadata } from 'next';
import { BookingWorkspace } from '@/components/booking-workspace';
import type { TripForm } from '@/lib/booking-store';
export const metadata: Metadata = {
  title: 'Book your next journey',
  alternates: { canonical: '/booking' },
};
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const str = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '');
  const trip = str('trip');
  const vehicle = str('vehicle');
  const initial: Partial<TripForm> = {};
  if (str('pickup')) initial.pickup = str('pickup').slice(0, 250);
  if (str('drop')) initial.drop = str('drop').slice(0, 250);
  if (['oneway', 'roundtrip', 'airport'].includes(trip))
    initial.tripType = trip as TripForm['tripType'];
  if (['sedan', 'prime_sedan', 'suv', 'prime_suv'].includes(vehicle))
    initial.vehicle = vehicle as TripForm['vehicle'];
  return (
    <section className="section booking-page-section">
      <h1 className="sr-only">Book your Intercity Riders journey</h1>
      <div className="container">
        <BookingWorkspace initial={initial} />
      </div>
    </section>
  );
}
