"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useStore } from "../../../store/booking";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PaymentStep() {
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    summary,
    selectedPackage,
    arrivalDate,
    duration,
    roomAssignments,
    travellers,
    selectedAddOns,
    addOnCounts,
    insurance,
    paymentType,
    forceFullPayment,
    people,
    rooms,
    addOns,
  } = useStore();
  const router = useRouter();
  const total = summary?.total || 0;

  const handlePayPalSuccess = async (orderId: string) => {
    setProcessing(true);
    setPaypalError(null);

    try {
      const assignedRooms = Object.entries(roomAssignments)
        .filter(([_, count]) => count > 0)
        .map(([roomId]) => rooms.find((r) => r.id === roomId))
        .filter(Boolean);
      const selectedRoom = assignedRooms[0] || rooms[0];

      const DURATIONS: Record<string, number> = {
        "4d": 4, "1w": 7, "2w": 14, "3w": 21, "4w": 28,
      };
      const days = DURATIONS[duration] || 7;
      const arrival = new Date(arrivalDate || new Date().toISOString());
      const checkout = new Date(arrival);
      checkout.setDate(checkout.getDate() + days);

      const airportTransfer = selectedAddOns.includes("1");
      const primaryGuest = travellers && travellers.length > 0 ? travellers[0] : null;

      let guestAge: number | null = null;
      if (primaryGuest?.year && primaryGuest?.month && primaryGuest?.day) {
        const birthDate = new Date(
          parseInt(primaryGuest.year),
          parseInt(primaryGuest.month) - 1,
          parseInt(primaryGuest.day)
        );
        const today = new Date();
        guestAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          guestAge--;
        }
      }

      const bookingData = {
        packageId: selectedPackage?.id || "1",
        packageName: selectedPackage?.name || "",
        roomId: selectedRoom?.id || "1",
        roomName: selectedRoom?.name || "",
        arrivalDate: arrivalDate || new Date().toISOString(),
        checkoutDate: checkout.toISOString(),
        people: people || 1,
        travellers: (travellers || []).map((t: any) => ({
          name: t.name || `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Guest",
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          year: t.year,
          month: t.month,
          day: t.day,
          country: t.country,
          phone: t.phone || t.mobile,
          mobile: t.mobile || t.phone,
          surfLevel: t.surfLevel,
          gender: t.gender,
        })),
        total: total,
        insurance: insurance || false,
        airportTransfer: airportTransfer,
        paymentType: forceFullPayment ? "full" : paymentType || "full",
        addOns: selectedAddOns.map((addOnId) => ({ addOnId })),
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Échec de la création de la réservation");
      }

      const data = await response.json();
      setPaypalSuccess(true);
      setTimeout(() => {
        router.push(`/confirmation/${data.id}`);
      }, 2000);
    } catch (error) {
      setPaypalError(
        error instanceof Error
          ? `Paiement réussi, mais réservation échouée : ${error.message}. Veuillez contacter le support avec l'ID de commande : ${orderId}`
          : "Paiement réussi mais échec de la réservation. Veuillez contacter le support."
      );
      setProcessing(false);
    }
  };

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "EUR",
        intent: "capture",
      }}
    >
      <div className="min-h-screen bg-[#FFF9E8]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 sm:pt-8 pb-8 sm:pb-16">

          {/* Payment card */}
          <div className="bg-white rounded-2xl border border-gray-300 p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">
              Payer avec PayPal
            </h2>

            {/* Total */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <span className="text-sm sm:text-base font-medium text-gray-600">Montant total</span>
              <span className="text-base sm:text-lg font-bold">EUR {total}</span>
            </div>

            {/* PayPal Buttons */}
            <PayPalButtons
              style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
              forceReRender={[total]}
              createOrder={(_data: Record<string, unknown>, actions: any) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: total.toString(),
                        currency_code: "EUR",
                      },
                      description: `Réservation – ${selectedPackage?.name || "Pack"}`,
                    },
                  ],
                  application_context: {
                    brand_name: "Driftline",
                    landing_page: "BILLING",
                    user_action: "PAY_NOW",
                  },
                });
              }}
              onApprove={async (_data: Record<string, unknown>, actions: any) => {
                try {
                  const order = await actions.order?.capture();
                  if (order && order.id) {
                    await handlePayPalSuccess(order.id);
                  } else {
                    throw new Error("La capture de la commande a échoué");
                  }
                } catch (error) {
                  setPaypalError("Le paiement a échoué. Veuillez réessayer.");
                  setProcessing(false);
                }
              }}
              onError={() => {
                setPaypalError("Une erreur de paiement s'est produite. Veuillez réessayer.");
                setProcessing(false);
              }}
              onCancel={() => {
                setPaypalError(null);
                setProcessing(false);
              }}
            />

            {processing && (
              <div className="text-blue-600 font-bold mt-4 text-center">
                ⏳ Traitement de votre réservation en cours...
              </div>
            )}
            {paypalSuccess && (
              <div className="text-green-600 font-bold mt-4 text-center">
                ✅ Paiement réussi ! Redirection vers la confirmation...
              </div>
            )}
            {paypalError && (
              <div className="text-red-600 font-bold mt-4 text-center p-3 bg-red-50 rounded">
                ❌ {paypalError}
              </div>
            )}
          </div>



          {/* Payment logos */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 border border-gray-300 rounded-xl py-2 sm:py-3 mb-6 sm:mb-8 bg-white px-2 max-w-md mx-auto">
            <Image src="/images/mastercard.svg" alt="Mastercard" width={32} height={20} className="sm:w-10 sm:h-6" />
            <Image src="/images/visa.svg" alt="Visa" width={32} height={20} className="sm:w-10 sm:h-6" />
            <Image src="/images/paypal.svg" alt="PayPal" width={32} height={20} className="sm:w-10 sm:h-6" />
          </div>

          <div className="text-center text-gray-400 text-xs max-w-md mx-auto px-2">
            Paiement sécurisé via PayPal. Vos données de paiement sont protégées.
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}