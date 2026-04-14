'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../store/booking';
import { useRouter } from 'next/navigation';
import { content } from '../../../content';
import ErrorSummary from '../../../components/ErrorSummary';
import BookingSummary from '../../../components/BookingSummary';

const DURATIONS = [
  { label: '4 jours (de mai à août)', value: '4d' },
  { label: '1 semaine', value: '1w' },
  { label: '2 semaines', value: '2w' },
  { label: '3 semaines', value: '3w' },
  { label: '4 semaines', value: '4w' },
];

export default function PackageStep() {
  const { packages, setPackage, selectedPackage, people, setPeople, duration, setDuration, childPeople, setChildPeople } = useStore();
  const [error, setError] = useState('');
  const router = useRouter();
  const durationRef = useRef<HTMLDivElement>(null);
  const [summaryTop, setSummaryTop] = useState(32);
  const [openIncluded, setOpenIncluded] = useState<string | null>(null);

  useEffect(() => {
    if (durationRef.current) {
      const rect = durationRef.current.getBoundingClientRect();
      setSummaryTop(rect.top + window.scrollY);
    }
  }, []);

  useEffect(() => {
    // Ensure '1 week' is selected by default
    if (duration !== '1w') {
      setDuration('1w');
    }
  }, [duration, setDuration]);

  const handleNext = () => {
    if (!selectedPackage) {
      setError(content.validation.packageRequired);
      return;
    }
    router.push('/checkout/2-dates');
  };

  // Per-package included items now live in store packages (pkg.includedItems)

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-screen max-w-7xl mx-auto px-2 sm:px-4">
        <div className="w-full lg:w-[70%] py-4 sm:py-6 lg:py-8">
        <div className="w-full mb-6 sm:mb-8" ref={durationRef}>
          <div className="mb-4 sm:mb-6">
            <div className="font-bold text-xl sm:text-2xl mb-2">Choisissez la durée</div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {DURATIONS.map(d => {
                const isDisabled = d.value !== '1w';
                return (
                  <button
                    key={d.value}
                    type="button"
                    className={`px-3 sm:px-6 py-2 rounded-lg border font-semibold transition-all text-xs sm:text-base ${duration === d.value ? 'bg-lapoint-red text-white border-lapoint-red' : 'bg-white text-lapoint-dark border-lapoint-border hover:bg-lapoint-yellow'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isDisabled && setDuration(d.value)}
                    disabled={isDisabled}
                    aria-pressed={duration === d.value}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full mb-4">
            <div className="rounded-full bg-yellow-300 px-3 sm:px-6 py-2 text-lapoint-dark text-[10px] sm:text-xs text-center" style={{ display: 'inline-block', width: '100%', fontWeight: 400 }}>
              <span className="font-bold">Si vous venez avec 8 étudiants, votre séjour est 100 % gratuit !</span>
            </div>
          </div>
        </div>
        <form
          aria-labelledby="package-step-title"
          onSubmit={e => {
            e.preventDefault();
            handleNext();
          }}
        >
          <h2 id="package-step-title" className="text-xl sm:text-2xl mb-3 sm:mb-4">Choisissez votre formule</h2>
          {error && <ErrorSummary message={error} />}
          <div className="space-y-4 sm:space-y-6">
            {packages.map(pkg => (
              <div key={pkg.id} className={`card flex flex-col gap-3 sm:gap-4 ${pkg.id === '4' ? (childPeople > 0 ? 'border-lapoint-red border-2' : '') : (selectedPackage?.id === pkg.id ? 'border-lapoint-red border-2' : '')}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                  <div className="flex flex-col w-full sm:min-w-[220px]">
                    <div className="text-base sm:text-lg font-bold mb-1">{pkg.name}</div>
                    {/* description removed per request */}
                    <div className="text-lapoint-red font-bold text-sm sm:text-base">À partir de {pkg.price} €</div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 sm:ml-auto w-full sm:w-auto">
                    <button
                      type="button"
                      className="btn-outline flex items-center justify-center gap-2 px-3 sm:px-6 py-2 text-xs sm:text-sm md:text-base font-semibold border-2 rounded-xl transition-all w-auto sm:w-auto whitespace-nowrap"
                      onClick={() => setOpenIncluded(openIncluded === pkg.id ? null : pkg.id)}
                      aria-pressed={openIncluded === pkg.id}
                    >
                      {pkg.id === '4' ? 'Conditions' : 'Ce qui est inclus'}
                      <span className={`transition-transform ${openIncluded === pkg.id ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    <div className="flex items-center justify-end sm:justify-start gap-2 w-auto sm:w-auto ml-auto sm:ml-0">
                      {pkg.id === '4' ? (
                        // ── ENFANT counter (independent, capped at min(2, 8 - adults)) ──
                        <>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-xl disabled:opacity-50"
                            aria-label="Decrease number of children"
                            onClick={() => setChildPeople(Math.max(0, childPeople - 1))}
                            disabled={childPeople <= 0}
                          >
                            –
                          </button>
                          <span className="w-8 text-center font-bold">{childPeople}</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-lapoint-red text-white bg-lapoint-red flex items-center justify-center text-xl disabled:opacity-50"
                            aria-label="Increase number of children"
                            disabled={childPeople >= Math.min(2, 8 - (selectedPackage?.id === '3' ? people : 0))}
                            onClick={() => {
                              const maxChildren = Math.min(2, 8 - (selectedPackage?.id === '3' ? people : 0));
                              if (childPeople < maxChildren) setChildPeople(childPeople + 1);
                            }}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        // ── ADULT counter (capped at 8 - childPeople) ──
                        <>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-xl disabled:opacity-50"
                            aria-label="Decrease number of people"
                            onClick={() => setPeople(Math.max(1, people - 1))}
                            disabled={selectedPackage?.id !== pkg.id || people <= 1}
                          >
                            –
                          </button>
                          <span className="w-8 text-center font-bold">{selectedPackage?.id === pkg.id ? people : 0}</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-lapoint-red text-white bg-lapoint-red flex items-center justify-center text-xl disabled:opacity-50"
                            aria-label="Increase number of people"
                            disabled={selectedPackage?.id === pkg.id && people >= 8 - childPeople}
                            onClick={() => {
                              if (selectedPackage?.id === pkg.id) {
                                if (people < 8 - childPeople) setPeople(people + 1);
                              } else {
                                setPackage(pkg.id);
                                setPeople(1);
                              }
                            }}
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {openIncluded === pkg.id && (
                  <div className="w-full mt-2 border-t pt-4">
                    {pkg.id === '4' ? (
                      <ul className="space-y-2">
                        {[
                          { label: 'Âge', text: 'Les enfants doivent avoir entre 8 et 15 ans' },
                          { label: 'Maximum', text: 'Maximum 2 enfants par groupe' },
                          { label: 'Supervision', text: "Les enfants sont entièrement sous la responsabilité de leurs parents ou tuteurs à tout moment" },
                          { label: 'Natation', text: "L'enfant doit être un nageur à l'aise en mer" },
                          { label: 'Participation', text: "Les sessions de surf et de yoga sont conçues pour les adultes ; l'enfant y participe à la discrétion et aux risques de ses parents" },
                          { label: 'Pas d\'activité seul', text: "L'enfant ne peut assister à aucune session sans la présence de son parent" },
                          { label: 'Hébergement', text: "L'enfant partage la chambre avec son parent (aucun lit supplémentaire fourni sauf demande explicite et disponibilité)" },
                          { label: 'Tarif', text: '355 € pour les moins de 16 ans, 495 € pour les 16 ans et plus' },
                          { label: 'Limite de groupe', text: 'Maximum 2 enfants par réservation de groupe' },
                          { label: 'Droit de refus', text: 'Driftline se réserve le droit de refuser une réservation enfant si elle affecte l\'expérience du groupe' },
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-base">
                            <svg className="mt-1 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#111"/><path d="M6 10.5L9 13.5L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <span><span className="font-semibold">{item.label}</span> — {item.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <>
                        <div className="font-semibold mb-2 text-base">Inclus par semaine</div>
                        <ul className="space-y-2">
                          {(pkg.includedItems || []).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-base">
                              <svg className="mt-1 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#111"/><path d="M6 10.5L9 13.5L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 font-bold italic text-lapoint-red" style={{ fontSize: '1rem' }}>
                          <span className="font-bold">NOTE :</span> Si vous venez avec 8 étudiants, veuillez calculer le total sur la base de 8 participants uniquement. Votre séjour sera entièrement offert.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </form>
        </div>
        <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
          <BookingSummary buttonLabel="SÉLECTION DES DATES →" onButtonClick={handleNext} />
        </div>
    </div>
  );
} 