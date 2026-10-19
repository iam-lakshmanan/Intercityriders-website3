import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight, ArrowDown, MapPin, MoveUpRight, Route } from 'lucide-react';
import { Reveal } from '@/components/motion';
import { QuickBooking } from '@/components/quick-booking';
import { ServicesSection, RoutesSection, Fleet, Process, Faq, WhyUs } from '@/components/sections';
export const metadata: Metadata = {
  title: { absolute: 'Intercity Riders — Go somewhere. Go well.' },
  alternates: { canonical: '/' },
};
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="container">
          <div className="hero-layout">
            <Reveal className="hero-copy">
              <span className="eyebrow">
                <span className="tiny-dot" /> TAMIL NADU & BEYOND
              </span>
              <h1>
                Good roads.
                <br />
                Great
                <br />
                <em>company.</em>
                <span className="hero-period">*</span>
              </h1>
              <p>
                For the places you’re going.
                <br />
                And the moments along the way.
              </p>
              <div className="hero-actions">
                <Link href="/booking" className="button">
                  Let’s go somewhere <ArrowUpRight size={20} />
                </Link>
                <a
                  href="#journey-planner"
                  className="circle-link"
                  aria-label="Go to journey planner"
                >
                  <ArrowDown size={20} />
                </a>
              </div>
              <div className="hero-note">
                <span className="mini-route">
                  <MapPin size={15} />
                  <span />
                  <MapPin size={15} />
                </span>
                <span>
                  One way. There & back. Airport.
                  <br />
                  <strong>Your journey, thoughtfully arranged.</strong>
                </span>
              </div>
            </Reveal>
            <Reveal className="hero-photo-wrap" delay={0.12}>
              <div className="hero-photo">
                <Image
                  src="/images/hero.webp"
                  alt="A comfortable car winding through a scenic mountain road"
                  fill
                  priority
                  sizes="(max-width:800px) 94vw, 52vw"
                />
                <div className="hero-photo-caption">
                  <span>TAKE THE SCENIC WAY.</span>
                  <MoveUpRight size={20} />
                </div>
              </div>
              <div className="hero-stamp">
                <Route size={26} />
                <span>
                  LESS EVERYDAY.
                  <br />
                  <strong>MORE OPEN ROAD.</strong>
                </span>
              </div>
              <span className="photo-side-note">SOMEWHERE GOOD IS WAITING.</span>
            </Reveal>
          </div>
          <Reveal>
            <div className="planner-wrap" id="journey-planner">
              <div className="planner-heading">
                <span className="eyebrow">A SMALL PLAN. A GREAT JOURNEY.</span>
                <span>Where shall we take you?</span>
              </div>
              <QuickBooking />
            </div>
          </Reveal>
          <div className="hero-bottom">
            <span>GOOD CARS. CLEAR FARES. REAL CONVERSATIONS.</span>
            <span>
              SCROLL TO EXPLORE <ArrowDown size={13} />
            </span>
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
