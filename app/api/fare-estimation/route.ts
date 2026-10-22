import { tripSchema } from '@/lib/validation.mjs';
import { createBrowserRouteQuote, createRouteQuote } from '@/lib/route-quote';
import { readRequest, errorResponse, HttpError } from '@/lib/server';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await readRequest(request);
    const parsed = tripSchema.safeParse(body.form);
    if (!parsed.success)
      throw new HttpError(parsed.error.issues[0]?.message || 'Check your journey details.');
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId))
      throw new HttpError('Invalid submission reference.');
    const quote = body.route
      ? createBrowserRouteQuote(parsed.data, body.requestId, body.route)
      : await createRouteQuote(parsed.data, body.requestId);
    return Response.json(quote, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
