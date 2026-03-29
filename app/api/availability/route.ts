import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';

export async function GET(req: NextRequest) {
  const packageId = req.nextUrl.searchParams.get('packageId');
  const people = Number(req.nextUrl.searchParams.get('people') || 1);

  if (!packageId) {
    return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
  }

  // Demo: return next 12 Saturdays, some sold out
  const today = new Date();
  const saturdays: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + ((6 - d.getDay() + 7 * i) % 7));
    saturdays.push(d.toISOString().split('T')[0]);
  }

  // Simulate some sold out dates
  const soldOut = [saturdays[2], saturdays[5], saturdays[8]];

  return NextResponse.json({
    available: saturdays.filter(d => !soldOut.includes(d)),
    soldOut,
  });
} 