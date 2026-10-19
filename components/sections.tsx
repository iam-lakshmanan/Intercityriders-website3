import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowRight,
  Plane,
  Route,
  RefreshCw,
  Check,
  MoveUpRight,
  Users,
} from 'lucide-react';
import { Reveal } from './motion';
import { journeys, bookingLink } from '@/lib/site';
import { rates, vehicles } from '@/lib/fare.mjs';
export function SectionHeading({
  eyebrow,
  title,
  text,
  href,
  link = 'Explore more',
}: {
  eyebrow: string;
  title: string;
  text?: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div>
        {text && <p>{text}</p>}
        {href && (
          <Link className="text-link" href={href}>
            {link}
            <ArrowUpRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
export function ServicesSection({ full = false }: { full?: boolean }) {
  const services = [
    {
      icon: Route,
      name: 'Just the one way.',
      type: 'ONE-WAY',
      text: 'A new city. A family visit. A fresh start. Get where you’re going, with no return journey to plan.',
      trip: 'oneway',
      image: '/images/destination-1.webp',
    },
    {
      icon: RefreshCw,
      name: 'There. And back.',
      type: 'ROUND TRIP',
      text: 'Keep the whole journey together. A day out, a weekend away, and a comfortable ride home.',
      trip: 'roundtrip',
      image: '/images/destination-2.webp',
    },
    {
      icon: Plane,
      name: 'Airport pickup.',
      type: 'AIRPORT PICKUP',
      text: 'From doorstep to departures, or arrivals to home. Make the road part of your trip feel easy.',
      trip: 'airport',
      image: '/images/airport.webp',
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="YOUR PLANS. YOUR KIND OF RIDE."
            title="Every reason to go."
            text="Different destinations. Different occasions. The same thoughtful approach to getting you there."
          />
        </Reveal>
        <div className={`service-editorial ${full ? 'expanded' : ''}`}>
          {services.map(({ icon: Icon, ...s }, i) => (
            <Reveal key={s.trip} delay={i * 0.08}>
              <Link
                className={`service-row service-row-${s.trip}`}
                href={
                  s.trip === 'airport'
                    ? '/airport-transfers'
                    : bookingLink(undefined, undefined, s.trip)
                }
              >
                <div className="service-visual">
                  <Image
                    src={s.image}
                    alt=""
                    width={900}
                    height={560}
                    sizes="(max-width: 850px) 100vw, 38vw"
                  />
                  <span className="service-number">0{i + 1}</span>
                </div>
                <div className="service-body">
                  <div className="service-icon">
                    <Icon size={28} strokeWidth={1.3} />
                  </div>
                  <div className="service-copy">
                    <span className="eyebrow">{s.type}</span>
                    <h3>{s.name}</h3>
                  </div>
                  <p>{s.text}</p>
                  <span className="round-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function RoutesSection({ all = false }: { all?: boolean }) {
  return (
    <section className="section destinations-section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="A CHANGE OF SCENERY"
            title="Where to, next?"
            text="Follow a familiar road. Find a new favourite place. There’s a whole journey waiting."
            href={all ? undefined : '/service-routes'}
            link="Explore the routes"
          />
        </Reveal>
        <div className={`destination-journal ${all ? 'all-destinations' : ''}`}>
          {journeys.slice(0, all ? 6 : 2).map((r, i) => (
            <Reveal key={r.from + r.to} className="destination-entry" delay={(i % 2) * 0.12}>
              <Link href={bookingLink(r.from, r.to)} className="destination-link">
                <div className="destination-photo">
                  <Image
                    src={r.image}
                    alt={`A scenic escape towards ${r.to}`}
                    fill
                    sizes="(max-width:700px) 92vw, 46vw"
                  />
                  <span className="destination-label">{r.tag}</span>
                  <h3 className="destination-place">{r.to}</h3>
                  <span className="photo-arrow">
                    <ArrowUpRight size={26} />
                  </span>
                </div>
                <div className="destination-caption">
                  <div>
                    <span className="eyebrow">FROM {r.from.toUpperCase()}</span>
                  </div>
                  <p>{r.note}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Fleet() {
  return (
    <section className="section fleet-section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="MAKE YOURSELF COMFORTABLE"
            title="Your people. Your space."
            text="A solo escape or the whole family along. Find the car that fits your journey."
          />
        </Reveal>
        <div className="fleet-card-grid">
          {vehicles.map((vehicle, index) => (
            <Reveal key={vehicle.id} delay={index * 0.06}>
              <article className="classic-fleet-card">
                <div className="classic-fleet-head">
                  <div>
                    <span>INTERCITY FLEET</span>
                    <h3>{vehicle.label}</h3>
                  </div>
                  <span className="fleet-index">0{index + 1}</span>
                  <span className="fleet-seat-pill">
                    <Users size={18} strokeWidth={1.8} /> {vehicle.seats} SEATER
                  </span>
                </div>
                <div className="classic-fleet-image">
                  <Image
                    src={vehicle.image}
                    alt={`${vehicle.label} vehicle example`}
                    width={600}
                    height={350}
                    sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                </div>
                <div className="classic-fleet-content">
                  <div className="classic-fleet-rates">
                    <div>
                      <small>ONE WAY</small>
                      <strong>
                        ₹{rates.oneway[vehicle.id as keyof typeof rates.oneway]}
                        <span>/km</span>
                      </strong>
                    </div>
                    <div>
                      <small>ROUND TRIP</small>
                      <strong>
                        ₹{rates.roundtrip[vehicle.id as keyof typeof rates.roundtrip]}
                        <span>/km</span>
                      </strong>
                    </div>
                  </div>
                  <Link href={`/booking?vehicle=${vehicle.id}`} className="button button-full">
                    Choose this car <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="fine-print fleet-disclaimer">
          Example vehicle images. Model subject to availability. One-way rates shown; minimum 130 km
          + ₹400 driver allowance. Other charges may apply.
        </p>
      </div>
    </section>
  );
}
export function Process() {
  return (
    <section className="section process-section">
      <div className="container">
        <Reveal>
          <div className="process-heading">
            <span className="eyebrow">LESS PLANNING. MORE LIVING.</span>
            <h2>
              Good journeys.
              <br />
              <em>Simple beginnings.</em>
            </h2>
            <p>
              A few details from you.
              <br />A little help from us.
            </p>
          </div>
        </Reveal>
        <div className="process-steps">
          {[
            [
              '01',
              'Make a little plan.',
              'Tell us your route, date, time and the ride you have in mind.',
            ],
            [
              '02',
              'Know where you stand.',
              'See the route, distance and fare. Clear inclusions. No guesswork.',
            ],
            [
              '03',
              'We’ll take it from here.',
              'Send your request. Our team will confirm availability and the final details.',
            ],
          ].map(([n, title, text]) => (
            <Reveal key={n}>
              <article>
                <span className="process-number">
                  {n}
                  <MoveUpRight size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function WhyUs({ image = '/images/hero.webp' }: { image?: string }) {
  return (
    <section className="section">
      <div className="container care-layout">
        <Reveal className={`care-image ${image.includes('about-hero') ? 'care-image-about' : ''}`}>
          <Image
            src={image}
            alt="A comfortable Intercity Riders journey"
            fill
            sizes="(max-width:800px) 92vw, 48vw"
          />
          <div className="image-caption">THE JOURNEY IS PART OF THE STORY.</div>
        </Reveal>
        <Reveal className="care-copy">
          <span className="eyebrow">IT’S THE LITTLE THINGS</span>
          <h2>
            More thought.
            <br />
            <em>Every mile.</em>
          </h2>
          <p>
            Behind every destination is a reason to go. We make room for yours, with a choice of
            cars, clear estimates, and a team to help with the details.
          </p>
          <ul className="care-list">
            {[
              'Fares explained before you confirm',
              'Space for your people and their plans',
              'A real conversation when you need one',
            ].map((s) => (
              <li key={s}>
                <Check size={18} />
                {s}
              </li>
            ))}
          </ul>
          <Link className="text-link" href="/about-us">
            Get to know us <ArrowUpRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
export function Faq() {
  const faqs = [
    [
      'How do you calculate the fare?',
      'We use driving distance and your chosen vehicle’s per-kilometre rate. The minimum is 130 km for one-way and airport journeys, or 250 km for round trips. The estimate includes a ₹400 driver allowance.',
    ],
    [
      'What about extra charges?',
      'Tolls, permits, parking, hill-station and carrier charges are extra where applicable. Our booking team can help clarify the details for your route.',
    ],
    [
      'Does submitting reserve a car?',
      'Your request is sent to our booking team. They will contact you to confirm vehicle availability and final details. An online request does not automatically reserve a vehicle.',
    ],
    [
      'Can I plan an airport pickup?',
      'Yes. Choose Airport pickup, then From the airport or To the airport. Add the other endpoint and your preferred pickup time.',
    ],
    [
      'Can I request a little extra help?',
      'Yes. Call or message our booking team after sending your journey request, and they will help note any additional travel requirements.',
    ],
    [
      'What if a live estimate isn’t available?',
      'Your initial enquiry can still reach the booking team when notification delivery is available. You can also call or send a message to arrange a manual quote.',
    ],
  ];
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <Reveal>
          <span className="eyebrow">BEFORE YOU GO</span>
          <h2>
            A little clarity.
            <br />
            <em>A better start.</em>
          </h2>
          <p>Something else on your mind?</p>
          <Link className="text-link" href="/contact-us">
            Let’s talk <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.025}>
              <details>
                <summary>
                  <span>
                    <small>0{i + 1}</small>
                    {q}
                  </span>
                  <span className="faq-plus">+</span>
                </summary>
                <div className="faq-answer">
                  <p>{a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function PageHero({
  eyebrow,
  title,
  accent,
  text,
  image,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
  image?: string;
}) {
  return (
    <section className={`page-intro ${image ? 'with-background' : ''}`}>
      {image && (
        <>
          <Image className="page-intro-background" src={image} alt="" fill sizes="100vw" priority />
          <div className="page-intro-overlay" />
        </>
      )}
      <div className="container">
        <Reveal>
          <div className="page-breadcrumb">
            <Link href="/">Home</Link>
            <ArrowRight size={12} />
            <span>{eyebrow}</span>
          </div>
          <div className="page-intro-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1>
              {title}
              <br />
              <em>{accent}</em>
            </h1>
            <p>{text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
