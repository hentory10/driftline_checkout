import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Always fetch fresh data — never use cached response
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzibwjzcuxpnjsgmzjku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TH6k4CH-NiM8hiUdMyEanQ_kG6ySQgC';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Parse a YYYY-MM-DD date string as a local Date (UTC noon to avoid timezone shifts)
function parseUTCDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// Format a UTC Date object as YYYY-MM-DD
function formatUTCDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    // Fetch ALL bookings (all statuses) with their check-in and check-out dates
    const { data, error } = await supabase
      .from('Booking')
      .select('checkinDate, checkoutDate');

    if (error) throw error;

    const bookedDates: string[] = [];

    (data || []).forEach((row: any) => {
      if (!row.checkinDate || !row.checkoutDate) return;

      const checkin = parseUTCDate(row.checkinDate.slice(0, 10));
      const checkout = parseUTCDate(row.checkoutDate.slice(0, 10));

      // Gray out every day from check-in through check-out (inclusive).
      // The checkout date is also blocked — new guests cannot select it as check-in.
      const current = new Date(checkin);
      while (current <= checkout) {
        bookedDates.push(formatUTCDate(current));
        current.setUTCDate(current.getUTCDate() + 1);
      }
    });

    return NextResponse.json({ bookedDates }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'Surrogate-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    return NextResponse.json({ bookedDates: [] });
  }
}
