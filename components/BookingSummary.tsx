'use client';

import React from 'react';
import { useStore } from '../store/booking';
import { content } from '../content';
import { usePathname } from 'next/navigation';

export default function BookingSummary({ buttonLabel = 'ROOM SELECTION →', onButtonClick }: { buttonLabel?: string; onButtonClick?: () => void }) {
  const { summary, selectedPackage, arrivalDate, selectedRoom, people, selectedAddOns, addOns, rooms, roomAssignments, addOnCounts, duration } = useStore();
  const pathname = usePathname();
  const [buttonEnabled, setButtonEnabled] = React.useState(false);

  // Duration mapping (same as 2-dates page)
  const DURATIONS: Record<string, number> = {
    '4d': 4,
    '1w': 7,
    '2w': 14,
    '3w': 21,
    '4w': 28,
  };

  // Format dates for display (using same logic as 2-dates page)
  let dateLabel = '-';
  if (arrivalDate && selectedPackage) {
    const days = DURATIONS[duration] || 7;
    
    // Parse the date string directly to avoid any timezone issues
    const [checkInYear, checkInMonth, checkInDay] = arrivalDate.split('-').map(Number);
    
    // Checkout = check-in + (days - 1): day 1 is check-in, day N is checkout
    const checkOutDate = new Date(checkInYear, checkInMonth - 1, checkInDay + (days - 1));
    const checkOutYear = checkOutDate.getFullYear();
    const checkOutMonth = checkOutDate.getMonth() + 1;
    const checkOutDay = checkOutDate.getDate();

    // Format duration label
    const durationLabel = days === 4 ? '4 days' : days === 7 ? '1 week' : `${days} nights`;
    
    // Format dates directly from the date components (no Date object conversion)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const checkInFormatted = `${checkInDay} ${months[checkInMonth - 1]}`;
    const checkOutFormatted = `${checkOutDay} ${months[checkOutMonth - 1]} ${checkOutYear}`;
    
    dateLabel = `${durationLabel}, ${checkInFormatted} - ${checkOutFormatted}`;
  }

  // Dynamic button enabling based on current step
  const getButtonEnabled = () => {
    if (pathname.includes('/checkout/1-package')) {
      return !!selectedPackage;
    } else if (pathname.includes('/checkout/2-dates')) {
      return !!arrivalDate;
    } else if (pathname.includes('/checkout/3-room')) {
      return Object.values(roomAssignments).some(n => n > 0);
    } else if (pathname.includes('/checkout/4-add-ons')) {
      return selectedAddOns.length > 0 || Object.values(addOnCounts).some(n => n > 0);
    }
    return false;
  };

  React.useEffect(() => {
    setButtonEnabled(getButtonEnabled());
  }, [pathname, selectedPackage, arrivalDate, roomAssignments, selectedAddOns, addOnCounts]);

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Récapitulatif du séjour</h2>
      <div className="bg-white border border-gray-300 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Vos choix</div>
        <div className="mb-3 sm:mb-4">
          <div className="font-semibold text-sm sm:text-base mb-1">Voyageurs et activités</div>
          <div className="text-sm sm:text-base">
            <span>{selectedPackage ? `${people} x ${selectedPackage.name}` : '-'}</span>
          </div>
        </div>
        <hr className="my-2" />
        <div className="mb-3 sm:mb-4">
          <div className="font-semibold text-sm sm:text-base mb-1">Dates</div>
          <span className="text-sm sm:text-base">{dateLabel}</span>
        </div>
        {/* <hr className="my-2" /> hidden with Chambres */}
        {/* Chambres section hidden */}
        {false && (
        <div className="mb-3 sm:mb-4">
          <div className="font-semibold text-sm sm:text-base mb-1">Chambres</div>
          <span className="text-sm sm:text-base break-words">
            {roomAssignments && Object.values(roomAssignments).some(n => n > 0)
              ? Object.entries(roomAssignments)
                  .filter(([_, n]) => n > 0)
                  .map(([roomId, n]) => {
                    const room = rooms.find(r => r.id === roomId);
                    return room ? `${n} x ${room.name}` : null;
                  })
                  .filter(Boolean)
                  .join(', ')
              : '-'}
          </span>
        </div>
        )}
        <hr className="my-2" />
        {/* Options choisies section */}
        <div>
          <div className="font-semibold text-sm sm:text-base mb-1">Options choisies</div>
          {selectedAddOns.length > 0 ? (
            <div className="space-y-1">
              {selectedAddOns.map(id => {
                const addOn = addOns.find(a => a.id === id);
                if (!addOn) return null;
                if (addOn.type === 'per-person') {
                  const count = addOnCounts[id] || 0;
                  if (count === 0) return null;
                  return (
                    <div key={id} className="text-sm sm:text-base">
                      <span>{count} x {addOn.name}</span>
                    </div>
                  );
                } else if (addOn.type === 'per-booking') {
                  return (
                    <div key={id} className="text-sm sm:text-base">
                      <span>{addOn.name}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <span className="text-sm sm:text-base text-gray-400">Aucune option sélectionnée</span>
          )}
        </div>
      </div>
      {/* Hide total and button on step 5 (travellers page) */}
      {!pathname.includes('/checkout/5-informations') && (
        <>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <span className="text-sm sm:text-base font-medium">Montant total à payer</span>
            <span className="text-base sm:text-lg font-bold">EUR {summary.total}</span>
          </div>
          <button
            className={`w-full font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-xl mb-4 sm:mb-6 flex items-center justify-center gap-2 transition-colors ${buttonEnabled ? 'bg-lapoint-red text-white' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
            onClick={onButtonClick}
            disabled={!buttonEnabled}
          >
            {buttonLabel}
          </button>
        </>
      )}
      {!pathname.includes('/checkout/5-informations') && (
        <>
          <hr className="mb-3 sm:mb-4" />
          <div className="flex gap-4 sm:gap-6 justify-center items-center mb-2">
            <img src="/images/paypal.svg" alt="PayPal" className="h-8 sm:h-10" />
            <img src="/images/mastercard.svg" alt="Mastercard" className="h-8 sm:h-10" />
            <img src="/images/visa.svg" alt="Visa" className="h-8 sm:h-10" />
          </div>
        </>
      )}
    </div>
  );
} 