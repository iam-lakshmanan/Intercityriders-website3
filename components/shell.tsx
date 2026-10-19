'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Menu,
  Phone,
  Route,
  ShieldCheck,
  X,
} from 'lucide-react';
import { bookingLink, footerCities, navigation, site, socialLinks } from '@/lib/site';
import { Reveal } from './motion';
export function Logo() {
  return (
    <span className="brand-logo">
      <Image
        src="/images/car-logo3-transparent.png"
        alt="Intercity Riders — The one you can trust"
        width={3692}
        height={1120}
        sizes="(max-width: 640px) 164px, 204px"
        priority
      />
    </span>
  );
}
export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const aliases: Record<string, string> = {
    '/about': '/about-us',
    '/routes': '/service-routes',
    '/contact': '/contact-us',
  };
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" aria-label="Intercity Riders home">
            <Logo />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map(([name, href]) => (
              <Link
                href={href}
                key={href}
                className={(aliases[pathname] || pathname) === href ? 'active' : undefined}
                aria-current={(aliases[pathname] || pathname) === href ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <a className="button small header-call" href={`tel:${site.phone}`}>
              <Phone size={16} /> Call us
            </a>
            <button
              className="menu-toggle icon-button"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              onClick={() => dialog.current?.showModal()}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>
      <dialog ref={dialog} className="mobile-menu" aria-label="Site navigation">
        <div className="mobile-menu-top">
          <Logo />
          <button
            className="icon-button"
            onClick={() => dialog.current?.close()}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <nav>
          {navigation.map(([name, href]) => (
            <Link href={href} key={href} onClick={() => dialog.current?.close()}>
              {name}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
        <a className="button" href={`tel:${site.phone}`}>
          <Phone size={17} /> Call us
        </a>
        <p>Your journey. Our priority.</p>
      </dialog>
    </>
  );
}
export function Footer() {
  const displayPhone = site.phone === '+919944942223' ? '+91 99449 42223' : site.phone;
  return (
    <footer className="footer legacy-footer" data-site-footer>
      <div className="container">
        <Reveal className="footer-intro">
          <div>
            <span className="footer-kicker">
              <Route size={16} /> Travel across South India
            </span>
            <h2>
              Your Journey.
              <br />
              <em>Our Priority.</em>
            </h2>
            <p>
              Intercity One Way Taxi connects major cities with dependable doorstep pickups,
              transparent estimates, experienced drivers and well-maintained cabs.
            </p>
          </div>
          <div className="footer-actions">
            <a href={`tel:${site.phone}`} className="button">
              <Phone size={17} /> Call to book
            </a>
            <Link href="/#start-journey" className="button button-outline">
              Get fare estimate <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>

        <section className="footer-cities" aria-labelledby="footer-routes-title">
          <div className="footer-city-heading">
            <div>
              <span className="eyebrow">SERVICE CITIES</span>
              <h2 id="footer-routes-title">Book from a major city</h2>
            </div>
            <p>Select your pickup city to begin.</p>
          </div>
          <div className="footer-city-grid">
            {footerCities.map((city, index) => (
              <Link href={bookingLink(city.pickup)} key={city.name}>
                <div>
                  <span className="footer-city-index">0{index + 1}</span>
                  <h3>{city.name}</h3>
                  <p>One-way taxis from {city.name}</p>
                </div>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        </section>

        <div className="footer-grid legacy-footer-grid">
          <div>
            <Link href="/" aria-label="Intercity Riders home">
              <Logo />
            </Link>
            <p>
              Comfortable one-way, outstation and airport taxi journeys across Tamil Nadu and
              neighbouring cities.
            </p>
            <div className="footer-assurances">
              <span>
                <ShieldCheck size={16} /> Verified drivers
              </span>
              <span>
                <Clock3 size={16} /> 24/7 assistance
              </span>
            </div>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/about-us">About us</Link>
            <Link href="/services">Our services</Link>
            <Link href="/tariff">Taxi tariff</Link>
            <Link href="/service-routes">All routes</Link>
            <Link href="/contact-us">Contact us</Link>
          </div>
          <div>
            <h3>Booking desk</h3>
            <a href={`tel:${site.phone}`}>
              <Phone size={16} /> {displayPhone}
            </a>
            <a href={`mailto:${site.email}`}>
              <Mail size={16} /> {site.email}
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=11.0168%2C76.9558"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={17} /> Coimbatore Dispatch Centre
            </a>
          </div>
          <div>
            <h3>Follow us</h3>
            <div className="footer-socials">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
            <Link href="/privacy" className="footer-privacy">
              Privacy policy <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Intercity One Way Taxi. All rights reserved.</span>
          <span>
            Designed and developed by{' '}
            <a href="https://wexoraa.com/" target="_blank" rel="noreferrer">
              Wexoraa Infotech
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
