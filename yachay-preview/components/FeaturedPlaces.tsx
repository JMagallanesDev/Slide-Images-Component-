'use client';

/**
 * Yachay Ayacucho — Sección "Lugares patrimoniales destacados".
 *
 * Componente 100% autónomo: todo el estilo vive aquí (valores hardcodeados con
 * utilidades Tailwind 4). No adopta tokens de tema globales ni reutiliza otros
 * componentes de UI del proyecto.
 *
 * Dependencias: next/image, lucide-react, zod, embla-carousel-react@8.6.0,
 * embla-carousel-auto-scroll.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { z } from 'zod';
import { ArrowRight, Church, Heart, Landmark, MapPin, Mountain, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   Datos                                    */
/* -------------------------------------------------------------------------- */

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['iglesia', 'mirador', 'museo']),
  imageUrl: z.string().url(),
  location: z.string(),
  distance: z.string(),
  rating: z.number(),
  isOpen: z.boolean(),
  isFavorite: z.boolean().optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

export const PlacesSchema = z.array(PlaceSchema);

type CategoryMeta = { readonly label: string; readonly Icon: LucideIcon };

const CATEGORY_META: Readonly<Record<Place['category'], CategoryMeta>> = {
  iglesia: { label: 'Iglesia', Icon: Church },
  mirador: { label: 'Mirador', Icon: Mountain },
  museo: { label: 'Museo', Icon: Landmark },
};

/** Datos de ejemplo para previsualizar sin backend (replican la referencia). */
export const DEFAULT_PLACES: readonly Place[] = [
  {
    id: 'catedral-ayacucho',
    name: 'Catedral de Ayacucho',
    category: 'iglesia',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Catedral_de_Ayacucho_%2839517588591%29.jpg/960px-Catedral_de_Ayacucho_%2839517588591%29.jpg',
    location: 'Centro histórico',
    distance: '400 m',
    rating: 4.8,
    isOpen: true,
  },
  {
    id: 'mirador-acuchimay',
    name: 'Mirador de Acuchimay',
    category: 'mirador',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/b6/Mirador_del_Cerro_Acuchimay.jpg',
    location: 'Acuchimay',
    distance: '2.1 km',
    rating: 4.9,
    isOpen: true,
  },
  {
    id: 'templo-san-francisco',
    name: 'Templo de San Francisco',
    category: 'iglesia',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Iglesia_de_San_Francisco_de_As%C3%ADs%2C_Huamanga%2C_Ayacucho.jpg/960px-Iglesia_de_San_Francisco_de_As%C3%ADs%2C_Huamanga%2C_Ayacucho.jpg',
    location: 'Centro histórico',
    distance: '550 m',
    rating: 4.7,
    isOpen: true,
  },
  {
    id: 'museo-arte-popular',
    name: 'Museo de Arte Popular',
    category: 'museo',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Casona_Bosa_y_Sol%C3%ADs%2C_Ayacucho%2C_Per%C3%BA.jpg/960px-Casona_Bosa_y_Sol%C3%ADs%2C_Ayacucho%2C_Per%C3%BA.jpg',
    location: 'Santa Ana',
    distance: '650 m',
    rating: 4.6,
    isOpen: true,
  },
  {
    id: 'arco-del-triunfo',
    name: 'Arco del Triunfo',
    category: 'mirador',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Arco_de_Triunfo_de_Ayacucho.jpg/960px-Arco_de_Triunfo_de_Ayacucho.jpg',
    location: 'Plaza Mayor',
    distance: '300 m',
    rating: 4.5,
    isOpen: true,
  },
  {
    id: 'casona-boza-solis',
    name: 'Casona Boza y Solís',
    category: 'museo',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Casona_donde_funcion%C3%B3_la_Universidad_San_Crist%C3%B3bal_de_Huamanga.jpg/960px-Casona_donde_funcion%C3%B3_la_Universidad_San_Crist%C3%B3bal_de_Huamanga.jpg',
    location: 'Portal Constitución',
    distance: '180 m',
    rating: 4.4,
    isOpen: false,
  },
  {
    id: 'templo-santo-domingo',
    name: 'Templo de Santo Domingo',
    category: 'iglesia',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Templo_de_Santo_Domingo%2C_Ayacucho_-_Per%C3%BA.jpg/960px-Templo_de_Santo_Domingo%2C_Ayacucho_-_Per%C3%BA.jpg',
    location: 'Jr. 9 de Diciembre',
    distance: '480 m',
    rating: 4.6,
    isOpen: true,
  },
];

/** Ids de los lugares que llegan ya marcados como favoritos. */
function buildFavoriteIds(list: readonly Place[]): ReadonlySet<string> {
  return new Set(list.filter((place) => place.isFavorite).map((place) => place.id));
}

/* -------------------------------------------------------------------------- */
/*                                   Props                                    */
/* -------------------------------------------------------------------------- */

export interface FeaturedPlacesProps {
  /** Lista de lugares (validada con Zod). Si se omite, usa DEFAULT_PLACES. */
  places?: readonly Place[];
  /** Callback del enlace "Ver todos". */
  onSeeAll?: () => void;
  /** Se dispara al marcar/desmarcar un favorito. */
  onToggleFavorite?: (placeId: string, isFavorite: boolean) => void;
  /** Velocidad de la marquesina (px por frame). Valor bajo = movimiento lento. */
  autoScrollSpeed?: number;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Componente                                 */
/* -------------------------------------------------------------------------- */

export default function FeaturedPlaces({
  places,
  onSeeAll,
  onToggleFavorite,
  autoScrollSpeed = 0.55,
  className = '',
}: FeaturedPlacesProps) {
  /* Validación defensiva: si los datos llegan mal formados caemos al ejemplo. */
  const items = useMemo<readonly Place[]>(() => {
    const parsed = PlacesSchema.safeParse(places ?? DEFAULT_PLACES);
    return parsed.success && parsed.data.length > 0 ? parsed.data : DEFAULT_PLACES;
  }, [places]);

  /* --------------------------- Auto-scroll + loop --------------------------- */

  // Embla en modo loop + plugin AutoScroll: desplazamiento CONTINUO tipo
  // marquesina (no avanza de a un slide).
  //  · stopOnMouseEnter  -> pausa al hover, reanuda al salir.
  //  · stopOnInteraction:false -> tras un drag o una flecha, el auto-scroll sigue.
  //  · dragFree + containScroll:false -> arrastre libre y última card cortada.
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      dragFree: true,
      containScroll: false,
      skipSnaps: true,
      watchDrag: true,
    },
    [
      AutoScroll({
        speed: autoScrollSpeed, // velocidad baja: recorrido suave y constante
        startDelay: 0,
        direction: 'forward',
        playOnInit: true,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );

  // Duplicamos la lista (se renderiza dos veces): con `loop: true` Embla
  // reposiciona los slides de forma imperceptible al cerrar el ciclo, y el doble
  // de tarjetas garantiza que el viewport nunca quede vacío → bucle sin salto.
  const loopItems = useMemo(
    () => [...items, ...items].map((place, index) => ({ place, index })),
    [items],
  );

  /* -------------------------- prefers-reduced-motion ------------------------ */

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (): void => setReducedMotion(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // Con reduced-motion el carrusel queda navegable sólo por flechas / gesto.
    const autoScroll = emblaApi.plugins().autoScroll;
    if (!autoScroll) return;
    if (reducedMotion) autoScroll.stop();
    else if (!autoScroll.isPlaying()) autoScroll.play();
  }, [emblaApi, reducedMotion]);

  /* -------------------------------- Favoritos ------------------------------- */

  // El estado de favoritos se re-sincroniza cuando cambia la lista entrante.
  // Se ajusta durante el render (patrón recomendado por React) en lugar de en un
  // efecto, que provocaría renders en cascada.
  const [favState, setFavState] = useState<{
    source: readonly Place[];
    ids: ReadonlySet<string>;
  }>(() => ({ source: items, ids: buildFavoriteIds(items) }));

  if (favState.source !== items) {
    setFavState({ source: items, ids: buildFavoriteIds(items) });
  }

  const favorites = favState.ids;

  const toggleFavorite = useCallback(
    (placeId: string): void => {
      const willBeFavorite = !favorites.has(placeId);
      setFavState((prev) => {
        const ids = new Set(prev.ids);
        if (willBeFavorite) ids.add(placeId);
        else ids.delete(placeId);
        return { source: prev.source, ids };
      });
      onToggleFavorite?.(placeId, willBeFavorite);
    },
    [favorites, onToggleFavorite],
  );

  /* --------------------------------- Render --------------------------------- */

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Lugares patrimoniales destacados de Huamanga"
      /* Dark mode: crema casi blanco en light, casi negro en dark. */
      className={`w-full bg-[#FAF9F7] py-8 text-[#111111] sm:py-10 dark:bg-[#0A0A0A] dark:text-white ${className}`}
    >
      {/* ------------------------------ Cabecera ------------------------------ */}
      <header className="mb-6 flex flex-col gap-3 px-4 sm:mb-7 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5 lg:px-6">
        <div className="min-w-0">
          {/* max-w en "ch" fuerza el quiebre a dos líneas como en la referencia */}
          <h2 className="max-w-[16ch] text-[26px] font-bold leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[34px] lg:text-[42px] dark:text-white">
            Lugares patrimoniales destacados
          </h2>
          <p className="mt-2 max-w-[34ch] text-[14px] leading-snug text-[#8B8B8B] sm:mt-2.5 sm:max-w-[30ch] sm:text-[15px] dark:text-[#8F8F8F]">
            Descubre los tesoros históricos de Huamanga
          </p>
        </div>

        <button
          type="button"
          onClick={onSeeAll}
          aria-label="Ver todos los lugares patrimoniales"
          className="group -mx-1 inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-1 py-1 text-[14px] font-medium text-[#DE8B26] transition-colors hover:text-[#B96D12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE8B26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F7] sm:text-[15px] dark:text-[#E39B3C] dark:hover:text-[#F2B45F] dark:focus-visible:ring-offset-[#0A0A0A]"
        >
          Ver todos
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </header>

      {/* ------------------------------ Carrusel ------------------------------ */}
      {/* El recorte vive dentro del viewport de Embla: la página nunca hace
          scroll horizontal, y la última card queda cortada al borde derecho. */}
      <div className="overflow-hidden px-4 sm:px-5 lg:px-6" ref={emblaRef}>
        <div className="flex touch-pan-y gap-4 sm:gap-5">
          {loopItems.map(({ place, index }) => {
            const isClone = index >= items.length;
            const category = CATEGORY_META[place.category];
            const CategoryIcon = category.Icon;
            const isFavorite = favorites.has(place.id);

            return (
              <article
                key={`${place.id}-${index}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${place.name}, ${category.label}`}
                /* Los clones se ocultan a lectores de pantalla para no duplicar. */
                aria-hidden={isClone || undefined}
                /* Anchos por breakpoint: ~1.1 cards en móvil, ~2.3 en tablet,
                   ~3.5-4 en desktop. Ratio de imagen constante en todos. */
                className="flex-[0_0_84%] sm:flex-[0_0_52%] md:flex-[0_0_42%] lg:flex-[0_0_27%] xl:flex-[0_0_24%]"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#EDEAE4] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-16px_rgba(16,24,40,0.22)] dark:border-[#242424] dark:bg-[#161616] dark:shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {/* ---------------------------- Imagen --------------------------- */}
                  <div className="relative aspect-[7/5] w-full overflow-hidden bg-[#EFECE6] dark:bg-[#1E1E1E]">
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      sizes="(max-width: 639px) 84vw, (max-width: 767px) 52vw, (max-width: 1023px) 42vw, (max-width: 1279px) 27vw, 24vw"
                      className="select-none object-cover"
                      draggable={false}
                    />

                    {/* Badge de categoría (píldora blanca + icono ámbar) */}
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 py-1.5 pl-2.5 pr-3 text-[12px] font-medium text-[#1F1F1F] shadow-[0_1px_3px_rgba(0,0,0,0.12)] backdrop-blur-[2px] dark:bg-[#111111]/85 dark:text-white">
                      <CategoryIcon
                        className="h-3.5 w-3.5 text-[#DE8B26] dark:text-[#E39B3C]"
                        aria-hidden="true"
                      />
                      {category.label}
                    </span>

                    {/* Favorito (estado por card, compartido entre original y clon) */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(place.id)}
                      tabIndex={isClone ? -1 : undefined}
                      aria-pressed={isFavorite}
                      aria-label={
                        isFavorite
                          ? `Quitar ${place.name} de favoritos`
                          : `Añadir ${place.name} a favoritos`
                      }
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.14)] backdrop-blur-[2px] transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DE8B26] focus-visible:ring-offset-1 dark:bg-black/45 dark:shadow-none"
                    >
                      <Heart
                        className={`h-[17px] w-[17px] transition-colors ${
                          isFavorite
                            ? 'fill-[#E5484D] text-[#E5484D]'
                            : 'text-[#4B4B4B] dark:text-white'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {/* --------------------------- Contenido ------------------------- */}
                  <div className="flex flex-1 flex-col px-4 pb-3.5 pt-3.5">
                    <h3 className="truncate text-[16px] font-bold tracking-[-0.01em] text-[#111111] sm:text-[17px] dark:text-white">
                      {place.name}
                    </h3>

                    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#8B8B8B] dark:text-[#8F8F8F]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {place.location} · {place.distance}
                      </span>
                    </p>

                    {/* Divisor sutil, adaptado a cada tema */}
                    <hr className="mt-3.5 border-t border-[#F0EEEA] dark:border-[#262626]" />

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Star
                          className="h-4 w-4 fill-[#F0A62A] text-[#F0A62A]"
                          aria-hidden="true"
                        />
                        <span className="text-[13.5px] font-semibold text-[#111111] dark:text-white">
                          {place.rating.toFixed(1)}
                        </span>
                        <span className="sr-only">estrellas de valoración</span>
                      </span>

                      {place.isOpen ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F6EE] py-1 pl-2 pr-2.5 text-[11.5px] font-medium text-[#1B7A45] dark:bg-[#0F2A1B] dark:text-[#4ADE80]">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[#28A85E] dark:bg-[#4ADE80]"
                            aria-hidden="true"
                          />
                          Abierto ahora
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EE] py-1 pl-2 pr-2.5 text-[11.5px] font-medium text-[#7A7A7A] dark:bg-[#1F1F1F] dark:text-[#9A9A9A]">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[#B0B0B0] dark:bg-[#6A6A6A]"
                            aria-hidden="true"
                          />
                          Cerrado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

    </section>
  );
}
