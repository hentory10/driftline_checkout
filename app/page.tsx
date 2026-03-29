import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { content } from '../content';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <Image 
          src="/images/LOGO-CHECKOUT.webp" 
          alt="Logo" 
          width={100} 
          height={100} 
          priority 
          className="object-contain w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          style={{ display: 'block' }}
        />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center px-4">{content.landing.headline}</h1>
      <p className="mb-6 sm:mb-8 text-base sm:text-lg text-center max-w-xl px-4">{content.landing.subheadline}</p>
      <Link
        href="/checkout/1-package"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
        aria-label={content.landing.cta}
      >
        {content.landing.cta}
      </Link>
      <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 text-center px-4">{content.landing.reassurance}</div>
    </main>
  );
} 