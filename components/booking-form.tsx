'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CarFront, Check, Plane, RefreshCw, Route } from 'lucide-react';
import { tripSchema } from '@/lib/validation.mjs';
import { rates, vehicles } from '@/lib/fare.mjs';
import { beginBooking, useSavedBooking, type TripForm } from '@/lib/booking-store';
import { PlaceInput } from './place-input';
const libraries: Libraries = ['places'];
const airports = [
  'Chennai International Airport (MAA)',
  'Coimbatore International Airport (CJB)',
  'Madurai Airport (IXM)',
  'Tiruchirappalli International Airport (TRZ)',
  'Salem Airport (SXV)',
  'Thoothukudi Airport (TCR)',
  'Neyveli Airport (NVY)',
  'Vellore Airport (VOVR)',
  'Hosur Aerodrome (VO95)',
];
export type RouteDraft = { pickup: string; drop: string };
function StepHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="form-step-heading">
      <span>{number}</span>
      <h2>{title}</h2>
    </div>
  );
}
export function BookingForm({
  initial = {},
  onRouteChange,
}: {
  initial?: Partial<TripForm>;
  onRouteChange?: (route: RouteDraft) => void;
}) {
  const saved = useSavedBooking();
  const values = { ...saved?.form, ...initial };
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
    <MapsForm key={JSON.stringify(values)} initial={values} onRouteChange={onRouteChange} />
  ) : (
    <BookingFields
      key={JSON.stringify(values)}
      initial={values}
      mapsLoaded={false}
      onRouteChange={onRouteChange}
    />
  );
}
function MapsForm({
  initial,
  onRouteChange,
}: {
  initial: Partial<TripForm>;
  onRouteChange?: (route: RouteDraft) => void;
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'riders-google-maps',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    preventGoogleFontsLoading: true,
  });
  return <BookingFields initial={initial} mapsLoaded={isLoaded} onRouteChange={onRouteChange} />;
}
function BookingFields({
  initial,
  mapsLoaded,
  onRouteChange,
}: {
  initial: Partial<TripForm>;
  mapsLoaded: boolean;
  onRouteChange?: (route: RouteDraft) => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const [airportFrom, setAirportFrom] = useState(() => airports.includes(initial.pickup || ''));
  const submission = useRef({ id: '', fingerprint: '' });
  const locked = useRef(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripType: 'oneway',
      pickup: '',
      drop: '',
      pickupDate: '',
      pickupTime: '',
      vehicle: '' as TripForm['vehicle'],
      customerName: '',
      mobile: '',
      email: '',
      womanAlone: false,
      seniorCitizen: false,
      travellingWithInfant: false,
      extraLuggage: false,
      ...initial,
    },
    mode: 'onBlur',
  });
  const tripType = useWatch({ control, name: 'tripType' }) || 'oneway';
  const vehicle = useWatch({ control, name: 'vehicle' });
  const pickup = useWatch({ control, name: 'pickup' }) || '';
  const drop = useWatch({ control, name: 'drop' }) || '';
  useEffect(() => {
    onRouteChange?.({ pickup, drop });
  }, [pickup, drop, onRouteChange]);
  const fieldError = (name: keyof TripForm) =>
    errors[name] ? (
      <span className="field-error" id={`${name}-error`} role="alert">
        {errors[name]?.message}
      </span>
    ) : null;
  const changeTrip = (next: TripForm['tripType']) => {
    if (next !== tripType && (tripType === 'airport' || next === 'airport')) {
      setValue('pickup', '');
      setValue('drop', '');
    }
    setValue('tripType', next, { shouldDirty: true, shouldValidate: false });
  };
  async function submit(values: TripForm) {
    if (locked.current) return;
    locked.current = true;
    setFormError('');
    const fingerprint = JSON.stringify(values);
    if (submission.current.fingerprint !== fingerprint)
      submission.current = { id: crypto.randomUUID(), fingerprint };
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: values,
          event: 'enquiry',
          requestId: submission.current.id,
          website: '',
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.delivered)
        throw new Error(result.error || 'We could not send your enquiry. Please retry.');
      beginBooking(values, submission.current.id);
      router.push('/estimate');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      locked.current = false;
    }
  }
  function locationField(name: 'pickup' | 'drop', label: string) {
    const isAirport = tripType === 'airport' && (airportFrom ? name === 'pickup' : name === 'drop');
    return (
      <div className="field">
        <label htmlFor={name}>{label}</label>
        <Controller
          control={control}
          name={name}
          render={({ field }) =>
            isAirport ? (
              <select
                id={name}
                {...field}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              >
                <option value="">Choose your airport</option>
                {airports.map((airport) => (
                  <option key={airport}>{airport}</option>
                ))}
              </select>
            ) : mapsLoaded ? (
              <PlaceInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={name}
                invalid={!!errors[name]}
                placeholder={
                  name === 'pickup' ? 'Where are we starting?' : 'Where would you like to go?'
                }
              />
            ) : (
              <input
                id={name}
                {...field}
                maxLength={250}
                autoComplete="off"
                placeholder={name === 'pickup' ? 'Your pickup city or address' : 'Your destination'}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
            )
          }
        />
        {fieldError(name)}
      </div>
    );
  }
  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submit)(event);
      }}
    >
      <div className="booking-form-intro">
        <span>
          <CarFront size={22} />
        </span>
        <div>
          <strong>A good place to start.</strong>
          <small>Your plan, in a few simple details.</small>
        </div>
      </div>
      <StepHeading number="01" title="What’s your kind of journey?" />
      <div className="booking-trip-tabs" role="group" aria-label="Journey type">
        {[
          { id: 'oneway' as const, label: 'One way', Icon: Route },
          { id: 'roundtrip' as const, label: 'There & back', Icon: RefreshCw },
          { id: 'airport' as const, label: 'Airport transfer', Icon: Plane },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tripType === id}
            className={tripType === id ? 'selected' : ''}
            onClick={() => changeTrip(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>
      {tripType === 'airport' && (
        <div className="airport-direction" role="group" aria-label="Airport transfer direction">
          <span>I’m travelling</span>
          {[true, false].map((from) => (
            <button
              type="button"
              key={String(from)}
              aria-pressed={airportFrom === from}
              onClick={() => {
                if (from !== airportFrom) {
                  setValue('pickup', drop);
                  setValue('drop', pickup);
                }
                setAirportFrom(from);
              }}
            >
              {from ? 'From the airport' : 'To the airport'}
            </button>
          ))}
        </div>
      )}
      <div className="form-grid route-fields">
        {locationField(
          'pickup',
          tripType === 'airport' && airportFrom ? 'Pickup airport' : 'Pickup location',
        )}
        {locationField(
          'drop',
          tripType === 'airport' && !airportFrom ? 'Destination airport' : 'Drop location',
        )}
      </div>
      <StepHeading number="02" title="Make a little time for it." />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="pickupDate">Pickup date</label>
          <input
            type="date"
            id="pickupDate"
            min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())}
            {...register('pickupDate')}
            aria-invalid={!!errors.pickupDate}
            aria-describedby={errors.pickupDate ? 'pickupDate-error' : undefined}
          />
          {fieldError('pickupDate')}
        </div>
        <div className="field">
          <label htmlFor="pickupTime">Pickup time · IST</label>
          <input
            type="time"
            id="pickupTime"
            {...register('pickupTime')}
            aria-invalid={!!errors.pickupTime}
            aria-describedby={errors.pickupTime ? 'pickupTime-error' : undefined}
          />
          {fieldError('pickupTime')}
        </div>
      </div>
      <StepHeading number="03" title="Who’s coming along?" />
      <div className="form-grid passenger-fields">
        <div className="field">
          <label htmlFor="customerName">Your name</label>
          <input
            id="customerName"
            autoComplete="name"
            placeholder="Full name"
            maxLength={100}
            {...register('customerName')}
            aria-invalid={!!errors.customerName}
            aria-describedby={errors.customerName ? 'customerName-error' : undefined}
          />
          {fieldError('customerName')}
        </div>
        <div className="field">
          <label htmlFor="mobile">Mobile number · +91</label>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            placeholder="10-digit Indian mobile"
            {...register('mobile')}
            aria-invalid={!!errors.mobile}
            aria-describedby={errors.mobile ? 'mobile-error' : undefined}
          />
          {fieldError('mobile')}
        </div>
        <div className="field full-width">
          <label htmlFor="email">Email · optional</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {fieldError('email')}
        </div>
      </div>
      <StepHeading number="04" title="Find your comfort zone." />
      <fieldset className="vehicle-fieldset">
        <legend className="sr-only">Choose your vehicle</legend>
        <div className="vehicle-options">
          {vehicles.map((item) => (
            <label key={item.id} className={vehicle === item.id ? 'selected' : ''}>
              <input
                type="radio"
                value={item.id}
                {...register('vehicle')}
                aria-describedby={errors.vehicle ? 'vehicle-error' : undefined}
              />
              <Image src={item.image} alt="" width={130} height={72} sizes="130px" />
              <span className="vehicle-card-copy">
                <strong>{item.label}</strong>
                <small>
                  {item.seats} passengers · {item.bags} bags
                </small>
              </span>
              <span className="vehicle-card-rate">
                ₹{rates[tripType][item.id as keyof typeof rates.oneway]}
                <small>/km</small>
              </span>
              <span className="radio-indicator">{vehicle === item.id && <Check size={12} />}</span>
            </label>
          ))}
        </div>
        {fieldError('vehicle')}
      </fieldset>
      <fieldset className="requirements">
        <legend>
          A little extra care? <span className="fine-print">Optional</span>
        </legend>
        <div className="requirement-options">
          {[
            ['womanAlone', 'Woman travelling alone'],
            ['seniorCitizen', 'Senior traveller'],
            ['travellingWithInfant', 'Travelling with an infant'],
            ['extraLuggage', 'Extra luggage'],
          ].map(([name, label]) => (
            <label key={name}>
              <input type="checkbox" {...register(name as keyof TripForm)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {formError && (
        <p role="alert" className="error-message">
          {formError}
        </p>
      )}
      <button className="button button-full booking-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending your enquiry…' : 'Get my fare estimate'}
        <ArrowUpRight size={19} />
      </button>
      <p className="privacy-note">
        Continuing sends your details to our booking team through Telegram, then opens your
        estimate. Your request is subject to availability. Read our{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    </form>
  );
}
