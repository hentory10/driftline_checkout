'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../../store/booking';
import { useRouter } from 'next/navigation';
import ErrorSummary from '../../../components/ErrorSummary';
import BookingSummary from '../../../components/BookingSummary';

const DURATIONS: Record<string, number> = {
  '4d': 4,
  '1w': 7,
  '2w': 14,
  '3w': 21,
  '4w': 28,
};

function parseLocalDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
  }

// Helper to format a Date as YYYY-MM-DD in local timezone (not UTC)
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
  
function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const matrix = [];
  let week = [];
  let d = new Date(firstDay);
  // Start from the Monday before or on the 1st
  const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(1 - dayOfWeek);
  for (let i = 0; i < 6 * 7; i++) {
    week.push(new Date(d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
    d.setDate(d.getDate() + 1);
  }
  return matrix;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(day: Date, start: Date, end: Date) {
  return day >= start && day <= end;
}

export default function DateStep() {
  const { arrivalDate, setArrivalDate, selectedPackage, people, duration } = useStore();
  const [error, setError] = useState('');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]); // YYYY-MM-DD strings from DB

  useEffect(() => { setIsClient(true); }, []);

  // Fetch already-booked dates from the database
  useEffect(() => {
    fetch('/api/booked-dates', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setBookedDates(data.bookedDates || []))
      .catch(() => setBookedDates([]));
  }, []);

  // Clear any stored arrival date that isn't a Saturday (stale from previous Monday-based logic)
  useEffect(() => {
    if (arrivalDate) {
      const stored = parseLocalDate(arrivalDate);
      if (stored.getDay() !== 6) { // 6 = Saturday
        setArrivalDate('');
      }
    }
  }, []);

  const days = DURATIONS[duration] || 7;
  const checkIn = arrivalDate ? parseLocalDate(arrivalDate) : null;
  let checkOut = checkIn ? new Date(checkIn) : null;
  if (checkOut) {
    // Checkout is on day 7 of the stay (check-in = day 1)
    // So we add (days - 1) to check-in to land on the last day
    checkOut.setDate(checkOut.getDate() + (days - 1));
  }
  
  /*if (checkOut) {
    if (days === 4) {
      checkOut.setDate(checkOut.getDate() + 4);
    } else {
      // For week-based durations, always go to the next Monday
      checkOut.setDate(checkOut.getDate() + Math.round(days / 7) * 7);
    }
  }*/

  // Calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to midnight

  // Option B: next upcoming Saturday (skip today even if today IS Saturday)
  const dayOfWeek = today.getDay(); // 0=Sun ... 6=Sat
  const daysUntilNextSat = dayOfWeek === 6 ? 7 : (6 - dayOfWeek);
  const firstAvailableSaturday = new Date(today);
  firstAvailableSaturday.setDate(today.getDate() + daysUntilNextSat);

  const [monthOffset, setMonthOffset] = useState(0);
  const leftMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const rightMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 1);
  const leftMatrix = useMemo(() => getMonthMatrix(leftMonth.getFullYear(), leftMonth.getMonth()), [leftMonth]);
  const rightMatrix = useMemo(() => getMonthMatrix(rightMonth.getFullYear(), rightMonth.getMonth()), [rightMonth]);

  const handleSelect = (day: Date) => {
    if (day.getDay() !== 6) return; // Only Saturdays
    // Use formatLocalDate instead of toISOString to avoid UTC conversion issues
    setArrivalDate(formatLocalDate(day));
    setError('');
  };

  const handleNext = () => {
    if (!arrivalDate) {
      setError('Please select a start date.');
      return;
    }
    router.push('/checkout/5-informations');
  };

  const TIMEZONE = 'Africa/Casablanca';

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-screen max-w-7xl mx-auto px-2 sm:px-4">
      <div className="w-full lg:w-[70%] py-4 sm:py-6 lg:py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Sélectionnez les dates</h2>
        {error && <ErrorSummary message={error} />}
        <div className="mb-6 sm:mb-8">
          {isClient && (
            <>

              {/* Discount banner */}
              <div className="w-full mb-4">
                <div className="rounded-full bg-yellow-300 px-3 sm:px-6 py-2 text-lapoint-dark text-[10px] sm:text-xs text-center" style={{ display: 'inline-block', width: '100%', fontWeight: 400 }}>
                  <span className="font-bold">Si vous venez avec 8 étudiants, votre séjour est 100 % gratuit !</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:gap-6 w-full">
                <div className="flex items-center justify-between w-full mb-2">
                  <button
                    onClick={() => setMonthOffset(m => m - 1)}
                    aria-label="Previous month"
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-lapoint-red text-white shadow hover:scale-105 transition flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                      <path d="M20 8L12 16L20 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="flex-1 flex justify-center sm:justify-between items-center gap-2 sm:gap-4 md:gap-8 px-2">
                    {[leftMonth, rightMonth].map((month, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="text-center font-bold mb-2 text-sm sm:text-base md:text-xl">
                          {month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setMonthOffset(m => m + 1)}
                    aria-label="Next month"
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-lapoint-red text-white shadow hover:scale-105 transition flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                      <path d="M12 8L20 16L12 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Always side-by-side — fixes the vertical stacking bug */}
                <div className="flex flex-row gap-2 sm:gap-4 lg:gap-6 xl:gap-8 w-full">
                  {[{ matrix: leftMatrix, month: leftMonth }, { matrix: rightMatrix, month: rightMonth }].map(({ matrix, month }, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-2 sm:p-4 border flex-1 min-w-0">
                      <div className="grid grid-cols-7 text-center text-gray-400 mb-1 text-[10px] sm:text-sm md:text-base lg:text-lg font-semibold">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => <div key={i} className="px-0.5 sm:px-1">{d}</div>)}
                      </div>
                      {matrix.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 text-center">
                          {week.map((day, di) => {
                            const isCurrentMonth = day.getMonth() === month.getMonth();
                            const isSaturday = day.getDay() === 6;
                            const isPastDay = day < firstAvailableSaturday;
                            const dayStr = formatLocalDate(day);
                            const isBooked = bookedDates.includes(dayStr);
                            // Block April (3) through August (7) 2026 as closed season
                            const isBlockedSeason = day.getFullYear() === 2026 && day.getMonth() >= 3 && day.getMonth() <= 7;
                            const isUnavailable = isPastDay || isBooked || isBlockedSeason;
                            const isDisabled = !isCurrentMonth || !isSaturday || isUnavailable;
                            const isAvailableSaturday = isSaturday && !isUnavailable;
                            const isSelected = checkIn && isSameDay(day, checkIn) && isSaturday;
                            const isCheckOut = checkOut && isSameDay(day, checkOut) && isSaturday;
                            const isInSelectedRange = checkIn && checkOut && day >= checkIn && day <= checkOut;
                            return (
                              <button
                                key={di}
                                type="button"
                                className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full mx-auto my-0.5 sm:my-1 text-[10px] sm:text-sm font-semibold transition-all
                                  ${!isCurrentMonth ? 'invisible' : ''}
                                  ${isUnavailable && isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                                  ${isUnavailable && isCurrentMonth ? 'line-through' : ''}
                                  ${isInSelectedRange ? 'bg-lapoint-yellow text-lapoint-dark' : ''}
                                  ${isSelected ? 'bg-lapoint-red !border-lapoint-red !border-2 selected-date-text text-white' : ''}
                                  ${isCheckOut ? 'border-2 border-lapoint-red' : ''}
                                  ${isAvailableSaturday && isCurrentMonth ? 'border border-lapoint-red' : ''}
                                `}
                                disabled={isDisabled}
                                onClick={() => handleSelect(day)}
                                aria-label={day.toLocaleDateString('en-GB', { timeZone: TIMEZONE })}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <BookingSummary buttonLabel="INFORMATIONS →" onButtonClick={handleNext} />
      </div>
    </div>
  );
} 