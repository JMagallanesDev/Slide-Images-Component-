"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import FeaturedPlaces, { DEFAULT_PLACES, type Place } from "@/components/FeaturedPlaces";

/** Base de las copias locales de las fotos de ejemplo (solo para este demo). */
const PREVIEW_ORIGIN = "http://localhost:3100";

export default function Home() {
  const [dark, setDark] = useState(false);

  // Toggle de tema del DEMO (no forma parte del componente).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Mismos datos de DEFAULT_PLACES, pero apuntando a /public/places/N.jpg.
  // Se usa URL absoluta porque el schema Zod exige z.string().url().
  const places = useMemo<Place[]>(
    () =>
      DEFAULT_PLACES.map((place, i) => ({
        ...place,
        imageUrl: `${PREVIEW_ORIGIN}/places/${i + 1}.jpg`,
      })),
    [],
  );

  return (
    <main className="flex-1 bg-[#FAF9F7] dark:bg-[#0A0A0A]">
      <div className="flex justify-end px-4 pt-4 sm:px-5 lg:px-6">
        <button
          type="button"
          onClick={() => setDark((v) => !v)}
          aria-label={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-[#333] shadow-sm dark:border-white/15 dark:bg-[#161616] dark:text-white"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      <FeaturedPlaces
        places={places}
        onSeeAll={() => console.log("Ver todos")}
        onToggleFavorite={(id, fav) => console.log("favorito:", id, fav)}
      />
    </main>
  );
}
