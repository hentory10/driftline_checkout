import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../prisma/client';

export async function GET(req: NextRequest) {
  const packageId = req.nextUrl.searchParams.get('packageId');
  const people = Number(req.nextUrl.searchParams.get('people') || 1);

  if (!packageId) {
    return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
  }

  // Option B: always start from the NEXT upcoming Saturday (never today, never past)
  // If today is Saturday (day 6), we skip it and go to next Saturday (+7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilNextSaturday = dayOfWeek === 6
    ? 7                    // today IS Saturday → skip it, use next week
    : (6 - dayOfWeek);     // days left until Saturday this week

  const firstSaturday = new Date(today);
  firstSaturday.setDate(today.getDate() + daysUntilNextSaturday);

  const saturdays: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(firstSaturday);
    d.setDate(firstSaturday.getDate() + i * 7);
    saturdays.push(d.toISOString().split('T')[0]);
  }

  // Simulate some sold out dates
  const soldOut = [saturdays[2], saturdays[5], saturdays[8]];

  return NextResponse.json({
    available: saturdays.filter(d => !soldOut.includes(d)),
    soldOut,
  });
} 