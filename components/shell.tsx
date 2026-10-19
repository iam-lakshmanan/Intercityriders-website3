'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { ArrowUpRight, Menu, X, Phone, MoveUpRight } from 'lucide-react';
import { site, navigation } from '@/lib/site';
import { Reveal } from './motion';
export function Logo() {
  return (
    <span className="wordmark">
      <span className="brand-symbol">
        <MoveUpRight strokeWidth={2.5} />
      </span>
      <span>
        intercity<span className="wordmark-small">RIDERS · GO WELL.</span>
      </span>
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
      <div className="topnote">
        <span>GOOD JOURNEYS START WITH GOOD COMPANY.</span>
        <a href={`tel:${site.phone}`}>
          Let’s talk travel <Phone size={12} />
        </a>
      </div>
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
                aria-current={(aliases[pathname] || pathname) === href ? 'page' : undefined}
              >
                {name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="button small" href="/booking">
              Book a ride <ArrowUpRight size={17} />
            </Link>
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
        <Link className="button" href="/booking" onClick={() => dialog.current?.close()}>
          Plan your ride <ArrowUpRight />
        </Link>
      </dialog>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Reveal>
          <div className="footer-invitation">
            <div>
              <span className="eyebrow">THE ROAD IS CALLING</span>
              <h2>
                A little further.
                <br />
                <em>A little better.</em>
              </h2>
            </div>
            <Link href="/booking" className="giant-arrow" aria-label="Book your next journey">
              <ArrowUpRight />
            </Link>
          </div>
        </Reveal>
        <div className="footer-grid">
          <div>
            <Link href="/" aria-label="Intercity Riders home">
              <Logo />
            </Link>
            <p>
              Thoughtfully arranged taxi journeys.
              <br />
              Across Tamil Nadu. Beyond the everyday.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <Link href="/about-us">Our story</Link>
            <Link href="/services">Ways to travel</Link>
            <Link href="/service-routes">Find your route</Link>
            <Link href="/service-areas">Where we go</Link>
          </div>
          <div>
            <h3>Your journey</h3>
            <Link href="/tariff">Fares, made clear</Link>
            <Link href="/airport-transfers">Airport transfers</Link>
            <Link href="/booking">Book a ride</Link>
            <Link href="/contact-us">Get in touch</Link>
          </div>
          <div>
            <h3>A real conversation</h3>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a
              href={`https://wa.me/${site.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Intercity Riders.</span>
          <span>Go somewhere. Feel something.</span>
          <Link href="/privacy">Privacy & your details</Link>
        </div>
      </div>
    </footer>
  );
}
