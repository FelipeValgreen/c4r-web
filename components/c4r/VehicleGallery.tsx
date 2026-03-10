"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type VehicleGalleryProps = {
  title: string;
  images: string[];
};

function uniqueImages(images: string[]): string[] {
  const cleaned = images
    .map((image) => image.trim())
    .filter((image) => image.length > 0);

  return Array.from(new Set(cleaned));
}

export default function VehicleGallery({ title, images }: VehicleGalleryProps) {
  const galleryImages = useMemo(() => uniqueImages(images), [images]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (galleryImages.length === 0) {
    return null;
  }

  const activeImage = galleryImages[Math.min(activeIndex, galleryImages.length - 1)];

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-platinum bg-[radial-gradient(circle_at_top,_#f9f8f4,_#e7e3d8)] p-4">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={activeImage}
            alt={`${title} imagen ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-contain object-center"
            priority
            unoptimized
          />

          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum bg-white/90 text-ink transition-colors hover:bg-white"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-platinum bg-white/90 text-ink transition-colors hover:bg-white"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {galleryImages.length > 1 ? (
        <>
          <p className="mt-3 text-sm font-medium text-ink/70">
            Foto {activeIndex + 1} de {galleryImages.length}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryImages.map((image, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`overflow-hidden rounded-xl border bg-[radial-gradient(circle_at_top,_#faf9f6,_#ece7da)] p-3 transition-colors ${
                    isActive ? "border-khaki" : "border-platinum hover:border-khaki/50"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image}
                      alt={`Miniatura ${index + 1} ${title}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 240px"
                      className="object-contain object-center"
                      unoptimized
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
