import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Stripe payment has been replaced by PayPal in this application.
  return NextResponse.json(
    { error: 'This endpoint is no longer in use. Payments are handled via PayPal.' },
    { status: 410 }
  );
}