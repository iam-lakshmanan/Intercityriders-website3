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
  MessageCircle,
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
        src="/images/newlogo-white.png"
        alt="One Way Drop Taxi"
        width={1984}
        height={793}
        sizes="(max-width: 640px) 164px, 204px"
        priority
      />
    </span>
  );
}
function SocialIcon({ label }: { label: string }) {
  if (label === 'Facebook') {
    return (
      <svg className="social-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.438H7.078v-3.489h3.047V9.413c0-3.025 1.792-4.696 4.533-4.696 1.312 0 2.686.236 2.686.236v2.97H15.83c-1.491 0-1.956.93-1.956 1.884v2.266h3.328l-.532 3.489h-2.796V24C19.612 23.093 24 18.098 24 12.073Z"
        />
      </svg>
    );
  }

  if (label === 'Twitter') {
    return (
      <svg className="social-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
        />
      </svg>
    );
  }

  return (
    <svg className="social-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"
      />
    </svg>
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
export function FloatingActions() {
  const whatsAppPhone = site.phone.replace(/\D/g, '');
  const whatsAppMessage = encodeURIComponent(
    'Hello, I would like to book a taxi with One Way Drop Taxi.',
  );

  return (
    <nav className="floating-contact-actions" aria-label="Quick contact actions">
      <a className="floating-contact-button call" href={`tel:${site.phone}`} aria-label="Call us">
        <Phone size={23} aria-hidden="true" />
        <span>Call us</span>
      </a>
      <a
        className="floating-contact-button whatsapp"
        href={`https://wa.me/${whatsAppPhone}?text=${whatsAppMessage}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle size={24} aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}

export function Footer() {
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
              <Phone size={16} /> {site.displayPhone}
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
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                >
                  <SocialIcon label={link.label} />
                  <span className="sr-only">{link.label}</span>
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
