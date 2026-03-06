import TrackedLink from "@/components/TrackedLink";

type MarketingPlaceholderProps = {
  title: string;
  description: string;
};

export default function MarketingPlaceholder({ title, description }: MarketingPlaceholderProps) {
  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(176,161,110,0.18),transparent_55%)]" />
      <section className="relative mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="rounded-2xl border border-platinum bg-white/90 p-8 shadow-sm sm:p-10">
          <span className="inline-flex rounded-full bg-khaki-light px-4 py-1 text-sm font-semibold text-ink">
            C4R
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">{description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <TrackedLink
              href="/app/explorar"
              eventName="placeholder_cta_explore"
              eventParams={{ location: "placeholder_primary", page: title }}
              className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
            >
              Explorar autos verificados
            </TrackedLink>
            <TrackedLink
              href="/contacto"
              eventName="placeholder_cta_contact"
              eventParams={{ location: "placeholder_secondary", page: title }}
              className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Hablar con el equipo
            </TrackedLink>
          </div>
        </div>
      </section>
    </main>
  );
}
