import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-09-30.clover' as any 
});

export async function POST(req: NextRequest) {
  const { amount, paymentType } = await req.json();

  if (!amount || !paymentType) {
    return NextResponse.json({ error: 'Missing amount or paymentType' }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // EUR cents
    currency: 'eur',
    payment_method_types: ['card'],
    metadata: { paymentType },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
} 