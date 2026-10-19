'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Users, Luggage, Check } from 'lucide-react';
import { vehicles, rates } from '@/lib/fare.mjs';
export function FleetShowcase() {
  const [selected, setSelected] = useState(0);
  const vehicle = vehicles[selected];
  const reduced = useReducedMotion();
  return (
    <div className="fleet-showcase">
      <div className="fleet-tabs" role="group" aria-label="Explore vehicle categories">
        {vehicles.map((v, i) => (
          <button
            type="button"
            key={v.id}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span>0{i + 1}</span>
            {v.label}
            {selected === i && (
              <motion.span
                layoutId="fleet-indicator"
                className="fleet-indicator"
                transition={{ duration: reduced ? 0 : 0.25 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="fleet-stage">
        <motion.div
          className="fleet-stage-image"
          key={vehicle.id}
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="fleet-watermark">GO WELL.</span>
          <Image
            src={vehicle.image}
            alt={`${vehicle.label} example vehicle`}
            width={700}
            height={410}
            sizes="(max-width:750px) 90vw, 50vw"
          />
        </motion.div>
        <div className="fleet-stage-copy">
          <span className="eyebrow">A GOOD PLACE TO BE</span>
          <h3>{vehicle.label}</h3>
          <p>{vehicle.note}</p>
          <div className="fleet-specs">
            <span>
              <Users size={18} />
              {vehicle.seats} passengers
            </span>
            <span>
              <Luggage size={18} />
              {vehicle.bags} bags
            </span>
          </div>
          <div className="fleet-price">
            <span>
              From <strong>₹{rates.oneway[vehicle.id as keyof typeof rates.oneway]}</strong> / km
            </span>
            <small>One way · 130 km minimum</small>
          </div>
          <Link className="button" href={`/booking?vehicle=${vehicle.id}`}>
            This is my kind of ride <ArrowUpRight size={19} />
          </Link>
          <p className="fine-print">
            <Check size={14} /> ₹400 driver allowance added to the estimate.
          </p>
        </div>
      </div>
      <p className="fleet-footnote">
        Example vehicles shown. Models subject to availability. Tolls, permits, parking and other
        applicable charges are extra.
      </p>
    </div>
  );
}
