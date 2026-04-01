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
    router.push("/checkout/5-informations");
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
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Options de transfert</h2>
        <div className="text-gray-500 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base">Sélectionnez vos transferts (optionnel)</div>

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
                    {addOn.price === 0
                      ? <span className="text-green-600">✓ Gratuit — Inclus</span>
                      : (
                        <span>
                          + {addOn.price} EUR / véhicule
                          <span className="text-gray-500 font-normal text-xs ml-2">(25 EUR / pers.)</span>
                        </span>
                      )
                    }
                  </div>
                  <div className="text-gray-600 text-xs sm:text-sm mb-2">
                    <button
                      className="text-lapoint-red underline text-xs"
                      onClick={() => setExpanded(e => ({ ...e, [addOn.id]: !e[addOn.id] }))}
                    >
                      Voir les détails {expanded[addOn.id] ? '▲' : '▼'}
                    </button>
                  </div>
                  {expanded[addOn.id] && (
                    <div className="text-gray-500 text-xs mb-2 border-t pt-2">{addOn.description}</div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    className={`border rounded-lg px-3 sm:px-4 py-2 font-semibold text-xs sm:text-sm w-full sm:w-auto ${
                      selectedAddOns.includes(addOn.id)
                        ? 'border-green-500 text-green-700 bg-green-50'
                        : 'border-gray-400 text-gray-700 bg-white'
                    }`}
                    onClick={() => handleToggle(addOn.id)}
                  >
                    {selectedAddOns.includes(addOn.id) ? '✓ Ajouté' : addOn.price === 0 ? '+ Ajouter (gratuit)' : '+ Ajouter au séjour'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <BookingSummary buttonLabel="INFORMATIONS →" onButtonClick={handleNext} />
      </div>
    </div>
  );
} 