'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Route, RefreshCw } from 'lucide-react';
import { useSavedBooking, saveReceipt, type SavedBooking, type Receipt } from '@/lib/booking-store';
import { vehicles } from '@/lib/fare.mjs';
import { site } from '@/lib/site';
import { BookingMapPreview } from './booking-map-preview';
type Fare = {
  travelKm: number;
  minimumKm: number;
  billableKm: number;
  ratePerKm: number;
  baseFare: number;
  driverAllowance: number;
  total: number;
  durationMins: number;
};
type Quote = { fare: Fare; token: string; expires: number };
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
function ReceiptView({ receipt }: { receipt: Receipt }) {
  const message = `INTERCITY RIDERS\nBooking request: ${receipt.reference}\n${receipt.tripLabel} | ${receipt.vehicleLabel}\nEstimated fare: ${money(receipt.total)}\nPlease help me finalize the journey details.`;
  return (
    <section className="section">
      <div className="container receipt">
        <div className="receipt-icon">
          <CheckCircle2 size={34} />
        </div>
        <span className="eyebrow">A GOOD JOURNEY STARTS HERE</span>
        <h1>
          Your request.
          <br />
          <em>Safely received.</em>
        </h1>
        <p>
          The booking team will get in touch to confirm availability and the final details. A
          vehicle is reserved after their confirmation.
        </p>
        <div className="reference">
          YOUR BOOKING REFERENCE<strong>{receipt.reference}</strong>
        </div>
        <p>
          {receipt.vehicleLabel} · {receipt.tripLabel} · {money(receipt.total)}
        </p>
        <a
          href={`https://wa.me/${site.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`}
          className="button"
          target="_blank"
          rel="noreferrer"
        >
          Share reference on WhatsApp <ArrowUpRight size={18} />
        </a>
        <div>
          <Link href="/booking" className="text-link" style={{ marginTop: 25 }}>
            Plan another journey <ArrowUpRight size={16} />
          </Link>
        </div>
        <p className="fine-print" style={{ marginTop: 20 }}>
          Your personal draft has been cleared from this browser’s booking record.
        </p>
      </div>
    </section>
  );
}
export function Estimate() {
  const saved = useSavedBooking();
  if (saved?.receipt) return <ReceiptView receipt={saved.receipt} />;
  if (!saved?.form)
    return (
      <section className="section">
        <div className="container receipt">
          <Route size={44} />
          <h1>
            A journey
            <br />
            <em>waiting to happen.</em>
          </h1>
          <p>Start with a route and a few details. Your estimate will be waiting here.</p>
          <Link href="/booking" className="button">
            Let’s make a plan <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    );
  return <EstimateJourney key={saved.requestId} saved={saved} />;
}
function EstimateJourney({ saved }: { saved: SavedBooking }) {
  const form = saved.form!;
  const liveEstimateUnavailable = saved.liveEstimateAvailable === false;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState(
    liveEstimateUnavailable ? 'Your fare will be confirmed directly by the booking team.' : '',
  );
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(!liveEstimateUnavailable);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const locked = useRef(false);
  const label = vehicles.find((v) => v.id === form.vehicle)?.label || form.vehicle;
  const trip =
    form.tripType === 'roundtrip'
      ? 'Round trip'
      : form.tripType === 'airport'
        ? 'Airport pickup'
        : 'One way';
  const manualMessage = `INTERCITY RIDERS\nEnquiry reference: ${saved.enquiryReference || 'Pending'}\n${trip} | ${label}\n${form.pickup} to ${form.drop}\nPickup: ${form.pickupDate} at ${form.pickupTime} IST\nPlease help me confirm the fare and vehicle availability.`;
  useEffect(() => {
    if (liveEstimateUnavailable) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/fare-estimation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form, requestId: saved.requestId }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to prepare your estimate.');
        if (active) setQuote(result);
      } catch (error) {
        if (active)
          setError(error instanceof Error ? error.message : 'Please retry your estimate.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [form, saved.requestId, attempt, liveEstimateUnavailable]);
  async function confirm() {
    if (!quote || locked.current) return;
    locked.current = true;
    setBusy(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form,
          requestId: saved.requestId,
          event: 'booking-confirmed',
          quoteToken: quote.token,
          website: '',
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.delivered)
        throw new Error(result.error || 'Your request could not be confirmed.');
      saveReceipt(
        {
          reference: result.reference,
          total: quote.fare.total,
          vehicleLabel: label,
          tripLabel: trip,
        },
        saved.requestId,
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const details = quote
    ? [
        ['Driving distance', `${quote.fare.travelKm} km`],
        ['Billable distance', `${quote.fare.billableKm} km`],
        ['Your ride', label],
        [
          'Time on the road',
          `${Math.floor(quote.fare.durationMins / 60)}h ${quote.fare.durationMins % 60}m`,
        ],
        ['Rate per kilometre', money(quote.fare.ratePerKm)],
        ['Base fare', money(quote.fare.baseFare)],
        ['Driver allowance', money(quote.fare.driverAllowance)],
        ['Pickup · IST', `${form.pickupDate} · ${form.pickupTime}`],
      ]
    : [];
  const requirements = [
    form.womanAlone ? 'Woman travelling alone' : '',
    form.seniorCitizen ? 'Senior traveller' : '',
    form.travellingWithInfant ? 'Travelling with an infant' : '',
    form.extraLuggage ? 'Extra luggage' : '',
  ].filter(Boolean);
  return (
    <section className="section">
      <div className="container">
        <h1 className="estimate-page-title">
          Your journey. <em>Made clear.</em>
        </h1>
        <div className="estimate-topbar">
          <Link href="/booking" className="text-link">
            <ArrowLeft size={15} />
            Edit your plan
          </Link>
          <span>{trip}</span>
        </div>
        <div className="estimate-grid">
          <article className="fare-panel">
            <span className="eyebrow" style={{ marginBottom: 20 }}>
              YOUR JOURNEY, AT A GLANCE
            </span>
            <div className="estimate-route-title">
              <span>{form.pickup}</span>
              <Route size={20} />
              <span>{form.drop}</span>
            </div>
            {loading ? (
              <div className="quote-loading" role="status">
                <span className="spinner" />
                <p>
                  A little route checking.
                  <br />A clearer picture of your fare.
                </p>
              </div>
            ) : quote ? (
              <>
                <div className="estimate-fare-box">
                  <strong>{money(quote.fare.total)}</strong>
                  <span>Your estimated fare</span>
                </div>
                <div className="estimate-detail-grid">
                  {details.map(([label, value]) => (
                    <div className="estimate-detail-item" key={label}>
                      <div>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                {requirements.length > 0 && (
                  <div className="requirements-summary">
                    <strong>A little extra care</strong>
                    <p>{requirements.join(' · ')}</p>
                  </div>
                )}
                <p className="fine-print estimate-note">
                  Minimum {quote.fare.minimumKm} billable km.{' '}
                  {form.tripType === 'roundtrip' ? 'Includes the return distance. ' : ''}Tolls,
                  permits, parking, hill and carrier charges are extra. Quote valid for 15 minutes.
                </p>
                <div className="estimate-actions">
                  <button
                    className="text-link"
                    style={{
                      background: 'transparent',
                      borderTop: 0,
                      borderLeft: 0,
                      borderRight: 0,
                    }}
                    onClick={() => {
                      setQuote(null);
                      setError('');
                      setLoading(true);
                      setAttempt((v) => v + 1);
                    }}
                    disabled={busy}
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                  <button className="button" onClick={confirm} disabled={busy}>
                    {busy ? 'Sending your request…' : 'Confirm my request'}
                    <ArrowUpRight size={18} />
                  </button>
                </div>
                <p className="privacy-note">
                  Your request goes to our team through Telegram. They will confirm vehicle
                  availability and final arrangements.
                </p>
              </>
            ) : (
              <div className="manual-enquiry">
                <h3>Your journey request is received.</h3>
                {saved.enquiryReference && (
                  <div className="reference">
                    YOUR ENQUIRY REFERENCE<strong>{saved.enquiryReference}</strong>
                  </div>
                )}
                <p>
                  The booking team has your journey details and will contact you with the fare and
                  vehicle availability.
                </p>
                <p className="fine-print" role="status">
                  {error}
                </p>
                <div className="estimate-actions">
                  <a className="button" href={`tel:${site.phone}`}>
                    Call the booking team <ArrowUpRight size={17} />
                  </a>
                  <a
                    className="button button-outline"
                    href={`https://wa.me/${site.phone.replace(/\D/g, '')}?text=${encodeURIComponent(manualMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Continue on WhatsApp <ArrowUpRight size={17} />
                  </a>
                </div>
                <div>
                  <button
                    type="button"
                    className="text-link"
                    style={{
                      marginTop: 20,
                      background: 'transparent',
                      borderTop: 0,
                      borderLeft: 0,
                      borderRight: 0,
                    }}
                    onClick={() => {
                      setError('');
                      setLoading(true);
                      setAttempt((v) => v + 1);
                    }}
                  >
                    <RefreshCw size={14} />
                    Retry live estimate
                  </button>
                </div>
              </div>
            )}
            {submitError && (
              <p className="error-message" role="alert">
                {submitError}
              </p>
            )}
          </article>
          <BookingMapPreview pickup={form.pickup} drop={form.drop} />
        </div>
      </div>
    </section>
  );
}
