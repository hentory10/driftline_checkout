import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzibwjzcuxpnjsgmzjku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TH6k4CH-NiM8hiUdMyEanQ_kG6ySQgC';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate sequential booking ID: 0001, 0002, ...
async function generateBookingId(): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('generate_booking_id');
    if (!error && data) return data;

    // Fallback: manual increment
    const { data: bookings } = await supabase
      .from('Booking')
      .select('id')
      .order('id', { ascending: false })
      .limit(100);

    let nextNum = 1;
    if (bookings && bookings.length > 0) {
      const nums = bookings
        .map((b: any) => b.id)
        .filter((id: string) => /^\d{4}$/.test(id))
        .map((id: string) => parseInt(id))
        .filter((n: number) => !isNaN(n));
      if (nums.length > 0) nextNum = Math.max(...nums) + 1;
    }
    return String(nextNum).padStart(4, '0');
  } catch {
    return Date.now().toString().slice(-4).padStart(4, '0');
  }
}

export async function POST(req: NextRequest) {
  let data: any = null;
  try {
    data = await req.json();

    const {
      packageName,
      arrivalDate,
      checkoutDate,
      duration,
      people,
      travellers = [],       // travellers[0] is the coach from step 5
      total,
      paymentType,
      payment_amount: rawPaymentAmount,
      remaining_amount: rawRemainingAmount,
    } = data;

    // Calculate payment_amount / remaining_amount server-side if not provided by client
    const totalInt = parseInt(total?.toString() || '0');
    const isDeposit = (paymentType || 'full') === 'deposit';
    const paymentAmount  = rawPaymentAmount  != null ? parseInt(rawPaymentAmount.toString())  : (isDeposit ? Math.round(totalInt * 0.2) : totalInt);
    const remainingAmount = rawRemainingAmount != null ? parseInt(rawRemainingAmount.toString()) : (isDeposit ? Math.round(totalInt * 0.8) : 0);

    // --- 1. Create the YogaCoach record from step-5 form data ---
    const coach = travellers[0] || {};
    const coachName = `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Guest';

    const { data: coachRecord, error: coachError } = await supabase
      .from('YogaCoach')
      .insert({
        firstName:  coach.firstName  || null,
        lastName:   coach.lastName   || null,
        email:      coach.email      || null,
        phone:      coach.phone || coach.mobile || null,
        birthYear:  coach.year       || null,
        birthMonth: coach.month      || null,
        birthDay:   coach.day        || null,
        country:    coach.country    || null,
        studioName: coach.studioName || null,
        gender:     coach.gender     || null,
        notes:      coach.notes      || null,
      })
      .select('id, studioName')
      .single();

    if (coachError) {
      throw new Error(`YogaCoach creation failed: ${coachError.message}`);
    }

    // --- 2. Generate booking ID ---
    const bookingId = await generateBookingId();

    // --- 3. Build duration label ---
    const DURATIONS: Record<string, string> = {
      '4d': '4 jours', '1w': '1 semaine', '2w': '2 semaines',
      '3w': '3 semaines', '4w': '4 semaines',
    };
    const durationLabel = DURATIONS[duration] || duration || null;

    // --- 4. Create the Booking record ---
    const { error: bookingError } = await supabase
      .from('Booking')
      .insert({
        id:               bookingId,
        packageName:      packageName || null,
        checkinDate:      arrivalDate ? new Date(arrivalDate).toISOString() : new Date().toISOString(),
        checkoutDate:     checkoutDate ? new Date(checkoutDate).toISOString() : null,
        duration:         durationLabel,
        numberOfPeople:   parseInt(people?.toString() || '1'),
        yogaCoachId:      coachRecord.id,
        yogaCoachName:    coachName,
        yogaStudio:       coachRecord.studioName || null,
        paymentType:      paymentType || 'full',
        total:            totalInt,
        payment_amount:   paymentAmount,
        remaining_amount: remainingAmount,
        currency:         'EUR',
        bookingStatus:    'confirmed',
      });

    if (bookingError) {
      throw new Error(`Supabase booking creation failed: ${bookingError.message}`);
    }

    // --- 5. Fire n8n webhook (non-blocking — booking is confirmed regardless) ---
    const N8N_WEBHOOK_URL = 'https://skiki.app.n8n.cloud/webhook/eb196efb-842e-4532-b2f8-4b8338719e5c';
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          packageName:      packageName || null,
          checkinDate:      arrivalDate || null,
          checkoutDate:     checkoutDate || null,
          duration:         durationLabel,
          numberOfPeople:   parseInt(people?.toString() || '1'),
          total:            totalInt,
          currency:         'EUR',
          paymentType:      paymentType || 'full',
          payment_amount:   paymentAmount,
          remaining_amount: remainingAmount,
          bookingStatus:    'confirmed',
          coach: {
            firstName:  coach.firstName  || null,
            lastName:   coach.lastName   || null,
            email:      coach.email      || null,
            phone:      coach.phone || coach.mobile || null,
            country:    coach.country    || null,
            studioName: coach.studioName || null,
            gender:     coach.gender     || null,
            notes:      coach.notes      || null,
          },
        }),
      });
      console.log(`n8n webhook called successfully for booking ${bookingId}`);
    } catch (webhookError) {
      // Webhook failure doesn't block the booking — just log it
      console.error(`n8n webhook failed for booking ${bookingId}:`, webhookError);
    }

    return NextResponse.json({ id: bookingId });

  } catch (error) {
    console.error('Booking creation error:', error);
    if (data) console.error('Received data:', JSON.stringify(data, null, 2));
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}