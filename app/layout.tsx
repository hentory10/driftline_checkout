import './globals.css';
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
  adjustFontFallback: true,
});

export const metadata = {
  title: 'Surf Camp Booking',
  description: 'Book your perfect surf camp experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 