import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowRight, MapPin, Phone, Mail, Plane, Check } from 'lucide-react';
import {
  PageHero,
  ServicesSection,
  RoutesSection,
  Fleet,
  Faq,
  Process,
  WhyUs,
} from '@/components/sections';
import { Reveal } from '@/components/motion';
import { ContactForm } from '@/components/contact-form';
import { rates, vehicles } from '@/lib/fare.mjs';
import { cities, bookingLink, site } from '@/lib/site';
const pages = {
  about: {
    title: 'Our story',
    eyebrow: 'A LITTLE ABOUT US',
    heading: 'For the miles.',
    accent: 'And the moments.',
    text: 'We believe a good journey is about more than getting there. It’s about feeling comfortable along the way.',
  },
  services: {
    title: 'Ways to travel',
    eyebrow: 'YOUR NEXT CHAPTER',
    heading: 'So many reasons.',
    accent: 'One good ride.',
    text: 'One-way journeys, a round trip together, or a connection to your next flight. Let’s find your way.',
  },
  routes: {
    title: 'Explore the routes',
    eyebrow: 'FOLLOW YOUR CURIOSITY',
    heading: 'A different road.',
    accent: 'A fresh perspective.',
    text: 'From city connections to a quiet corner of the hills. Explore a few of the journeys we can help arrange.',
  },
  'service-areas': {
    title: 'Where we go',
    eyebrow: 'CONNECTED BY GOOD ROADS',
    heading: 'Your city.',
    accent: 'Your starting point.',
    text: 'Across Tamil Nadu and neighbouring destinations. Choose your pickup city and let’s make a plan.',
  },
  tariff: {
    title: 'Fares, made clear',
    eyebrow: 'NOTHING TO GUESS',
    heading: 'Good journeys.',
    accent: 'Clear numbers.',
    text: 'Choose your comfort. Understand the rate. See what goes into your fare before confirming your request.',
  },
  'airport-transfers': {
    title: 'Airport transfers',
    eyebrow: 'FROM DOORSTEP TO DEPARTURES',
    heading: 'The next connection.',
    accent: 'Taken care of.',
    text: 'Heading for the skies or coming back home? Make the road part of your trip a little easier.',
  },
  contact: {
    title: 'Get in touch',
    eyebrow: 'A REAL CONVERSATION',
    heading: 'A question. A plan.',
    accent: 'Let’s talk.',
    text: 'Tell us about your next journey, ask about a route, or get a little help with the details.',
  },
  privacy: {
    title: 'Privacy & your details',
    eyebrow: 'YOUR DETAILS, WITH CARE',
    heading: 'A little clarity.',
    accent: 'About your privacy.',
    text: 'What you share, how it helps us arrange your journey, and how to get in touch about your information.',
  },
} as const;
type Slug = keyof typeof pages;
const aliases: Record<string, Slug> = {
  'about-us': 'about',
  'contact-us': 'contact',
  'service-routes': 'routes',
};
const canonical: Partial<Record<Slug, string>> = {
  about: '/about-us',
  contact: '/contact-us',
  routes: '/service-routes',
};
const bannerImages: Partial<Record<Slug, string>> = {
  about: '/images/page-banners/about-hero.png',
  services: '/images/page-banners/services-hero.png',
  tariff: '/images/page-banners/tariff-hero.png',
  routes: '/images/page-banners/routes-hero.png',
  contact: '/images/page-banners/contact-hero.png',
  'service-areas': '/images/page-banners/routes-hero.png',
  'airport-transfers': '/images/page-banners/services-hero.png',
};
function resolve(requested: string): Slug | undefined {
  const slug = Object.hasOwn(aliases, requested) ? aliases[requested] : requested;
  return Object.hasOwn(pages, slug) ? (slug as Slug) : undefined;
}
export function generateStaticParams() {
  return [...Object.keys(pages), ...Object.keys(aliases)].map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: requested } = await params;
  const slug = resolve(requested);
  if (!slug) return {};
  const page = pages[slug];
  return {
    title: page.title,
    description: page.text,
    alternates: { canonical: canonical[slug] || `/${slug}` },
    openGraph: { title: page.title, description: page.text, url: canonical[slug] || `/${slug}` },
  };
}
export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: requested } = await params;
  const slug = resolve(requested);
  if (!slug) notFound();
  const page = pages[slug];
  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.heading}
        accent={page.accent}
        text={page.text}
        image={bannerImages[slug]}
      />
      {slug === 'services' && (
        <>
          <ServicesSection full />
          <Fleet />
          <Process />
          <Faq />
        </>
      )}
      {slug === 'routes' && (
        <>
          <RoutesSection all />
          <section className="section compact-section">
            <div className="container route-ledger">
              <span className="eyebrow">SOMEWHERE ELSE IN MIND?</span>
              <h2>Make your own connection.</h2>
              <p>
                Tell us where you want to go. Our team will confirm availability for your route.
              </p>
              <Link href="/booking" className="button">
                Plan a different route <ArrowUpRight size={18} />
              </Link>
            </div>
          </section>
        </>
      )}
      {slug === 'about' && (
        <>
          <section className="section">
            <div className="container story-layout">
              <Reveal>
                <span className="eyebrow">MORE THAN A DESTINATION</span>
                <h2>
                  A family waiting.
                  <br />A new beginning.
                  <br />
                  <em>A reason to go.</em>
                </h2>
              </Reveal>
              <Reveal>
                <p className="lead">Every journey starts with something that matters.</p>
                <p>
                  A visit home. A meeting in a new city. An unhurried weekend in the hills. We’re
                  here to help make the road in between a good part of your story.
                </p>
                <p>
                  Intercity Riders brings together clear journey details, a choice of comfortable
                  vehicles, and a booking team to help with the arrangements. You make the plan; we
                  help with the miles.
                </p>
                <Link href="/booking" className="text-link">
                  Let’s begin your next chapter <ArrowUpRight size={18} />
                </Link>
              </Reveal>
            </div>
          </section>
          <WhyUs image="/images/page-banners/about-hero.png" />
          <Process />
        </>
      )}
      {slug === 'service-areas' && (
        <section className="section">
          <div className="container">
            <div className="city-heading">
              <span className="eyebrow">PICK A PLACE TO BEGIN</span>
              <p>
                All routes and vehicles are subject to availability.
                <br />
                Our team will confirm your request.
              </p>
            </div>
            <div className="city-index">
              {cities.map((city, i) => (
                <Reveal key={city} delay={(i % 3) * 0.04}>
                  <Link href={bookingLink(city)}>
                    <small>{String(i + 1).padStart(2, '0')}</small>
                    <MapPin size={19} />
                    <h2>{city}</h2>
                    <ArrowUpRight size={22} />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      {slug === 'tariff' && (
        <>
          <section className="section">
            <div className="container">
              <Reveal>
                <div
                  className="tariff-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Compare vehicle rates"
                >
                  <table className="tariff-table">
                    <caption>Per-kilometre rates · Indian rupees</caption>
                    <thead>
                      <tr>
                        <th scope="col">YOUR COMFORT</th>
                        <th scope="col">ONE WAY</th>
                        <th scope="col">THERE & BACK</th>
                        <th scope="col">AIRPORT</th>
                        <th scope="col">MAKE A PLAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v, i) => {
                        const id = v.id as keyof typeof rates.oneway;
                        return (
                          <tr key={id}>
                            <th scope="row">
                              <span className="table-vehicle">
                                <small>0{i + 1}</small>
                                <span>
                                  {v.label}
                                  <small>
                                    {v.seats} passengers · {v.bags} bags
                                  </small>
                                </span>
                              </span>
                            </th>
                            <td>
                              ₹{rates.oneway[id]}
                              <small>/km</small>
                            </td>
                            <td>
                              ₹{rates.roundtrip[id]}
                              <small>/km</small>
                            </td>
                            <td>
                              ₹{rates.airport[id]}
                              <small>/km</small>
                            </td>
                            <td>
                              <Link
                                className="round-arrow"
                                href={`/booking?vehicle=${id}`}
                                aria-label={`Book ${v.label}`}
                              >
                                <ArrowUpRight />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Reveal>
              <div className="pricing-notes">
                {[
                  [
                    '01',
                    'A minimum, explained.',
                    '130 km for one-way and airport trips. 250 km for round trips, including the return distance.',
                  ],
                  [
                    '02',
                    'Your driver, included.',
                    'A fixed ₹400 driver allowance is added to the base distance fare in your estimate.',
                  ],
                  [
                    '03',
                    'The other little details.',
                    'Tolls, permits, parking, hill and carrier charges are extra. Confirm extended itineraries with our team.',
                  ],
                ].map(([n, title, text]) => (
                  <Reveal key={n}>
                    <article>
                      <span>{n}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
              <div className="tariff-cta">
                <div>
                  <span className="eyebrow">LET’S PUT A NUMBER TO YOUR PLAN</span>
                  <h2>What’s your next journey?</h2>
                </div>
                <Link href="/booking" className="button orange">
                  See my estimate <ArrowUpRight size={19} />
                </Link>
              </div>
            </div>
          </section>
          <Faq />
        </>
      )}
      {slug === 'airport-transfers' && (
        <>
          <section className="section">
            <div className="container airport-feature">
              <Reveal>
                <div className="airport-orbit">
                  <Plane size={70} strokeWidth={1} />
                  <span>ARRIVALS ↔ HOME ↔ DEPARTURES</span>
                </div>
              </Reveal>
              <Reveal>
                <span className="eyebrow">ONE LESS THING ON YOUR MIND</span>
                <h2>
                  Land. Breathe.
                  <br />
                  <em>Leave the road to us.</em>
                </h2>
                <p>
                  Choose a pickup from the airport or a drop at departures. Share your terminal,
                  luggage needs and preferred time with the team when they follow up.
                </p>
                <ul className="care-list">
                  {[
                    'Chennai, Coimbatore, Madurai and Tiruchirappalli',
                    'Sedans and SUVs to suit your group',
                    'Pickup timing and availability confirmed by our team',
                  ].map((t) => (
                    <li key={t}>
                      <Check size={18} />
                      {t}
                    </li>
                  ))}
                </ul>
                <Link href={bookingLink(undefined, undefined, 'airport')} className="button">
                  Plan my airport transfer <ArrowUpRight size={19} />
                </Link>
              </Reveal>
            </div>
          </section>
          <Process />
          <Faq />
        </>
      )}
      {slug === 'contact' && (
        <section className="section">
          <div className="container contact-layout">
            <Reveal>
              <div className="contact-aside">
                <span className="eyebrow">PEOPLE, NOT JUST A FORM</span>
                <h2>
                  Good to hear
                  <br />
                  <em>from you.</em>
                </h2>
                <p>
                  Have your route and date handy? Great.
                  <br />
                  Still figuring it out? That’s fine, too.
                </p>
                <a href={`tel:${site.phone}`}>
                  <Phone size={23} />
                  <span>
                    <small>GIVE US A CALL</small>
                    {site.phone}
                  </span>
                  <ArrowUpRight size={20} />
                </a>
                <a href={`mailto:${site.email}`}>
                  <Mail size={23} />
                  <span>
                    <small>DROP US A NOTE</small>
                    {site.email}
                  </span>
                  <ArrowUpRight size={20} />
                </a>
                <a
                  href={`https://wa.me/${site.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-dot" />
                  <span>
                    <small>KEEP IT SIMPLE</small>Chat on WhatsApp
                  </span>
                  <ArrowUpRight size={20} />
                </a>
                <p className="fine-print">
                  Travelling early? Send your request in advance and confirm the arrangements with
                  our team.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </section>
      )}
      {slug === 'privacy' && (
        <section className="section">
          <div className="container privacy-layout">
            <aside>
              <span className="eyebrow">THE SHORT VERSION</span>
              <p>Your details help us plan your journey and respond to your request.</p>
              <Link href="/contact-us" className="text-link">
                Ask us about privacy <ArrowRight size={16} />
              </Link>
            </aside>
            <article className="prose">
              {[
                [
                  'What you share',
                  'We collect the details you enter: your name, mobile, optional email, route, pickup date and time, chosen vehicle, and any travel requirements. Contact messages include the information you choose to send.',
                ],
                [
                  'How it helps',
                  'We use your details to respond, prepare an estimate and arrange your journey. Enquiries and booking requests are delivered to the booking team through Telegram. A delivered request does not automatically reserve a vehicle.',
                ],
                [
                  'Maps and location searches',
                  'Google Maps processes your location searches and journey endpoints to provide suggestions, route previews and driving estimates. These services are subject to Google’s privacy policies.',
                ],
                [
                  'Your draft and receipt',
                  'Your draft is kept in this tab’s session storage for up to two hours so you can move between booking steps. After successful confirmation we replace the personal draft with a minimal receipt containing your reference and fare. Closing the tab clears session storage. Pickup and destination shortcuts may appear in URLs; names and mobile numbers are not included in booking URLs.',
                ],
                [
                  'Optional WhatsApp sharing',
                  'Choosing the WhatsApp sharing action sends the details displayed in the message to WhatsApp. You review and send that message yourself. It is a separate action from delivery to the booking team.',
                ],
                [
                  'Access, corrections and deletion',
                  'Contact the booking team to ask about your information, correct it or request deletion. Telegram message retention is managed by the operator; browser draft expiry does not delete messages already delivered to the booking team.',
                ],
              ].map(([title, text], i) => (
                <Reveal key={title}>
                  <section>
                    <span className="eyebrow">0{i + 1}</span>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </section>
                </Reveal>
              ))}
            </article>
          </div>
        </section>
      )}
    </>
  );
}
