import React from 'react';
import { content } from '../../../content';
import { prisma } from '../../../prisma/client';
import { createClient } from '@supabase/supabase-js';

// Supabase client as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uakihwftirtauozffiuq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2lod2Z0aXJ0YXVvemZmaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTY1MjcsImV4cCI6MjA3Nzg5MjUyN30.F1lp2w00L0G1F7X7vRnPWerY2LBnmatoDIp-ApeM8oY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  let booking: any = null;

  // Try Prisma first, fallback to Supabase REST API
  try {
    booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { travellers: true, package: true, room: true },
    });
  } catch (prismaError) {
    console.error('Prisma connection failed, using Supabase REST API fallback:', prismaError);
    
    // Fallback: Use Supabase REST API
    // Fetch booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('Booking')
      .select('*')
      .eq('id', params.id)
      .single();

    if (bookingError || !bookingData) {
      return (
        <main className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">{content.confirmation.notFoundTitle}</h1>
          <p>{content.confirmation.notFoundMessage}</p>
        </main>
      );
    }

    // Fetch related data separately
    const [packageData, roomData, travellersData] = await Promise.all([
      supabase.from('Package').select('*').eq('id', bookingData.packageId).single(),
      supabase.from('Room').select('*').eq('id', bookingData.roomId).single(),
      supabase.from('Traveller').select('*').eq('bookingId', bookingData.id),
    ]);

    // Transform Supabase data to match Prisma format
    booking = {
      id: bookingData.id,
      packageId: bookingData.packageId,
      roomId: bookingData.roomId,
      arrivalDate: new Date(bookingData.arrivalDate),
      people: bookingData.people,
      insurance: bookingData.insurance,
      paymentType: bookingData.paymentType,
      total: bookingData.total,
      createdAt: bookingData.createdAt ? new Date(bookingData.createdAt) : new Date(),
      package: packageData.data || null,
      room: roomData.data || null,
      travellers: travellersData.data || [],
    };
  }

  if (!booking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">{content.confirmation.notFoundTitle}</h1>
        <p>{content.confirmation.notFoundMessage}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">{content.confirmation.title}</h1>
      <p className="mb-6">{content.confirmation.description}</p>
      <div className="bg-white rounded shadow p-6 w-full max-w-lg">
        <div className="mb-2 font-semibold">{content.confirmation.bookingIdLabel}: <span className="font-mono">{booking.id}</span></div>
        <div className="mb-2">{content.confirmation.packageLabel}: {booking.package?.name || 'N/A'}</div>
        <div className="mb-2">{content.confirmation.roomLabel}: {booking.room?.name || 'N/A'}</div>
        <div className="mb-2">{content.confirmation.arrivalLabel}: {booking.arrivalDate.toLocaleDateString()}</div>
        <div className="mb-2">{content.confirmation.travellersLabel}: {booking.travellers?.length > 0 ? booking.travellers.map((t: { name: string }) => t.name).join(', ') : 'None'}</div>
        <div className="mb-2">{content.confirmation.totalLabel}: {booking.total} €</div>
      </div>
      <div className="mt-8 text-center text-gray-500">{content.confirmation.footer}</div>
    </main>
  );
} 