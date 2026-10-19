# Intercity Riders — Go somewhere. Go well.

A new local Next.js 16 / React 19 website based on the booking functionality of `D:/Projects/Current Projects/Intercityriders3/`. The source project is unchanged. This project has a new visual system and page compositions throughout.

## Run

Use Node 22.15–24. Run `npm ci`, copy `.env.example` to `.env.local`, configure the services, then run `npm run dev`. Preview: http://localhost:3020.

For production, run `npm run build` and `npm start`. The start script prepares the standalone output and serves on port 3020, or the `PORT` environment value. Docker serves on port 3000. Public environment values are embedded during build, so rebuild when they change.

No original environment files or production secrets were copied. Without service credentials, the UI remains browsable and shows honest unavailable-service states; forms never report a successful delivery that did not happen.

## Visual system

- Vanilla Custard `#FFF9EB`: page background and light surfaces.
- Midnight Espresso `#200F07`: typography, primary actions and dark sections.
- Vivid Orange `#F77331`: accents, highlights, selected states and footer.
- Central tokens and responsive layouts: `app/globals.css`.
- A deeper orange text tint keeps cream-background headings readable while the supplied vivid orange remains the accent and surface color.
- Framer Motion: scroll reveals, route transitions, reading progress and fleet selection. Reduced-motion preferences are respected. Normal scrolling is preserved and content remains readable before animations run.
- New typography-based identity, editorial homepage, route journal, service rows, interactive fleet showcase, journey timeline, fare ledger, city index, contact layout and booking receipt.

Existing content routes and `/about-us`, `/contact-us`, `/service-routes` aliases are retained. Public business name, phone and email are centralized in `lib/site.ts`; the original phone/email are fallback contact values and must be verified for the intended brand. The fallback domain is deliberately an `.example` placeholder. Set `NEXT_PUBLIC_SITE_URL` before deployment.

## Booking services

Set these values in `.env.local` for development, or in the production server environment:

| Variable                                                         | Purpose                                                                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`                                | Browser Maps JavaScript, Places suggestions and route preview; restrict to your allowed website origins.                                    |
| `GOOGLE_MAPS_SERVER_API_KEY`                                     | Private server-side Directions lookup used to issue authoritative fare quotes. Enable Directions and apply appropriate server restrictions. |
| `QUOTE_SIGNING_SECRET`                                           | At least 32 random characters; private HMAC key for journey-bound quotes.                                                                   |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`                         | Server-only delivery to the real booking desk.                                                                                              |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_EMAIL` | Verified brand details and domain.                                                                                                          |
| `TRUSTED_IP_HEADER`                                              | Only set behind a proxy that overwrites this client-IP header.                                                                              |

Generate a signing key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never expose it through a `NEXT_PUBLIC_` variable.

Booking flow: enter journey → Telegram enquiry → server-issued fare estimate → signed confirmation request → Telegram booking request → minimal receipt → optional WhatsApp reference sharing. The booking team still confirms availability; delivery does not automatically allocate a vehicle.

One-way / airport rates: Sedan ₹15, Prime Sedan ₹15, SUV ₹20, Prime SUV ₹24 per km. Round-trip rates: ₹14, ₹14, ₹19, ₹22. Minimum billable distance: 130 km one-way / airport and 250 km round trip. Round-trip distance and driving duration are doubled. Fixed driver allowance: ₹400. Tolls, permits, parking, hill and carrier charges are extra where applicable. Extended and multi-day itineraries require manual confirmation. `lib/fare.mjs` remains the single pricing source.

## Deliberate functional corrections

- Confirmation no longer accepts arbitrary browser distances. The server fetches the route and signs a quote bound to the full form, request ID and a 15-minute expiry. This changes the internal estimate API contract: `/api/fare-estimation` accepts `{form, requestId}` and returns `{fare, token, expires}`; confirmation passes `quoteToken`.
- Initial enquiry retries retain the same ID while the submitted values remain unchanged.
- Airport transfer direction is explicit and swaps the endpoints consistently.
- Optional email and travel requirements are available in the form and shown in review.
- After confirmation, the personal draft is replaced with a minimal receipt containing the reference, vehicle/trip labels and fare. WhatsApp sharing sends that reference summary; it does not reintroduce personal details into the receipt record.
- Invalid duration values and non-object JSON requests are rejected.

## Checks

```
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
npm run test:e2e
```

Integration and browser checks require a fresh production build. Their runner starts and stops an isolated server with fake credentials and mocked Maps/Telegram upstreams. No production environment files are loaded by that server. Unit tests also mock notification delivery. Never preload `tests/mock-upstreams.cjs` in normal operation.

Browser checks use installed Chrome on Windows. On other platforms run `npx playwright install chromium` once. They cover page/alias rendering, the planner, interactive fleet, FAQs, airport direction, failed-delivery retry IDs, fare review, confirmation cleanup, receipt recovery, contact delivery, mobile navigation, overflow and reduced-motion screenshots. Screenshots are written to ignored `qa/`; Playwright failure artifacts are ignored as well.

## Production limits

Rate limits and deduplication records remain in process memory. Without trusted proxy configuration, the default rate bucket is shared across visitors. Restarts and multiple instances require shared storage for consistent limits and durable booking records. Delivery timeouts after upstream acceptance can still produce duplicates; Telegram is not a transactional booking database.

No dashboard, payments, accounts, driver allocation or fabricated reviews/statistics have been added. Offline booking is not supported. Existing photographic and vehicle assets were reused; confirm their usage rights before public launch. The privacy content describes this implementation and should be finalized with the business’s actual retention practices.

This project is local and has not been published or deployed.
