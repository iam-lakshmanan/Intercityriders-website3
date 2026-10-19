import { randomUUID } from 'node:crypto';
import { tripSchema } from '@/lib/validation.mjs';
import { calculateFare, vehicles } from '@/lib/fare.mjs';
import { fingerprint } from '@/lib/security.mjs';
import { confirmedFare } from '@/lib/route-quote';
import { readRequest, errorResponse, HttpError, notify, once } from '@/lib/server';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await readRequest(request);
    if (body.website) throw new HttpError('Unable to submit this request.');
    const parsed = tripSchema.safeParse(body.form);
    if (!parsed.success)
      throw new HttpError(parsed.error.issues[0]?.message || 'Check your journey details.');
    const form = parsed.data;
    if (!['enquiry', 'booking-confirmed'].includes(body.event))
      throw new HttpError('Invalid request type.');
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId))
      throw new HttpError('Invalid submission reference.');

    let fare: ReturnType<typeof calculateFare> | undefined;
    if (body.event === 'booking-confirmed') {
      fare = confirmedFare(body.quoteToken, form, body.requestId);
    }

    const idempotencyKey = fingerprint({ form, event: body.event, id: body.requestId });
    const record = await once(idempotencyKey, async () => {
      const reference = `IR-${randomUUID().slice(0, 8).toUpperCase()}`;
      const requirements = [
        ['womanAlone', 'Woman travelling alone'],
        ['seniorCitizen', 'Senior citizen'],
        ['travellingWithInfant', 'Infant'],
        ['extraLuggage', 'Extra luggage'],
      ] as const;
      await notify(
        [
          body.event === 'booking-confirmed' ? 'BOOKING REQUEST RECEIVED' : 'NEW FARE ENQUIRY',
          reference,
          `${form.customerName} | ${form.mobile}`,
          form.email,
          `${form.pickup} → ${form.drop}`,
          `${form.pickupDate} at ${form.pickupTime} IST`,
          `${form.tripType} | ${vehicles.find((vehicle) => vehicle.id === form.vehicle)?.label}`,
          fare
            ? `Driving distance: ${fare.travelKm} km | Billable: ${fare.billableKm} km\nRate: ₹${fare.ratePerKm}/km | Driver allowance: ₹${fare.driverAllowance}\nEstimated fare: ₹${fare.total}\nTolls, permits, hill and carrier charges extra.`
            : 'Fare estimate is being reviewed by the customer.',
          `Requirements: ${
            requirements
              .filter(([key]) => form[key])
              .map(([, label]) => label)
              .join(', ') || 'None'
          }`,
        ]
          .filter(Boolean)
          .join('\n'),
      );
      return {
        reference,
        delivered: true as const,
        status: body.event === 'booking-confirmed' ? 'booking-received' : 'enquiry-received',
        liveEstimateAvailable: Boolean(
          process.env.GOOGLE_MAPS_SERVER_API_KEY &&
          process.env.QUOTE_SIGNING_SECRET &&
          process.env.QUOTE_SIGNING_SECRET.length >= 32,
        ),
      };
    });
    return Response.json(record);
  } catch (error) {
    return errorResponse(error);
  }
}
