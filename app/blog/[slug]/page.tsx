import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/TrackedLink";
import { blogPosts, getBlogPostBySlug } from "@/lib/blog-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Articulo no encontrado | Blog C4R",
      description: "El articulo solicitado no existe o fue removido.",
    };
  }

  return {
    title: `${post.title} | Blog C4R`,
    description: post.seoDescription,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Blog C4R`,
      description: post.seoDescription,
      url: `/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.image,
          width: 1200,
          height: 700,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Blog C4R`,
      description: post.seoDescription,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pb-16">
      <article>
        <header className="border-b border-platinum bg-[radial-gradient(circle_at_top,_rgba(176,161,110,0.2),transparent_55%)] py-14">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-khaki">{post.category}</p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-ink sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg text-ink/80">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink/70">
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime} lectura</span>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-10 max-w-5xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-platinum">
            <Image src={post.image} alt={post.title} width={1200} height={700} className="h-auto w-full object-cover" priority />
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,2fr)_320px] lg:px-8">
          <div className="space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-heading text-2xl font-semibold text-ink">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-ink/80">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-ink/80">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="rounded-2xl border border-platinum bg-platinum/40 p-6">
              <h3 className="font-heading text-xl font-semibold text-ink">Conclusiones clave</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-ink/80">
                {post.keyTakeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="flex flex-wrap gap-3">
              <TrackedLink
                href={post.finalCtaHref}
                eventName="blog_post_final_cta"
                eventParams={{ location: "blog_article", slug: post.slug }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-khaki px-6 text-sm font-semibold text-ink transition-colors hover:bg-khaki-dark"
              >
                {post.finalCtaLabel}
              </TrackedLink>
              <TrackedLink
                href="/blog"
                eventName="blog_post_back_to_blog"
                eventParams={{ location: "blog_article", slug: post.slug }}
                className="inline-flex h-11 items-center justify-center rounded-md border border-ink px-6 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Volver al blog
              </TrackedLink>
            </div>
          </div>

          <aside className="h-max rounded-2xl border border-platinum bg-white p-6 lg:sticky lg:top-24">
            <h3 className="font-heading text-lg font-semibold text-ink">Mas articulos</h3>
            <div className="mt-4 space-y-3">
              {blogPosts
                .filter((item) => item.slug !== post.slug)
                .slice(0, 4)
                .map((item) => (
                  <TrackedLink
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    eventName="blog_sidebar_post"
                    eventParams={{ location: "blog_sidebar", slug: item.slug }}
                    className="block rounded-lg border border-platinum p-3 text-sm text-ink transition-colors hover:bg-platinum"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-ink/70">{item.date}</p>
                  </TrackedLink>
                ))}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
