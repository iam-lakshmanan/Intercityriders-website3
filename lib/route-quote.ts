import 'server-only';
import { calculateFare } from './fare.mjs';
import { fingerprint, signQuote, verifyQuote } from './security.mjs';
import { HttpError } from './server';
import type { TripForm } from './booking-store';

function quoteCredentials() {
  return {
    key: process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    secret: process.env.QUOTE_SIGNING_SECRET || process.env.TELEGRAM_BOT_TOKEN,
  };
}

export function isLiveEstimateConfigured() {
  const { secret } = quoteCredentials();
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && secret && secret.length >= 32);
}

function signedQuote(
  form: TripForm,
  requestId: string,
  distanceKm: number,
  durationMins: number,
  secret: string,
) {
  const fare = calculateFare({
    vehicleId: form.vehicle,
    tripType: form.tripType,
    distanceKm,
    durationMins,
  });
  const expires = Date.now() + 15 * 60000;
  return {
    fare,
    token: signQuote(
      { formHash: fingerprint(form), requestId, distanceKm, durationMins, expires },
      secret,
    ),
    expires,
  };
}

export function createBrowserRouteQuote(
  form: TripForm,
  requestId: string,
  route: { distanceKm: number; durationMins: number },
) {
  const { secret } = quoteCredentials();
  const distanceKm = Number(route.distanceKm);
  const durationMins = Number(route.durationMins);
  if (!secret || secret.length < 32)
    throw new HttpError('Live estimates are temporarily unavailable.', 503);
  if (
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0 ||
    distanceKm > 5000 ||
    !Number.isFinite(durationMins) ||
    durationMins <= 0 ||
    durationMins > 10000
  )
    throw new HttpError('A valid Google Maps route is required for this estimate.');
  return signedQuote(form, requestId, distanceKm, durationMins, secret);
}

export async function createRouteQuote(form: TripForm, requestId: string) {
  const { key, secret } = quoteCredentials();
  if (!key || !secret || secret.length < 32)
    throw new HttpError(
      'Live estimates are temporarily unavailable. Our team can help with a manual quote.',
      503,
    );
  const query = new URLSearchParams({
    origin: form.pickup,
    destination: form.drop,
    mode: 'driving',
    region: 'in',
    key,
  });
  let response: Response;
  try {
    response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${query}`, {
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
  } catch {
    throw new HttpError(
      'We could not check this route. Please retry or ask our team for a quote.',
      502,
    );
  }
  const result = await response.json().catch(() => null);
  const leg = result?.routes?.[0]?.legs?.[0];
  if (!response.ok || result?.status !== 'OK' || !leg?.distance?.value || !leg?.duration?.value)
    throw new HttpError(
      'We could not find this driving route. Check the locations or ask our team for help.',
      422,
    );
  const distanceKm = Number(leg.distance.value) / 1000;
  const durationMins = Number(leg.duration.value) / 60;
  return signedQuote(form, requestId, distanceKm, durationMins, secret);
}
export function confirmedFare(token: unknown, form: TripForm, requestId: string) {
  try {
    const { secret } = quoteCredentials();
    const quote = verifyQuote(token, secret);
    if (quote.formHash !== fingerprint(form) || quote.requestId !== requestId)
      throw new Error('This estimate does not match your journey. Refresh your estimate.');
    return calculateFare({
      vehicleId: form.vehicle,
      tripType: form.tripType,
      distanceKm: quote.distanceKm,
      durationMins: quote.durationMins,
    });
  } catch (error) {
    throw new HttpError(
      error instanceof Error ? error.message : 'Refresh your estimate before confirming.',
      400,
    );
  }
}
