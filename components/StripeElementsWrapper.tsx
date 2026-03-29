'use client';

import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { content } from '../content';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ amount, onSuccess, onError, paymentType }: { amount: number; onSuccess: (id: string) => void; onError: (msg: string) => void; paymentType: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentType }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [amount, paymentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });
    setLoading(false);
    if (error) {
      onError(error.message || content.paymentStep.error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Save booking (simulate, should send booking data)
      const res = await fetch('/api/booking', { method: 'POST', body: JSON.stringify({ /* ...booking data... */ }) });
      const data = await res.json();
      onSuccess(data.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label={content.paymentStep.formLabel}>
      <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={loading || !stripe || !elements}
      >
        {loading ? content.paymentStep.processing : content.paymentStep.payNow}
      </button>
    </form>
  );
}

export default function StripeElementsWrapper(props: any) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
} 