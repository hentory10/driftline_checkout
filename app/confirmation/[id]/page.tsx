import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { content } from '../../../content';
import { createClient } from '@supabase/supabase-js';

// Prevent Next.js from statically generating this page
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzibwjzcuxpnjsgmzjku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TH6k4CH-NiM8hiUdMyEanQ_kG6ySQgC';

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  // Opt out of Next.js Data Cache — forces a real network call to Supabase every time
  noStore();

  // Create the client INSIDE the function so Next.js cannot cache its fetch calls at module level
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (url: RequestInfo | URL, init?: RequestInit) =>
        fetch(url, { ...init, cache: 'no-store' }),
    },
  });

  const { data: booking, error } = await supabase
    .from('Booking')
    .select('*, coach:YogaCoach(*)')
    .eq('id', params.id)
    .single();

  if (error || !booking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">{content.confirmation.notFoundTitle}</h1>
        <p>{content.confirmation.notFoundMessage}</p>
      </main>
    );
  }

  const isDeposit = booking.paymentType === 'deposit';
  // Use stored payment_amount / remaining_amount from DB; fall back to calculation if missing
  const depositAmount   = booking.payment_amount   ?? (isDeposit ? Math.round(booking.total * 0.2) : booking.total);
  const remainingAmount = booking.remaining_amount ?? (isDeposit ? booking.total - Math.round(booking.total * 0.2) : 0);

  // Extract date from ISO string directly to avoid UTC→local timezone shift
  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const [y, m, d] = iso.substring(0, 10).split('-');
    return `${d}/${m}/${y}`; // DD/MM/YYYY
  };
  const checkin = formatDate(booking.checkinDate);
  const checkout = formatDate(booking.checkoutDate);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">{content.confirmation.title}</h1>
      <p className="mb-6">{content.confirmation.description}</p>

      <div className="bg-white rounded shadow p-6 w-full max-w-lg">
        {/* Booking details */}
        <div className="mb-2 font-semibold">
          {content.confirmation.bookingIdLabel}: <span className="font-mono">{booking.id}</span>
        </div>
        <div className="mb-2">Package : {booking.packageName || 'N/A'}</div>
        <div className="mb-2">Arrivée : {checkin}</div>
        <div className="mb-2">Départ : {checkout}</div>
        <div className="mb-2">Durée : {booking.duration || '—'}</div>
        <div className="mb-2">Nombre de personnes : {booking.numberOfPeople}</div>

        {/* Transfer options */}
        {booking.transfer_options && (
          <div className="mb-2">
            Transferts : {booking.transfer_options
              .split(', ')
              .map((slug: string) => {
                const labels: Record<string, string> = {
                  marrakech_to_agadir: 'Transfer Marrakech Airport → Agadir (Aller)',
                  agadir_to_marrakech: 'Transfer Agadir → Marrakech Airport (Retour)',
                  agadir_airport_to_driftline: 'Transfer Agadir Airport ↔ Driftline (Gratuit)',
                };
                return labels[slug] || slug;
              })
              .join(' + ')}
          </div>
        )}

        {/* Coach details */}
        {booking.yogaCoachName && (
          <div className="mb-2">Coach Yoga : {booking.yogaCoachName}</div>
        )}
        {booking.yogaStudio && (
          <div className="mb-2">Studio : {booking.yogaStudio}</div>
        )}

        <hr className="my-4 border-gray-200" />

        {/* Payment breakdown */}
        {isDeposit ? (
          <>
            <div className="mb-2 flex justify-between">
              <span className="text-gray-600">Total de la réservation</span>
              <span className="font-semibold">{booking.total} {booking.currency}</span>
            </div>
            <div className="mb-2 flex justify-between text-green-700">
              <span className="font-semibold">✅ Acompte payé (20%)</span>
              <span className="font-bold">{depositAmount} {booking.currency}</span>
            </div>
            <div className="mb-2 flex justify-between text-orange-600">
              <span className="font-semibold">⏳ Solde restant à payer</span>
              <span className="font-bold">{remainingAmount} {booking.currency}</span>
            </div>
          </>
        ) : (
          <div className="mb-2 flex justify-between">
            <span className="font-semibold">✅ {content.confirmation.totalLabel}</span>
            <span className="font-bold">{booking.total} {booking.currency}</span>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500">{content.confirmation.footer}</div>
    </main>
  );
}