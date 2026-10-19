import type { Metadata } from 'next';
import { CarFront, Headphones, MoveUpRight, Route, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { BookingForm } from '@/components/booking-form';
import { HomeHeroCarousel } from '@/components/home-hero-carousel';
import { ServicesSection, RoutesSection, Fleet, Process, Faq, WhyUs } from '@/components/sections';
export const metadata: Metadata = {
  title: { absolute: 'Intercity Riders — Go somewhere. Go well.' },
  alternates: { canonical: '/' },
};
export default function Home() {
  return (
    <>
      <HomeHeroCarousel />
      <section className="home-booking-section" id="start-journey">
        <div className="container">
          <Reveal>
            <div className="home-booking-heading">
              <span className="eyebrow">START YOUR JOURNEY</span>
              <h2>Tell us where you’re going.</h2>
              <p>Choose your trip, route, time and preferred car to get a clear fare estimate.</p>
            </div>
          </Reveal>
          <Reveal className="home-booking-form">
            <BookingForm />
          </Reveal>
          <div className="trust-strip">
            {[
              [ShieldCheck, 'Clear, upfront fares', 'Know what goes into your trip'],
              [CarFront, 'Comfort comes along', 'A choice of cars for your plans'],
              [Route, 'Your route. Your pace.', 'One-way, return & airport rides'],
              [Headphones, 'A team that listens', 'Help with the details that matter'],
            ].map(([Icon, title, text]) => (
              <div key={String(title)}>
                {typeof Icon !== 'string' && <Icon size={27} strokeWidth={1.5} />}
                <span>
                  <strong>{String(title)}</strong>
                  <small>{String(text)}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ServicesSection />
      <div className="statement-band">
        <div className="container">
          <span>GO FOR A REASON.</span>
          <span className="asterisk">✳</span>
          <span>STAY FOR THE JOURNEY.</span>
          <MoveUpRight />
        </div>
      </div>
      <RoutesSection />
      <Fleet />
      <WhyUs />
      <Process />
      <Faq />
    </>
  );
}
