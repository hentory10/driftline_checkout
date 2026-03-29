import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';
import { createClient } from '@supabase/supabase-js';

// Supabase client as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uakihwftirtauozffiuq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2lod2Z0aXJ0YXVvemZmaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTY1MjcsImV4cCI6MjA3Nzg5MjUyN30.F1lp2w00L0G1F7X7vRnPWerY2LBnmatoDIp-ApeM8oY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to generate sequential booking ID starting with 0001
async function generateSequentialBookingId(): Promise<string> {
  try {
    // Use Supabase SQL to get next ID from sequence
    const { data, error } = await supabase.rpc('generate_booking_id');
    
    if (!error && data) {
      return data;
    }
    
    // Fallback: get max sequential ID and increment
    const { data: bookings } = await supabase
      .from('Booking')
      .select('id')
      .order('id', { ascending: false })
      .limit(100);
    
    let nextNum = 1;
    if (bookings && bookings.length > 0) {
      // Find the highest sequential ID (format: 0001, 0002, etc.)
      const sequentialIds = bookings
        .map(b => b.id)
        .filter(id => /^\d{4}$/.test(id)) // Only 4-digit IDs
        .map(id => parseInt(id))
        .filter(num => !isNaN(num));
      
      if (sequentialIds.length > 0) {
        nextNum = Math.max(...sequentialIds) + 1;
      }
    }
    
    return String(nextNum).padStart(4, '0');
  } catch (error) {
    console.error('Error generating booking ID:', error);
    // Fallback: use timestamp last 4 digits
    const timestamp = Date.now().toString();
    return timestamp.slice(-4).padStart(4, '0');
  }
}

// Helper to generate UUID for travellers and add-ons
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(req: NextRequest) {
  let data: any = null;
  try {
    data = await req.json();

    // Extract booking data
    const {
      packageId,
      packageName,
      roomId,
      roomName,
      arrivalDate,
      checkoutDate,
      people,
      travellers = [],
      total,
      insurance,
      airportTransfer,
      paymentType,
      addOns = [],
    } = data;

    // Calculate duration
    const arrival = new Date(arrivalDate);
    const checkout = checkoutDate ? new Date(checkoutDate) : null;
    let duration: number | null = null;
    let durationLabel: string | null = null;
    if (checkout) {
      const diffTime = checkout.getTime() - arrival.getTime();
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
      const DURATIONS: Record<number, string> = {
        4: '4 days',
        7: '1 week',
        14: '2 weeks',
        21: '3 weeks',
        28: '4 weeks',
      };
      durationLabel = DURATIONS[duration] || `${duration} nights`;
    }

    // Aggregate traveller information
    const allTravellerNames = travellers.map((t: any) => {
      const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim();
      return fullName || t.name || 'Guest';
    }).join(', ');

    const allTravellerFirstNames = travellers.map((t: any) => t.firstName || '').filter(Boolean).join(', ');
    const allTravellerLastNames = travellers.map((t: any) => t.lastName || '').filter(Boolean).join(', ');
    const allTravellerEmails = travellers.map((t: any) => t.email || '').filter(Boolean).join(', ');
    const allTravellerPhones = travellers.map((t: any) => (t.phone || t.mobile || '')).filter(Boolean).join(', ');
    const allTravellerCountries = travellers.map((t: any) => t.country || '').filter(Boolean).join(', ');
    
    // Calculate ages from birth dates
    const allTravellerAges = travellers.map((t: any) => {
      if (t.year && t.month && t.day) {
        const birthDate = new Date(parseInt(t.year), parseInt(t.month) - 1, parseInt(t.day));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age.toString();
      }
      return '';
    }).filter(Boolean).join(', ');

    const allTravellerBirthDates = travellers.map((t: any) => {
      if (t.year && t.month && t.day) {
        return `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`;
      }
      return '';
    }).filter(Boolean).join(', ');

    const allTravellerSurfLevels = travellers.map((t: any) => t.surfLevel || '').filter(Boolean).join(', ');
    const allTravellerGenders = travellers.map((t: any) => t.gender || '').filter(Boolean).join(', ');

    // Get add-on details, package and room prices from database
    let addOnData: any[] = [];
    let packagePrice: number | null = null;
    let roomPrice: number | null = null;
    
    try {
      const [addOnResult, packageResult, roomResult] = await Promise.all([
        addOns.length > 0 
          ? supabase.from('AddOn').select('id, name, price').in('id', addOns.map((a: any) => a.addOnId))
          : Promise.resolve({ data: [] }),
        supabase.from('Package').select('price').eq('id', packageId).single(),
        supabase.from('Room').select('price').eq('id', roomId).single(),
      ]);
      
      addOnData = addOnResult.data || [];
      packagePrice = packageResult.data?.price || null;
      roomPrice = roomResult.data?.price || null;
    } catch (error) {
      console.error('Error fetching add-on/package/room details:', error);
    }

    // Aggregate add-on information
    const addOnIdsList: string[] = [];
    const addOnNamesList: string[] = [];
    let addOnsTotal = 0;
    
    if (addOnData.length > 0) {
      addOns.forEach((addOn: any) => {
        const addOnInfo = addOnData.find((a: any) => a.id === addOn.addOnId);
        if (addOnInfo) {
          addOnIdsList.push(addOnInfo.id);
          addOnNamesList.push(addOnInfo.name);
          addOnsTotal += addOnInfo.price || 0;
        }
      });
    }

    const addOnNames = addOnNamesList.join(', ');
    const addOnIds = addOnIdsList.join(', ');
    const addOnCount = addOns.length;

    // Calculate pricing breakdown
    const roomTotal = roomPrice ? roomPrice * people : 0;
    const packageTotal = packagePrice ? packagePrice * people : 0;
    const subtotal = packageTotal + roomTotal;
    const insuranceAmount = insurance ? Math.round(subtotal * 0.1) : 0; // 10% of subtotal
    const calculatedTotal = subtotal + addOnsTotal + insuranceAmount;

    // Validate required fields
    if (!packageId || !roomId || !arrivalDate || !people || !total) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Generate sequential booking ID starting with 0001
    const bookingId = await generateSequentialBookingId();
    
    // Try Prisma first, fallback to Supabase REST API
    try {
      // Try Prisma connection
      const booking = await prisma.booking.create({
        data: {
          id: bookingId,
          packageId,
          packageName: packageName || null,
          roomId,
          roomName: roomName || null,
          arrivalDate: new Date(arrivalDate),
          checkoutDate: checkoutDate ? new Date(checkoutDate) : null,
          duration: duration,
          durationLabel: durationLabel,
          people: parseInt(people.toString()),
          travellerCount: travellers.length || parseInt(people.toString()),
          allTravellerNames: allTravellerNames || null,
          allTravellerFirstNames: allTravellerFirstNames || null,
          allTravellerLastNames: allTravellerLastNames || null,
          allTravellerEmails: allTravellerEmails || null,
          allTravellerPhones: allTravellerPhones || null,
          allTravellerCountries: allTravellerCountries || null,
          allTravellerAges: allTravellerAges || null,
          allTravellerBirthDates: allTravellerBirthDates || null,
          allTravellerSurfLevels: allTravellerSurfLevels || null,
          allTravellerGenders: allTravellerGenders || null,
          addOnNames: addOnNames || null,
          addOnIds: addOnIds || null,
          addOnCount: addOnCount,
          packagePrice: packagePrice,
          roomPrice: roomPrice,
          subtotal: subtotal,
          addOnsTotal: addOnsTotal,
          insuranceAmount: insuranceAmount,
          total: parseInt(total.toString()),
          currency: 'EUR',
          insurance: insurance || false,
          airportTransfer: airportTransfer || false,
          paymentType: paymentType || 'full',
          bookingStatus: 'confirmed',
          travellers: {
            create: travellers.map((t: any) => ({
              name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Guest',
              firstName: t.firstName || null,
              lastName: t.lastName || null,
              email: t.email || null,
              year: t.year || null,
              month: t.month || null,
              day: t.day || null,
              country: t.country || null,
              phone: t.phone || t.mobile || null,
              surfLevel: t.surfLevel || null,
              gender: t.gender || null,
            })),
          },
          bookingAddOns: {
            create: addOns.map((addOn: { addOnId: string }) => ({
              addOnId: addOn.addOnId,
            })),
          },
        },
      });
    } catch (prismaError) {
      console.error('Prisma connection failed, using Supabase REST API fallback:', prismaError);
      
      // Fallback: Use Supabase REST API
      const { error: bookingError } = await supabase
        .from('Booking')
        .insert({
          id: bookingId,
          packageId,
          packageName: packageName || null,
          roomId,
          roomName: roomName || null,
          arrivalDate: new Date(arrivalDate).toISOString(),
          checkoutDate: checkoutDate ? new Date(checkoutDate).toISOString() : null,
          duration: duration,
          durationLabel: durationLabel,
          people: parseInt(people.toString()),
          travellerCount: travellers.length || parseInt(people.toString()),
          allTravellerNames: allTravellerNames || null,
          allTravellerFirstNames: allTravellerFirstNames || null,
          allTravellerLastNames: allTravellerLastNames || null,
          allTravellerEmails: allTravellerEmails || null,
          allTravellerPhones: allTravellerPhones || null,
          allTravellerCountries: allTravellerCountries || null,
          allTravellerAges: allTravellerAges || null,
          allTravellerBirthDates: allTravellerBirthDates || null,
          allTravellerSurfLevels: allTravellerSurfLevels || null,
          allTravellerGenders: allTravellerGenders || null,
          addOnNames: addOnNames || null,
          addOnIds: addOnIds || null,
          addOnCount: addOnCount,
          packagePrice: packagePrice,
          roomPrice: roomPrice,
          subtotal: subtotal,
          addOnsTotal: addOnsTotal,
          insuranceAmount: insuranceAmount,
          total: parseInt(total.toString()),
          currency: 'EUR',
          insurance: insurance || false,
          airportTransfer: airportTransfer || false,
          paymentType: paymentType || 'full',
          bookingStatus: 'confirmed',
        });

      if (bookingError) {
        throw new Error(`Supabase booking creation failed: ${bookingError.message}`);
      }

      // Create travellers with all fields
      if (travellers.length > 0) {
        const travellerInserts = travellers.map((t: any) => ({
          id: generateUUID(),
          name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Guest',
          firstName: t.firstName || null,
          lastName: t.lastName || null,
          email: t.email || null,
          year: t.year || null,
          month: t.month || null,
          day: t.day || null,
          country: t.country || null,
          phone: t.phone || t.mobile || null,
          surfLevel: t.surfLevel || null,
          gender: t.gender || null,
          bookingId: bookingId,
        }));

        const { error: travellerError } = await supabase
          .from('Traveller')
          .insert(travellerInserts);

        if (travellerError) {
          console.error('Traveller creation error:', travellerError);
        }
      }

      // Create booking add-ons
      if (addOns.length > 0) {
        const addOnInserts = addOns.map((addOn: { addOnId: string }) => ({
          id: generateUUID(),
          bookingId: bookingId,
          addOnId: addOn.addOnId,
        }));

        const { error: addOnError } = await supabase
          .from('BookingAddOn')
          .insert(addOnInserts);

        if (addOnError) {
          console.error('AddOn creation error:', addOnError);
        }
      }
    }

    return NextResponse.json({ id: bookingId });
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (data) {
      console.error('Received data:', JSON.stringify(data, null, 2));
    } else {
      console.error('Failed to parse request data');
    }
    return NextResponse.json(
      { 
        error: 'Failed to create booking', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 