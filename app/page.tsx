import type { Metadata } from 'next';
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
          <Reveal className="home-booking-form">
            <BookingForm />
          </Reveal>
        </div>
      </section>
      <ServicesSection />
      <RoutesSection />
      <Fleet />
      <WhyUs />
      <Process />
      <Faq />
    </>
  );
}
