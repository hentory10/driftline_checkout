'use client';

import React, { ReactNode } from 'react';
import ProgressBar from '../../components/ProgressBar';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '../../store/booking';

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearRoomData, clearAddOnData, clearTravellerData, clearDateData } = useStore();
  const showBackArrow = pathname !== '/checkout/1-package';

  const handleBackNavigation = () => {
    // Clear data based on current step when going back
    if (pathname.includes('/checkout/2-dates')) {
      clearDateData();
    } else if (pathname.includes('/checkout/3-room')) {
      clearRoomData();
    } else if (pathname.includes('/checkout/4-add-ons')) {
      clearAddOnData();
    } else if (pathname.includes('/checkout/5-travellers')) {
      clearTravellerData();
    }
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex items-center justify-center pt-2 sm:pt-4 pb-1 sm:pb-2">
        <Image 
          src="/images/LOGO-CHECKOUT.webp" 
          alt="Logo" 
          width={70} 
          height={70} 
          priority 
          className="object-contain w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
          style={{ display: 'block' }}
        />
      </div>
      <div className="w-full max-w-7xl mx-auto pb-2 px-2 sm:px-4">
        {showBackArrow && (
          <button
            onClick={handleBackNavigation}
            aria-label="Go back"
            className="p-1 sm:p-2 mb-1 sm:mb-2"
          >
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-10 sm:h-10">
              <g>
                <path d="M28 20H12" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round"/>
                <path d="M18 14L12 20L18 26" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
          </button>
        )}
        <ProgressBar />
      </div>
      <div className="flex-1 p-2 sm:p-4">{children}</div>
    </div>
  );
} 