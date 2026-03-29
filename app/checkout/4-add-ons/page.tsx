"use client";

import React, { useState } from "react";
import { useStore } from "../../../store/booking";
import BookingSummary from "../../../components/BookingSummary";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AddOnsStep() {
  const { addOns, selectedAddOns, toggleAddOn, people, addOnCounts, setAddOnCount } = useStore();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    router.push("/checkout/5-travellers");
  };

  const handleCount = (id: string, delta: number) => {
    const current = addOnCounts[id] || 0;
    let next = current + delta;
    if (next < 0) next = 0;
    if (next > people) next = people;
    setAddOnCount(id, next);
  };

  const handleToggle = (id: string) => {
    toggleAddOn(id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-screen max-w-7xl mx-auto px-2 sm:px-4">
      <div className="w-full lg:w-[70%] py-4 sm:py-6 lg:py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Select add-ons</h2>
        <div className="text-gray-500 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base">Select add-ons</div>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div></div>
          <div className="text-gray-500 font-semibold text-sm sm:text-base">Number of people</div>
        </div>
        <div className="flex flex-col gap-4 sm:gap-6">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="flex flex-col sm:flex-row bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-sm min-h-[160px] items-stretch"
            >
              <div className="relative w-full sm:w-1/3 h-48 sm:h-auto sm:min-w-[180px]">
                <Image
                  src={addOn.img}
                  alt={addOn.name}
                  fill
                  className="object-cover h-full w-full"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6">
                <div>
                  <div className="font-bold text-base sm:text-lg mb-1">{addOn.name}</div>
                  <div className="text-lapoint-red font-bold mb-2 text-sm sm:text-base">
                    {addOn.type === 'per-person' ? `+ ${addOn.price} EUR per person` : `+ 15% per booking`}
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm mb-2">
                    {addOn.type === 'per-person' ? (
                      <button
                        className="text-lapoint-red underline text-xs"
                        onClick={() => setExpanded(e => ({ ...e, [addOn.id]: !e[addOn.id] }))}
                      >
                        View more {expanded[addOn.id] ? '▲' : '▼'}
                      </button>
                    ) : (
                      <button
                        className="text-lapoint-red underline text-xs"
                        onClick={() => setExpanded(e => ({ ...e, [addOn.id]: !e[addOn.id] }))}
                      >
                        Terms & Conditions {expanded[addOn.id] ? '▲' : '▼'}
                      </button>
                    )}
                  </div>
                  {expanded[addOn.id] && (
                    <div className="text-gray-500 text-xs mb-2 border-t pt-2">{addOn.description}</div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  {addOn.type === 'per-person' ? (
                    <>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-lapoint-red text-lapoint-red flex items-center justify-center text-xl disabled:opacity-50 bg-white"
                        aria-label="Decrease number of people"
                        onClick={() => handleCount(addOn.id, -1)}
                        disabled={!(addOnCounts[addOn.id] > 0)}
                      >
                        –
                      </button>
                      <span className="w-8 text-center font-bold">{addOnCounts[addOn.id] || 0}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-xl disabled:opacity-50 bg-white"
                        aria-label="Increase number of people"
                        onClick={() => handleCount(addOn.id, 1)}
                        disabled={(addOnCounts[addOn.id] || 0) >= people}
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`border rounded-lg px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm w-full sm:w-auto ${selectedAddOns.includes(addOn.id) ? 'border-lapoint-red text-lapoint-red bg-red-50' : 'border-gray-400 text-gray-700 bg-white'}`}
                      onClick={() => handleToggle(addOn.id)}
                    >
                      {selectedAddOns.includes(addOn.id) ? 'Remove for booking' : 'Add for booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <BookingSummary buttonLabel="TRAVELLER DETAILS →" onButtonClick={handleNext} />
      </div>
    </div>
  );
} 