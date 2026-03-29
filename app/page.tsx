"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#FFF9E8" }}
    >
      <div className="flex flex-col items-center text-center px-4 max-w-xl mx-auto">
        {/* Logo */}
        <Image
          src="/images/logo.webp"
          alt="Driftline"
          width={100}
          height={100}
          className="mb-6"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Surfez sur des vagues parfaites dans une eau chaude.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-base sm:text-lg mb-8">
          Découvrez nos séjours surf & yoga pour tous les niveaux.
          Réservez votre aventure en quelques minutes.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/checkout/1-package")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-md mb-6"
        >
          Réserver maintenant
        </button>

        {/* Trust line */}
        <p className="text-gray-400 text-sm">
          Paiement sécurisé &bull; Dates flexibles &bull; Aucun frais caché
        </p>
      </div>
    </div>
  );
}