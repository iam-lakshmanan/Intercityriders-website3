'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const slides = [
  {
    eyebrow: 'DOORSTEP TRAVEL MADE SIMPLE',
    title: 'Your city. Your pickup.',
    accent: 'One smooth ride.',
    text: 'Book a comfortable intercity cab from your doorstep. Travel directly to the destination that matters.',
    image: '/images/page-banners/services-hero-v2.png',
    alt: 'An Intercity Riders sedan travelling from the city',
  },
  {
    eyebrow: 'ONE-WAY TRAVEL, YOUR WAY',
    title: 'One city to the next.',
    accent: 'Simple from the start.',
    text: 'Choose your pickup, destination, and preferred car. We’ll help make the miles between feel effortless.',
    image: '/images/page-banners/routes-hero-v2.png',
    alt: 'An intercity car following a scenic mountain road',
  },
  {
    eyebrow: 'AIRPORT RIDES WITHOUT THE RUSH',
    title: 'Door to terminal.',
    accent: 'Comfortably on time.',
    text: 'Plan a calm airport transfer with a direct pickup and the space you need for every traveller and bag.',
    image: '/images/page-banners/airport-transfers-hero-v2.png',
    alt: 'A traveller meeting an airport transfer driver',
  },
] as const;

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const goTo = (index: number) => setActive((index + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const finishSwipe = (endX: number) => {
    if (touchStart.current === null) return;
    const distance = endX - touchStart.current;
    if (Math.abs(distance) > 50) goTo(active + (distance < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <section
      className="home-carousel"
      aria-roledescription="carousel"
      aria-label="Intercity Riders services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="home-carousel-viewport">
        <div
          className="home-carousel-track"
          style={{ transform: `translate3d(-${active * 100}%,0,0)` }}
        >
          {slides.map((slide, index) => (
            <article
              className="home-carousel-slide"
              key={slide.eyebrow}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
              aria-hidden={active !== index}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                loading="eager"
                sizes="100vw"
                className="home-carousel-image"
              />
              <div className="home-carousel-shade" />
              <div className="container home-carousel-content">
                <div className="home-carousel-copy">
                  <span className="home-carousel-index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="eyebrow">{slide.eyebrow}</span>
                  {index === 0 ? (
                    <h1>
                      {slide.title}
                      <br />
                      <em>{slide.accent}</em>
                    </h1>
                  ) : (
                    <h2>
                      {slide.title}
                      <br />
                      <em>{slide.accent}</em>
                    </h2>
                  )}
                  <p>{slide.text}</p>
                  <div className="home-carousel-links">
                    <a href="#start-journey" className="button">
                      Plan your journey <ArrowDown size={17} />
                    </a>
                    <Link href="/services" className="text-link">
                      Explore our services <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
