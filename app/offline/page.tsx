import Link from 'next/link';
import { ArrowUpRight, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <section className="offline-page">
      <div>
        <span className="offline-icon">
          <WifiOff size={30} />
        </span>
        <span className="eyebrow">YOU’RE OFFLINE</span>
        <h1>Your journey is still here.</h1>
        <p>Reconnect to check live routes, calculate a fare, or send a booking request.</p>
        <Link href="/" className="button">
          Try the homepage <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
