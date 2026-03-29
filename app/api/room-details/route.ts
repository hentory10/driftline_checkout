import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Supabase client as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uakihwftirtauozffiuq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2lod2Z0aXJ0YXVvemZmaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTY1MjcsImV4cCI6MjA3Nzg5MjUyN30.F1lp2w00L0G1F7X7vRnPWerY2LBnmatoDIp-ApeM8oY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing required parameter: roomId' },
        { status: 400 }
      );
    }

    // Try Prisma first, fallback to Supabase REST API
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          capacity: true,
        },
      });

      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(room);
    } catch (prismaError) {
      console.error('⚠️ Prisma connection failed, using Supabase REST API fallback');
      
      // Fallback: Use Supabase REST API
      const { data: room, error } = await supabase
        .from('Room')
        .select('id, name, description, price, capacity')
        .eq('id', roomId)
        .single();

      if (error || !room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(room);
    }
  } catch (error) {
    console.error('Room details check error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room details' },
      { status: 500 }
    );
  }
}

