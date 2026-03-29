"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../store/booking";
import BookingSummary from "../../../components/BookingSummary";

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const monthsList = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
const daysList = Array.from({ length: 31 }, (_, i) => i + 1);
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
const genders = ["Homme", "Femme", "Autre"];

interface CoachForm {
  firstName: string;
  lastName: string;
  email: string;
  year: string;
  month: string;
  day: string;
  country: string;
  phone: string;
  studioName: string;
  gender: string;
  notes: string;
}

const empty: CoachForm = {
  firstName: '', lastName: '', email: '', year: '', month: '', day: '',
  country: '', phone: '', studioName: '', gender: '', notes: ''
};

export default function InformationsStep() {
  const { summary, setTraveller, discountCode, setDiscountCode, appliedDiscount, setAppliedDiscount, setPaymentType } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<CoachForm>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof CoachForm, string>>>({});
  const [showDiscount, setShowDiscount] = useState(false);
  const [showGiftcard, setShowGiftcard] = useState(false);
  const [localDiscountCode, setLocalDiscountCode] = useState(discountCode || "");
  const [discountMessage, setDiscountMessage] = useState("");
  const [giftcard, setGiftcard] = useState("");

  const set = (field: keyof CoachForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof CoachForm, string>> = {};
    if (!form.firstName.trim() || form.firstName.trim().length < 2)
      e.firstName = 'Le prénom doit comporter au moins 2 caractères';
    if (!form.lastName.trim() || form.lastName.trim().length < 2)
      e.lastName = 'Le nom doit comporter au moins 2 caractères';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Veuillez saisir une adresse e-mail valide';
    if (!form.year || !form.month || !form.day)
      e.day = 'Veuillez saisir votre date de naissance complète';
    if (!form.country) e.country = 'Veuillez sélectionner un pays';
    if (!form.phone || !/^\d{7,15}$/.test(form.phone.replace(/[\s\-\(\)]/g, '')))
      e.phone = 'Veuillez saisir un numéro de téléphone valide (7 à 15 chiffres)';
    if (!form.gender) e.gender = 'Veuillez sélectionner votre genre';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formComplete =
    form.firstName && form.lastName && form.email &&
    form.year && form.month && form.day &&
    form.country && form.phone && form.gender;

  const handleNext = (type: 'deposit' | 'full') => {
    if (!validate()) return;
    // Save payment type in store
    setPaymentType(type);
    // Save coach as traveller 0
    setTraveller(0, {
      name: `${form.firstName} ${form.lastName}`.trim(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      year: form.year,
      month: form.month,
      day: form.day,
      country: form.country,
      mobile: form.phone,
      phone: form.phone,
      surfLevel: '',
      gender: form.gender,
    });
    router.push('/checkout/6-payment');
  };

  const handleApplyDiscount = () => {
    const code = localDiscountCode.trim().toUpperCase();
    if (code === "TEST") {
      setDiscountCode(code);
      setAppliedDiscount(15);
      setDiscountMessage("Code de réduction appliqué ! Une remise de 15 % a été appliquée à votre réservation.");
      setLocalDiscountCode(code);
    } else if (code === "") {
      setDiscountMessage("Veuillez saisir un code de réduction.");
    } else {
      setDiscountMessage("Code de réduction invalide. Veuillez réessayer.");
      setDiscountCode("");
      setAppliedDiscount(0);
    }
  };

  const inputClass = (field: keyof CoachForm) =>
    `border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base ${errors[field] ? 'border-red-500' : ''}`;

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-screen max-w-7xl mx-auto px-2 sm:px-4">
      <div className="w-full lg:w-[70%] py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-2xl border border-gray-300 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
            Coach Yoga — <span className="font-normal">Informations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* First name */}
            <div>
              <input type="text" className={inputClass('firstName')} placeholder="Prénom"
                value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            {/* Last name */}
            <div>
              <input type="text" className={inputClass('lastName')} placeholder="Nom de famille"
                value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <input type="email" className={inputClass('email')} placeholder="Adresse e-mail"
                value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <input type="tel" className={inputClass('phone')} placeholder="Numéro de téléphone"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Birthday */}
            <div>
              <div className="flex gap-2">
                <select className={`border rounded-lg px-1 sm:px-2 py-2 sm:py-3 w-1/3 text-xs sm:text-sm ${errors.day ? 'border-red-500' : ''}`}
                  value={form.year} onChange={e => set('year', e.target.value)}>
                  <option value="">Année</option>
                  {years.map(y => <option key={y}>{y}</option>)}
                </select>
                <select className={`border rounded-lg px-2 py-3 w-1/3 ${errors.day ? 'border-red-500' : ''}`}
                  value={form.month} onChange={e => set('month', e.target.value)}>
                  <option value="">Mois</option>
                  {monthsList.map((m, i) => <option key={i}>{m}</option>)}
                </select>
                <select className={`border rounded-lg px-2 py-3 w-1/3 ${errors.day ? 'border-red-500' : ''}`}
                  value={form.day} onChange={e => set('day', e.target.value)}>
                  <option value="">Jour</option>
                  {daysList.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              {errors.day && <p className="text-red-500 text-sm mt-1">{errors.day}</p>}
            </div>

            {/* Country */}
            <div>
              <select className={inputClass('country')} value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="">Pays</option>
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* Studio name */}
            <div>
              <input type="text" className={inputClass('studioName')} placeholder="Nom du studio (optionnel)"
                value={form.studioName} onChange={e => set('studioName', e.target.value)} />
            </div>

            {/* Gender */}
            <div>
              <select className={inputClass('gender')} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Genre</option>
                {genders.map(g => <option key={g}>{g}</option>)}
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <textarea
              className="border rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base resize-none"
              rows={4}
              placeholder="Notes ou demandes particulières (optionnel) — décrivez vos besoins, attentes ou toute autre information utile..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <BookingSummary />
        <div className="mb-4 sm:mb-6 mt-3 sm:mt-4 space-y-2">
          {(summary.discount ?? 0) > 0 && (
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600">Remise ({appliedDiscount}%)</span>
              <span className="text-green-600 font-semibold">-EUR {summary.discount}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium">Montant total à payer</span>
            <span className="text-base sm:text-lg font-bold">EUR {summary.total}</span>
          </div>
        </div>

        {/* Discount code */}
        <div className="mb-3 sm:mb-4">
          <div className="rounded-2xl border border-lapoint-border bg-[#FFFCF5]">
            <button className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base focus:outline-none rounded-2xl"
              onClick={() => setShowDiscount(v => !v)}>
              Ajouter un code de réduction
              <span className="text-sm text-gray-500">{showDiscount ? '▲' : '▼'}</span>
            </button>
            {showDiscount && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <input className="border border-lapoint-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 w-full mb-2 bg-[#FFFCF5] mt-3 sm:mt-4 text-sm sm:text-base"
                  placeholder="Entrez votre code de réduction"
                  value={localDiscountCode}
                  onChange={e => { setLocalDiscountCode(e.target.value); setDiscountMessage(""); }}
                />
                {discountMessage && (
                  <p className={`text-xs sm:text-sm mb-2 ${discountMessage.includes("appliqué") ? "text-green-600" : "text-red-600"}`}>
                    {discountMessage}
                  </p>
                )}
                <button className="w-full bg-lapoint-red text-white font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-full" onClick={handleApplyDiscount}>
                  APPLIQUER <span className="text-xl leading-none">+</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gift card */}
        <div className="mb-3 sm:mb-4">
          <div className="rounded-2xl border border-lapoint-border bg-[#FFFCF5]">
            <button className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base focus:outline-none rounded-2xl"
              onClick={() => setShowGiftcard(v => !v)}>
              Ajouter une carte cadeau
              <span className="text-sm text-gray-500">{showGiftcard ? '▲' : '▼'}</span>
            </button>
            {showGiftcard && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <input className="border border-lapoint-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 w-full mb-2 bg-[#FFFCF5] mt-3 sm:mt-4 text-sm sm:text-base"
                  placeholder="Entrez votre code carte cadeau"
                  value={giftcard} onChange={e => setGiftcard(e.target.value)} />
                <button className="w-full bg-lapoint-red text-white font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-full">
                  AJOUTER CARTE CADEAU <span className="text-xl leading-none">+</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-start gap-2 mb-2 mt-3 sm:mt-4">
          <input type="checkbox" className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 mt-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm">J'accepte par la présente les <a href="#" className="underline text-lapoint-red">conditions générales</a> et la <a href="#" className="underline text-lapoint-red">politique de confidentialité</a> de Driftline.</span>
        </div>
        <div className="flex items-start gap-2 mb-3 sm:mb-4">
          <input type="checkbox" className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 mt-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm">Je souhaite rejoindre la communauté de membres <a href="#" className="underline text-lapoint-red">Driftline</a> (c'est gratuit !) et recevoir des réductions et avantages exclusifs par e-mail. Vous pouvez vous désinscrire à tout moment.</span>
        </div>

        {/* Payment buttons */}
        <div className="mb-3 sm:mb-4">
          <button className="w-full font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-xl mb-3 sm:mb-4 flex items-center justify-center gap-2 transition-colors bg-white text-lapoint-red border border-lapoint-red disabled:opacity-50 disabled:cursor-not-allowed"
            type="button" disabled={!formComplete} onClick={() => handleNext('deposit')}>
            PAYER 20% — EUR {Math.round(summary.total * 0.2)} <span className="text-xl sm:text-2xl">→</span>
          </button>
          <button className="w-full font-bold text-sm sm:text-base py-2.5 sm:py-3 rounded-xl mb-3 sm:mb-4 flex items-center justify-center gap-2 transition-colors bg-lapoint-red text-white disabled:opacity-50 disabled:cursor-not-allowed"
            type="button" disabled={!formComplete} onClick={() => handleNext('full')}>
            PAYER EN INTÉGRALITÉ EUR {summary.total} <span className="text-xl sm:text-2xl">→</span>
          </button>
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm font-semibold">Veuillez corriger les erreurs ci-dessus avant de continuer</p>
            </div>
          )}
          <hr className="my-4 border-gray-200" />
          <div className="flex gap-6 justify-center items-center mb-2">
            <img src="/images/paypal.svg" alt="PayPal" className="h-10" />
            <img src="/images/mastercard.svg" alt="Mastercard" className="h-10" />
            <img src="/images/visa.svg" alt="Visa" className="h-10" />
          </div>
          <hr className="my-4 border-gray-200" />
        </div>
      </div>
    </div>
  );
}