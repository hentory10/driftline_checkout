import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Supabase client as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uakihwftirtauozffiuq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2lod2Z0aXJ0YXVvemZmaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTY1MjcsImV4cCI6MjA3Nzg5MjUyN30.F1lp2w00L0G1F7X7vRnPWerY2LBnmatoDIp-ApeM8oY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get Monday and Sunday of the week for a given date
function getWeekBounds(date: Date): { monday: Date; sunday: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const arrivalDate = searchParams.get('arrivalDate');

    console.log('🔵 Room availability API called with:', { roomId, arrivalDate });

    if (!roomId || !arrivalDate) {
      console.error('❌ Missing parameters:', { roomId, arrivalDate });
      return NextResponse.json(
        { error: 'Missing required parameters: roomId, arrivalDate' },
        { status: 400 }
      );
    }

    // Parse arrival date as local date (YYYY-MM-DD format) to avoid timezone issues
    const [year, month, day] = arrivalDate.split('-').map(Number);
    const arrival = new Date(year, month - 1, day);
    const { monday, sunday } = getWeekBounds(arrival);
    
    console.log('📅 Week bounds calculated:', {
      arrivalDate,
      parsedArrival: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      mondayLocal: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`,
      sundayLocal: `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`,
      mondayISO: monday.toISOString(),
      sundayISO: sunday.toISOString(),
    });

    // Try Prisma first, fallback to Supabase REST API
    let bookedBeds = 0;
    let usingSupabaseFallback = false;
    
    try {
      console.log('🔵 Attempting Prisma query...');
      // Find all bookings for this room that overlap with the week (Monday to Sunday)
      // A booking overlaps if it starts before or during the week and ends after or during the week
      const allBookings = await prisma.booking.findMany({
        where: {
          roomId: roomId,
          // Booking must start before or on Sunday of the week
          arrivalDate: { lte: sunday },
        },
        select: {
          people: true,
          arrivalDate: true,
          checkoutDate: true,
        },
      });
      
      console.log('✅ Prisma query successful, found bookings:', allBookings.length);

      // Filter bookings that overlap with the week (Monday to Sunday)
      const overlappingBookings = allBookings.filter((booking) => {
        // Parse booking dates as local dates (not UTC) to avoid timezone issues
        const bookingArrivalDate = new Date(booking.arrivalDate);
        const bookingArrivalStr = bookingArrivalDate.toISOString().split('T')[0];
        const [arrYear, arrMonth, arrDay] = bookingArrivalStr.split('-').map(Number);
        const bookingArrival = new Date(arrYear, arrMonth - 1, arrDay);
        bookingArrival.setHours(0, 0, 0, 0);
        
        let bookingCheckout: Date;
        if (booking.checkoutDate) {
          // Parse checkout date - handle both ISO strings and "YYYY-MM-DD HH:MM:SS" format
          let checkoutStr = booking.checkoutDate.toString();
          if (checkoutStr.includes('T')) {
            checkoutStr = checkoutStr.split('T')[0];
          } else if (checkoutStr.includes(' ')) {
            checkoutStr = checkoutStr.split(' ')[0];
          }
          const [checkYear, checkMonth, checkDay] = checkoutStr.split('-').map(Number);
          bookingCheckout = new Date(checkYear, checkMonth - 1, checkDay);
          // Checkout is the day guest leaves, so room is available starting on this day
          bookingCheckout.setHours(0, 0, 0, 0);
        } else {
          // If no checkout date, assume 7 days from arrival (arrival + 6 nights = checkout on day 7)
          bookingCheckout = new Date(bookingArrival);
          bookingCheckout.setDate(bookingCheckout.getDate() + 7);
          bookingCheckout.setHours(0, 0, 0, 0);
        }
        
        // Booking overlaps with week if the booking period intersects with the week period
        // Checkout date is exclusive - if checkout is Dec 8, the room is available starting Dec 8
        // So a booking from Dec 1-8 does NOT overlap with a week starting Dec 8
        // Overlap occurs when:
        // 1. Booking starts within the week (arrival >= monday AND arrival <= sunday), OR
        // 2. Booking starts before the week AND ends after the week starts (arrival < monday AND checkout > monday)
        // Note: If checkout equals monday, the room is available on monday, so no overlap
        const bookingStartsInWeek = bookingArrival >= monday && bookingArrival <= sunday;
        const bookingSpansWeekStart = bookingArrival < monday && bookingCheckout > monday;
        const bookingOverlapsWeek = bookingStartsInWeek || bookingSpansWeekStart;
        
        console.log('Checking booking overlap (Prisma):', {
          bookingArrival: bookingArrival.toISOString(),
          bookingCheckout: bookingCheckout.toISOString(),
          weekMonday: monday.toISOString(),
          weekSunday: sunday.toISOString(),
          overlaps: bookingOverlapsWeek,
        });
        
        return bookingOverlapsWeek;
      });

      bookedBeds = overlappingBookings.reduce((sum, booking) => sum + booking.people, 0);
      
      console.log('Triple room availability check:', {
        weekStart: monday.toISOString(),
        weekEnd: sunday.toISOString(),
        totalBookings: allBookings.length,
        overlappingBookings: overlappingBookings.length,
        bookedBeds,
        bookings: overlappingBookings.map(b => ({
          people: b.people,
          arrival: new Date(b.arrivalDate).toISOString(),
          checkout: b.checkoutDate ? new Date(b.checkoutDate).toISOString() : 'null'
        }))
      });
    } catch (prismaError) {
      console.error('⚠️ Prisma connection failed, using Supabase REST API fallback');
      usingSupabaseFallback = true;
      
      // Fallback: Use Supabase REST API
      // Get all bookings for this room
      console.log('🔵 Querying Supabase for roomId:', roomId);
      const { data: bookings, error } = await supabase
        .from('Booking')
        .select('people, arrivalDate, checkoutDate')
        .eq('roomId', roomId);
      
      console.log('🔵 Supabase query result:', { 
        bookingsCount: bookings?.length || 0, 
        error: error?.message 
      });

      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch room availability' },
          { status: 500 }
        );
      }

      // Filter bookings that overlap with the week (Monday to Sunday)
      const overlappingBookings = (bookings || []).filter((booking: any) => {
        // Parse booking dates - handle both ISO strings and "YYYY-MM-DD HH:MM:SS" format
        let bookingArrivalStr = booking.arrivalDate;
        if (bookingArrivalStr.includes('T')) {
          bookingArrivalStr = bookingArrivalStr.split('T')[0];
        } else if (bookingArrivalStr.includes(' ')) {
          bookingArrivalStr = bookingArrivalStr.split(' ')[0];
        }
        const [arrYear, arrMonth, arrDay] = bookingArrivalStr.split('-').map(Number);
        const bookingArrival = new Date(arrYear, arrMonth - 1, arrDay);
        bookingArrival.setHours(0, 0, 0, 0);
        
        let bookingCheckout: Date;
        if (booking.checkoutDate) {
          let checkoutStr = booking.checkoutDate;
          if (checkoutStr.includes('T')) {
            checkoutStr = checkoutStr.split('T')[0];
          } else if (checkoutStr.includes(' ')) {
            checkoutStr = checkoutStr.split(' ')[0];
          }
          const [checkYear, checkMonth, checkDay] = checkoutStr.split('-').map(Number);
          bookingCheckout = new Date(checkYear, checkMonth - 1, checkDay);
          // Checkout is the day guest leaves, so room is available starting on this day
          // Set to start of day for consistent comparison
          bookingCheckout.setHours(0, 0, 0, 0);
        } else {
          // If no checkout date, assume 7 days from arrival (arrival + 6 nights = checkout on day 7)
          bookingCheckout = new Date(bookingArrival);
          bookingCheckout.setDate(bookingCheckout.getDate() + 7);
          bookingCheckout.setHours(0, 0, 0, 0); // Checkout is start of day 7
        }
        
        // Booking overlaps with week if the booking period intersects with the week period
        // Checkout date is exclusive - if checkout is Dec 8, the room is available starting Dec 8
        // So a booking from Dec 1-8 does NOT overlap with a week starting Dec 8
        // Overlap occurs when:
        // 1. Booking starts within the week (arrival >= monday AND arrival <= sunday), OR
        // 2. Booking starts before the week AND ends after the week starts (arrival < monday AND checkout > monday)
        // Note: If checkout equals monday, the room is available on monday, so no overlap
        const bookingStartsInWeek = bookingArrival >= monday && bookingArrival <= sunday;
        const bookingSpansWeekStart = bookingArrival < monday && bookingCheckout > monday;
        const bookingOverlapsWeek = bookingStartsInWeek || bookingSpansWeekStart;
        
        console.log('Checking booking overlap (Supabase):', {
          bookingId: booking.id || 'unknown',
          bookingArrivalRaw: booking.arrivalDate,
          bookingArrivalParsed: `${arrYear}-${String(arrMonth).padStart(2, '0')}-${String(arrDay).padStart(2, '0')}`,
          bookingCheckoutRaw: booking.checkoutDate || 'null',
          bookingCheckoutParsed: bookingCheckout ? `${bookingCheckout.getFullYear()}-${String(bookingCheckout.getMonth() + 1).padStart(2, '0')}-${String(bookingCheckout.getDate()).padStart(2, '0')}` : 'null',
          weekMonday: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`,
          weekSunday: `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`,
          condition1: `${bookingArrival <= sunday}`,
          condition2: `${bookingCheckout > monday}`,
          overlaps: bookingOverlapsWeek,
        });
        
        return bookingOverlapsWeek;
      });

      bookedBeds = overlappingBookings.reduce((sum: number, booking: any) => sum + (booking.people || 0), 0);
      
      console.log('Triple room availability check (Supabase fallback):', {
        weekStart: monday.toISOString(),
        weekEnd: sunday.toISOString(),
        totalBookings: bookings?.length || 0,
        overlappingBookings: overlappingBookings.length,
        bookedBeds,
      });
    }

    // Determine total beds based on room ID
    // Room ID "1" = Tamazirt room - Oubaha (1 bed)
    // Room ID "2" = Triple room - Oubaha (3 beds)
    // Room ID "3" = Double room - Oubaha (1 bed)
    // Room ID "4" = Twin room - Oubaha (2 beds)
    // Room ID "6" = Ayour room - Bigdi (2 beds)
    // Room ID "7" = Tafokt room - Bigdi (1 bed)
    // Room ID "9" = Akal room - Bigdi (1 bed)
    // Room ID "10" = Amlal room - Bigdi (1 bed)
    const totalBeds = roomId === "2" ? 3 :
                      (roomId === "4" || roomId === "6") ? 2 :
                      (roomId === "1" || roomId === "3" || roomId === "7" || roomId === "9" || roomId === "10") ? 1 : 2; // Default to 2 for unknown rooms
    const availableBeds = Math.max(0, totalBeds - bookedBeds);
    const isFullyBooked = bookedBeds >= totalBeds;

    const response = {
      roomId,
      bookedBeds,
      availableBeds,
      totalBeds,
      isFullyBooked,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
    };

    console.log('Room availability response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Room availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check room availability' },
      { status: 500 }
    );
  }
}

