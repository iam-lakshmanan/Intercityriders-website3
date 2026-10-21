import assert from 'node:assert/strict';
const base = process.env.INTERCITY_TEST_URL || 'http://127.0.0.1:3011';
const form = {
  tripType: 'oneway',
  pickup: 'Coimbatore',
  drop: 'Chennai',
  pickupDate: '2099-01-10',
  pickupTime: '10:30',
  vehicle: 'sedan',
  customerName: 'Integration Test',
  mobile: '9876543210',
  email: '',
  womanAlone: false,
  seniorCitizen: false,
  travellingWithInfant: true,
  extraLuggage: true,
};
async function post(path, data, origin = base) {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify(data),
  });
  return { status: response.status, data: await response.json() };
}
const requestId = crypto.randomUUID();
const enquiry = await post('/api/enquiry', { form, requestId, event: 'enquiry', website: '' });
assert.equal(enquiry.status, 200, JSON.stringify(enquiry.data));
assert.equal(enquiry.data.delivered, true);
assert.equal(enquiry.data.liveEstimateAvailable, true);
assert.equal(
  (await post('/api/enquiry', { form, requestId, event: 'enquiry', website: '' })).data.reference,
  enquiry.data.reference,
);
console.log('PASS: enquiry delivery, live-estimate availability and stable retry reference');
const quote = await post('/api/fare-estimation', { form, requestId });
assert.equal(quote.status, 200, JSON.stringify(quote.data));
assert.equal(quote.data.fare.total, 3400);
assert.equal(typeof quote.data.token, 'string');
console.log('PASS: server-fetched route and signed ₹3400 estimate');
const untrusted = await post('/api/enquiry', {
  form,
  requestId,
  event: 'booking-confirmed',
  route: { distanceKm: 1, durationMins: 1 },
});
assert.equal(untrusted.status, 400);
assert.equal(
  (
    await post('/api/enquiry', {
      form,
      requestId,
      event: 'booking-confirmed',
      quoteToken: quote.data.token + 'x',
    })
  ).status,
  400,
);
assert.equal(
  (
    await post('/api/enquiry', {
      form: { ...form, drop: 'Madurai' },
      requestId,
      event: 'booking-confirmed',
      quoteToken: quote.data.token,
    })
  ).status,
  400,
);
assert.equal(
  (
    await post('/api/enquiry', {
      form,
      requestId: crypto.randomUUID(),
      event: 'booking-confirmed',
      quoteToken: quote.data.token,
    })
  ).status,
  400,
);
console.log('PASS: missing, tampered and mismatched quotes rejected');
const confirmation = {
  form,
  requestId,
  event: 'booking-confirmed',
  quoteToken: quote.data.token,
  route: { distanceKm: 1, durationMins: 1 },
};
const confirmed = await post('/api/enquiry', confirmation);
assert.equal(confirmed.status, 200, JSON.stringify(confirmed.data));
assert.equal(confirmed.data.delivered, true);
assert.equal((await post('/api/enquiry', confirmation)).data.reference, confirmed.data.reference);
console.log(
  'PASS: signed fare confirmation ignores altered browser metrics and deduplicates retries',
);
assert.equal(
  (
    await post('/api/contact', {
      name: 'Integration Test',
      mobile: '9876543210',
      email: '',
      message: 'Isolated contact form integration test.',
      requestId: crypto.randomUUID(),
      website: '',
    })
  ).status,
  200,
);
assert.equal(
  (
    await post('/api/contact', {
      name: 'Integration Test',
      mobile: 'bad',
      email: '',
      message: 'Invalid number test.',
      requestId: crypto.randomUUID(),
    })
  ).status,
  400,
);
assert.equal(
  (
    await post('/api/contact', {
      name: 'Integration Test',
      mobile: '9876543210',
      email: '',
      message: 'Honeypot test message.',
      requestId: crypto.randomUUID(),
      website: 'spam.example',
    })
  ).status,
  400,
);
assert.equal((await post('/api/contact', null)).status, 400);
assert.equal(
  (
    await post(
      '/api/contact',
      {
        name: 'Origin Alias Test',
        mobile: '9876543210',
        email: '',
        message: 'Canonical www origin alias validation test.',
        requestId: crypto.randomUUID(),
        website: '',
      },
      'https://www.onewaydroptaxis.com',
    )
  ).status,
  200,
);
assert.equal((await post('/api/contact', {}, 'https://untrusted.example')).status, 403);
console.log(
  'PASS: contact delivery, validation, honeypot, JSON shape, canonical aliases and origin controls',
);
console.log('All integration checks passed. All upstream notifications were mocked.');
