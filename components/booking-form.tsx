'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plane,
  RefreshCw,
  Route,
} from 'lucide-react';
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

type CustomControlProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid?: boolean;
  describedBy?: string;
};

function AirportControl({
  id,
  ...props
}: CustomControlProps & {
  id: 'pickup' | 'drop';
}) {
  const [open, setOpen] = useState(false);
  const query = props.value.toLowerCase();
  const options = airports.filter((airport) => airport.toLowerCase().includes(query));
  return (
    <div className="custom-control">
      <input
        id={id}
        role="combobox"
        value={props.value}
        placeholder="Choose your airport"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-airport-options`}
        aria-invalid={props.invalid}
        aria-describedby={props.describedBy}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          props.onChange(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          props.onBlur();
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      <ChevronDown className="custom-control-icon" size={18} />
      {open && (
        <div
          className="custom-control-popover airport-options"
          id={`${id}-airport-options`}
          role="listbox"
        >
          {options.map((airport) => (
            <button
              type="button"
              role="option"
              aria-selected={props.value === airport}
              key={airport}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                props.onChange(airport);
                setOpen(false);
              }}
            >
              <Plane size={16} />
              <span>{airport}</span>
              {props.value === airport && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateControl({ value, onChange, onBlur, invalid, describedBy }: CustomControlProps) {
  const today = new Date();
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected || today);
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const todayIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(today);
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(view);
  const toIso = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return (
    <div className="custom-control">
      <input
        id="pickupDate"
        value={value}
        inputMode="numeric"
        placeholder="YYYY-MM-DD"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onFocus={() => setOpen(true)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          onBlur();
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      <CalendarDays className="custom-control-icon" size={18} />
      {open && (
        <div
          className="custom-control-popover date-popover"
          role="dialog"
          aria-label="Choose pickup date"
        >
          <div className="calendar-heading">
            <strong>{monthLabel}</strong>
            <div>
              <button
                type="button"
                aria-label="Previous month"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setView(new Date(year, month - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setView(new Date(year, month + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-days">
            {Array.from({ length: firstDay }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const day = index + 1;
              const iso = toIso(day);
              return (
                <button
                  type="button"
                  key={iso}
                  disabled={iso < todayIso}
                  className={value === iso ? 'selected' : iso === todayIso ? 'today' : ''}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeControl({ value, onChange, onBlur, invalid, describedBy }: CustomControlProps) {
  const [open, setOpen] = useState(false);
  const times = Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 ? '30' : '00';
    return `${String(hour).padStart(2, '0')}:${minute}`;
  });
  return (
    <div className="custom-control">
      <input
        id="pickupTime"
        value={value}
        inputMode="numeric"
        placeholder="HH:MM"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onFocus={() => setOpen(true)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          onBlur();
          window.setTimeout(() => setOpen(false), 120);
        }}
      />
      <Clock3 className="custom-control-icon" size={18} />
      {open && (
        <div
          className="custom-control-popover time-options"
          role="listbox"
          aria-label="Choose pickup time"
        >
          {times.map((time) => (
            <button
              type="button"
              role="option"
              aria-selected={value === time}
              className={value === time ? 'selected' : ''}
              key={time}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(time);
                setOpen(false);
              }}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export type RouteDraft = { pickup: string; drop: string };
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
              <AirportControl
                id={name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors[name]}
                describedBy={errors[name] ? `${name}-error` : undefined}
              />
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
      <h2 className="compact-form-heading">Choose your journey</h2>
      <div className="booking-trip-tabs" role="group" aria-label="Journey type">
        {[
          { id: 'oneway' as const, label: 'One way', Icon: Route },
          { id: 'roundtrip' as const, label: 'Round trip', Icon: RefreshCw },
          { id: 'airport' as const, label: 'Airport pickup', Icon: Plane },
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
        <div className="airport-direction" role="group" aria-label="Airport pickup direction">
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
      <div className="booking-details-grid">
        <div className="field">
          <label htmlFor="pickupDate">Pickup date</label>
          <Controller
            control={control}
            name="pickupDate"
            render={({ field }) => (
              <DateControl
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.pickupDate}
                describedBy={errors.pickupDate ? 'pickupDate-error' : undefined}
              />
            )}
          />
          {fieldError('pickupDate')}
        </div>
        <div className="field">
          <label htmlFor="pickupTime">Pickup time · IST</label>
          <Controller
            control={control}
            name="pickupTime"
            render={({ field }) => (
              <TimeControl
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.pickupTime}
                describedBy={errors.pickupTime ? 'pickupTime-error' : undefined}
              />
            )}
          />
          {fieldError('pickupTime')}
        </div>
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
      </div>
      <h2 className="compact-form-heading vehicle-heading">Choose your car</h2>
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
      {formError && (
        <p role="alert" className="error-message">
          {formError}
        </p>
      )}
      <button className="button button-full booking-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending your enquiry…' : 'Get my fare estimate'}
        <ArrowUpRight size={19} />
      </button>
    </form>
  );
}
