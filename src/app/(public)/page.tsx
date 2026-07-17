import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";
import HomeAnimations from "@/components/animations/HomeAnimations";
import { getTrendingArticles } from "@/lib/trending";

export const revalidate = 0; // Fresh content on load

export default async function HomePage() {
  // Fetch published articles
  const publishedArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { authors: true, category: true },
    orderBy: { publishDate: "desc" },
  });

  // Fetch editor-pinned headlines
  const headlines = await prisma.article.findMany({
    where: { status: "PUBLISHED", isPinnedToHeadlines: true },
    orderBy: { headlineOrder: "asc" },
    take: 6,
    include: { category: true },
  });

  // Fetch velocity-based trending articles
  const trendingArticles = await getTrendingArticles();

  // Extract sections matching mockup flow
  // 1. Hero: The long read (World)
  const heroArticle = publishedArticles[0];

  // 2. Opinions (Opinion Rail)
  const opinionArticles = publishedArticles.filter((a) => a.isOpinion).slice(0, 3);

  // 3. Lead Main Story (Top Story not opinions and not the hero)
  const leadMainArticle = publishedArticles.find(
    (a) => !a.isOpinion && a.id !== heroArticle?.id
  );

  // 4. Politics & Policy (Strips) - filter by politics/india, not already displayed
  const politicsAndPolicyArticles = publishedArticles
    .filter(
      (a) =>
        (a.category.slug === "politics" || a.category.slug === "india") &&
        a.id !== heroArticle?.id &&
        a.id !== leadMainArticle?.id
    )
    .slice(0, 2);

  // 5. Culture & Lifestyle (Cards)
  const cultureAndLifestyleArticles = publishedArticles
    .filter((a) => a.category.slug === "culture" || a.category.slug === "lifestyle")
    .slice(0, 3);

  return (
    <div className="bg-paper min-h-screen">
      <HomeAnimations />
      <Masthead />

      {/* HEADLINES horizontal scroller strip */}
      {headlines.length > 0 && (
        <div className="border-b border-ink bg-paper py-3 px-6 md:px-10 overflow-x-auto no-scrollbar select-none">
          <div className="flex items-center divide-x divide-line min-w-max">
            {headlines.map((head, idx) => (
              <Link
                key={head.id}
                href={`/article/${head.slug}`}
                className={`font-sans text-[11px] md:text-xs font-semibold tracking-wider text-ink hover:text-soft uppercase transition-colors px-4 md:px-6 ${
                  idx === 0 ? "pl-0" : ""
                }`}
              >
                <span className="text-faint font-normal mr-2">{head.category.name} //</span>
                {head.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* HERO LEAD STORY */}
      {heroArticle && (
        <div className="hero relative border-b border-ink overflow-hidden group select-none">
          <Link href={`/article/${heroArticle.slug}`}>
            <div className="hero-img-container h-[560px] relative w-full overflow-hidden">
              {/* Fallback standard HTML image to apply CSS filter exactly as approved */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroArticle.heroImage || "https://picsum.photos/id/1048/1400/900"}
                alt={heroArticle.title}
                className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.01] transition-transform duration-700"
              />
            </div>
            <div className="hero-caption absolute left-0 right-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
              <div className="hero-text text-paper">
                <span className="eyebrow block font-sans text-[10px] md:text-[11px] tracking-[0.14em] uppercase opacity-85 mb-2.5">
                  {heroArticle.category.name} — THE LONG READ
                </span>
                <h1 className="display-font font-medium text-3xl md:text-5xl lg:text-[56px] leading-[1.03] text-paper max-w-4xl mb-3">
                  {heroArticle.title}
                </h1>
                <p className="font-serif italic text-base md:text-[19px] leading-relaxed text-paper/90 max-w-2xl mb-2.5">
                  {heroArticle.deck}
                </p>
                <div className="font-sans text-[10px] md:text-[11px] tracking-[0.06em] uppercase opacity-70">
                  By {heroArticle.authors.map((a) => a.name).join(" · ")} · {heroArticle.readTime} min read
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* TRENDING SECTION (after hero, before top stories) */}
      {trendingArticles.length > 0 && (
        <section className="border-b border-ink">
          <div className="section-label flex items-center gap-3 px-6 md:px-10 pt-[22px] pb-1 select-none">
            {/* SVG Geometric Starfire Rocket Glyph */}
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              className="fill-ink flex-shrink-0"
            >
              <path d="M12 2s-.5 4.5-3 7c-2 2-6 3.5-6 3.5s4 1.5 6 3.5c2.5 2.5 3 7 3 7s.5-4.5 3-7c2-2 6-3.5 6-3.5s-4-1.5-6-3.5c-2.5-2.5-3-7-3-7z" />
            </svg>
            <span className="name font-sans text-xs tracking-[0.12em] uppercase text-ink font-semibold">
              Trending
            </span>
            <div className="rule flex-1 h-[1px] bg-line relative overflow-hidden">
              <div className="section-rule absolute left-0 top-0 h-full bg-line" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-line">
            {trendingArticles.map((art, idx) => (
              <div key={art.id} className="p-6 flex flex-col justify-between">
                <div>
                  <span className="block font-sans text-[9px] tracking-wider text-faint uppercase mb-2 select-none">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} — {art.category.name}
                  </span>
                  <Link
                    href={`/article/${art.slug}`}
                    className="font-sans text-xs md:text-[12px] font-semibold tracking-wider uppercase leading-snug hover:text-soft text-ink transition-colors block"
                  >
                    {art.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION I: TOP STORIES */}
      <section className="border-b border-ink">
        <div className="section-label flex items-center gap-4 px-6 md:px-10 pt-[22px] pb-1 select-none">
          <span className="num font-display italic text-[15px] text-faint">I.</span>
          <span className="name font-sans text-xs tracking-[0.12em] uppercase text-ink font-semibold">
            Top stories
          </span>
          <div className="rule flex-1 h-[1px] bg-line relative overflow-hidden">
            <div className="section-rule absolute left-0 top-0 h-full bg-line" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="lead-grid grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-line">
          {/* LEFT: LEAD MAIN STORY */}
          <div className="lead-main p-6 md:p-10 flex flex-col">
            {leadMainArticle ? (
              <Link href={`/article/${leadMainArticle.slug}`} className="group flex-1 flex flex-col justify-between">
                <div>
                  <div className="overflow-hidden mb-[18px] h-80 relative image-reveal">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={leadMainArticle.heroImage || "https://picsum.photos/id/1074/900/560"}
                      alt={leadMainArticle.title}
                      className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.01] transition-transform duration-700"
                    />
                  </div>
                  <span className="font-sans text-[11px] tracking-[0.06em] uppercase text-faint block mb-2.5">
                    {leadMainArticle.category.name}
                  </span>
                  <h2 className="display-font font-medium text-2xl md:text-[34px] leading-[1.08] text-ink mb-3 group-hover:underline">
                    {leadMainArticle.title}
                  </h2>
                  <p className="font-serif text-[15px] md:text-[16px] text-soft leading-relaxed mb-3">
                    {leadMainArticle.deck}
                  </p>
                </div>
                <div className="font-sans text-[11px] tracking-[0.06em] uppercase text-faint mt-auto">
                  {leadMainArticle.authors.map((a) => a.name).join(" · ")} · {leadMainArticle.readTime} min read
                </div>
              </Link>
            ) : (
              <div className="text-faint text-sm italic font-sans py-12">No additional top stories available.</div>
            )}
          </div>

          {/* RIGHT: OPINION RAIL */}
          <div className="opinion-rail p-6 md:p-8 bg-paper">
            <span className="eyebrow-op font-sans text-[11px] tracking-[0.12em] uppercase text-soft border-b border-ink pb-2.5 mb-4 block font-semibold select-none">
              Opinion
            </span>
            <div className="divide-y divide-line">
              {opinionArticles.map((op) => (
                <div key={op.id} className="op-item py-4 first:pt-0 last:pb-0 group">
                  <Link href={`/article/${op.slug}`}>
                    <h3 className="display-font italic font-normal text-lg md:text-xl leading-[1.22] text-ink mb-2 group-hover:underline">
                      "{op.title}"
                    </h3>
                    <div className="meta font-sans text-[10px] md:text-[11px] tracking-[0.06em] uppercase text-faint">
                      {op.authors.map((a) => a.name).join(" · ")}
                    </div>
                  </Link>
                </div>
              ))}
              {opinionArticles.length === 0 && (
                <div className="text-faint text-sm italic font-sans py-6">No opinion columns written.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION II: POLITICS & POLICY */}
      <section className="border-b border-ink">
        <div className="section-label flex items-center gap-4 px-6 md:px-10 pt-[22px] pb-1 select-none">
          <span className="num font-display italic text-[15px] text-faint">II.</span>
          <span className="name font-sans text-xs tracking-[0.12em] uppercase text-ink font-semibold">
            Politics &amp; policy
          </span>
          <div className="rule flex-1 h-[1px] bg-line relative overflow-hidden">
            <div className="section-rule absolute left-0 top-0 h-full bg-line" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="divide-y divide-line select-none">
          {politicsAndPolicyArticles.map((art) => (
            <div key={art.id} className="strip p-6 md:p-10 flex flex-col sm:flex-row gap-6 items-start group">
              <div className="thumb w-full sm:w-[150px] sm:flex-shrink-0 h-[100px] relative overflow-hidden image-reveal">
                <Link href={`/article/${art.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.heroImage || "https://picsum.photos/id/1015/400/300"}
                    alt={art.title}
                    className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </Link>
              </div>
              <div className="body flex-1">
                <Link href={`/article/${art.slug}`}>
                  <h3 className="display-font font-medium text-xl md:text-2xl leading-[1.18] text-ink mb-2 group-hover:underline">
                    {art.title}
                  </h3>
                  <p className="font-serif text-sm md:text-[15px] text-soft leading-relaxed mb-2 max-w-2xl">
                    {art.deck}
                  </p>
                  <div className="meta font-sans text-[10px] md:text-[11px] tracking-[0.06em] uppercase text-faint">
                    {art.category.name} · {art.authors.map((a) => a.name).join(" · ")}
                  </div>
                </Link>
              </div>
            </div>
          ))}
          {politicsAndPolicyArticles.length === 0 && (
            <div className="text-faint text-sm italic font-sans p-10">No politics articles published.</div>
          )}
        </div>
      </section>

      {/* SECTION III: CULTURE & LIFESTYLE */}
      <section className="border-b border-ink">
        <div className="section-label flex items-center gap-4 px-6 md:px-10 pt-[22px] pb-1 select-none">
          <span className="num font-display italic text-[15px] text-faint">III.</span>
          <span className="name font-sans text-xs tracking-[0.12em] uppercase text-ink font-semibold">
            Culture &amp; lifestyle
          </span>
          <div className="rule flex-1 h-[1px] bg-line relative overflow-hidden">
            <div className="section-rule absolute left-0 top-0 h-full bg-line" style={{ width: "0%" }} />
          </div>
        </div>

        <div className="card-grid grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line select-none">
          {cultureAndLifestyleArticles.map((art) => (
            <div key={art.id} className="card p-6 md:p-8 flex flex-col group">
              <Link href={`/article/${art.slug}`} className="flex-1 flex flex-col">
                <div className="h-[150px] relative overflow-hidden mb-[14px] image-reveal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.heroImage || "https://picsum.photos/id/1025/500/400"}
                    alt={art.title}
                    className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
                <h3 className="display-font font-medium text-lg md:text-[21px] leading-[1.16] text-ink mb-2 group-hover:underline">
                  {art.title}
                </h3>
                <p className="font-serif text-[13px] md:text-sm text-soft leading-relaxed">
                  {art.deck}
                </p>
              </Link>
            </div>
          ))}
          {cultureAndLifestyleArticles.length === 0 && (
            <div className="text-faint text-sm italic font-sans p-10 md:col-span-3">
              No culture or lifestyle articles published.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
