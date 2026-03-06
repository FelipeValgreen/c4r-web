"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/components/nav-links";

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-platinum bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">C4R</span>
            <span className="font-heading text-2xl font-bold text-ink">C4R</span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-ink"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú principal"}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-900 transition-colors hover:text-khaki"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            href="/app/explorar"
            className="inline-flex h-10 items-center justify-center rounded-md bg-khaki px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-khaki focus-visible:ring-offset-2"
          >
            Explorar autos verificados
          </Link>
        </div>
      </nav>

      {isOpen && (
        <div className="border-t border-platinum lg:hidden">
          <div className="space-y-2 px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 transition-colors hover:bg-platinum/60"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app/explorar"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-khaki px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              onClick={() => setIsOpen(false)}
            >
              Explorar autos verificados
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
