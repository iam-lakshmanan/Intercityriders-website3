'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { z } from 'zod';
import { tripSchema } from './validation.mjs';
export type TripForm = z.infer<typeof tripSchema>;
export type Receipt = { reference: string; total: number; vehicleLabel: string; tripLabel: string };
export type SavedBooking = {
  form?: TripForm;
  receipt?: Receipt;
  enquiryReference?: string;
  liveEstimateAvailable?: boolean;
  requestId: string;
  expires: number;
};
const key = 'intercity-riders-new-booking-v1';
const listeners = new Set<() => void>();
let volatile: string | null = null;
function subscribe(callback: () => void) {
  let timer: number | undefined;
  function schedule() {
    window.clearTimeout(timer);
    try {
      let raw: string | null;
      try {
        raw = sessionStorage.getItem(key) || volatile;
      } catch {
        raw = volatile;
      }
      const remaining = raw ? JSON.parse(raw).expires - Date.now() : 0;
      if (Number.isFinite(remaining) && remaining > 0)
        timer = window.setTimeout(update, remaining + 1);
    } catch {
      /* A malformed draft is ignored by the snapshot reader. */
    }
  }
  function update() {
    callback();
    schedule();
  }
  listeners.add(update);
  window.addEventListener('storage', update);
  schedule();
  return () => {
    window.clearTimeout(timer);
    listeners.delete(update);
    window.removeEventListener('storage', update);
  };
}
function snapshot() {
  let raw;
  try {
    raw = sessionStorage.getItem(key) || volatile;
  } catch {
    raw = volatile;
  }
  try {
    if (raw && JSON.parse(raw).expires > Date.now()) return raw;
    volatile = null;
    try {
      sessionStorage.removeItem(key);
    } catch {}
    return null;
  } catch {
    return null;
  }
}
export function saveBooking(data: SavedBooking) {
  volatile = JSON.stringify(data);
  try {
    sessionStorage.setItem(key, volatile);
  } catch {
    /* In-memory recovery if storage is unavailable. */
  }
  for (const callback of listeners) callback();
}
export function beginBooking(
  form: TripForm,
  requestId = crypto.randomUUID(),
  enquiryReference?: string,
  liveEstimateAvailable?: boolean,
) {
  const booking = {
    form,
    requestId,
    enquiryReference,
    liveEstimateAvailable,
    expires: Date.now() + 2 * 60 * 60 * 1000,
  };
  saveBooking(booking);
  return booking;
}
export function saveReceipt(receipt: Receipt, requestId: string) {
  saveBooking({ receipt, requestId, expires: Date.now() + 2 * 60 * 60 * 1000 });
}
export function useSavedBooking() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    try {
      return JSON.parse(raw || 'null') as SavedBooking | null;
    } catch {
      return null;
    }
  }, [raw]);
}
