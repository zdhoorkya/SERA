import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 0; // Fresh rendering to record views and get latest content

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params;

  // Fetch article
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      authors: true,
      category: true,
      tags: true,
    },
  });

  // If article not found or not published, return 404
  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view count and record view velocity event
  try {
    await prisma.$transaction([
      prisma.article.update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      }),
      prisma.viewEvent.create({
        data: { articleId: article.id },
      }),
    ]);
  } catch (e) {
    console.error("Failed to increment article views or record event", e);
  }

  // Fetch related reads (3 other published articles, prioritizing same category)
  const relatedReads = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
    },
    include: { authors: true, category: true },
    orderBy: [
      { categoryId: article.categoryId === 0 ? "asc" : "desc" }, // Sort prioritizing matching category
      { publishDate: "desc" },
    ],
    take: 3,
  });

  const formattedDate = article.publishDate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(article.publishDate))
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());

  // Custom Masthead links for Article detail (matching mockup's style)
  const articleNavLinks = [
    { name: "Home", href: "/" },
    { name: "Technology", href: "/category/technology" },
    { name: "Business", href: "/category/business" },
    { name: "Opinion", href: "/category/opinion" },
  ];

  return (
    <div className="bg-paper min-h-screen">
      <Masthead links={articleNavLinks} volumeInfo="" />

      <article className="article max-w-[900px] mx-auto px-6 md:px-[40px] pt-12 pb-20 select-none">
        {/* EYEBROW */}
        <div className="art-eyebrow font-sans text-xs tracking-[0.14em] uppercase text-soft mb-4">
          {article.category.name} — {article.isOpinion ? "OPINION" : "ANALYSIS"}
        </div>

        {/* HEADLINE */}
        <h1 className="art-title display-font font-medium text-3xl md:text-[52px] leading-[1.05] text-ink mb-4 md:mb-[18px] max-w-[760px]">
          {article.title}
        </h1>

        {/* BYLINE & META */}
        <div className="art-meta flex flex-wrap gap-4 md:gap-[18px] font-sans text-[10px] md:text-[11px] tracking-[0.06em] uppercase text-faint border-b border-ink pb-[22px] mb-8">
          <span>By {article.authors.map((a) => a.name).join(" & ")}</span>
          <span className="hidden sm:inline">·</span>
          <span>{formattedDate}</span>
          <span className="hidden sm:inline">·</span>
          <span>{article.readTime} min read</span>
          {article.views > 0 && (
            <>
              <span className="hidden sm:inline">·</span>
              <span className="text-soft font-medium">{article.views} views</span>
            </>
          )}
        </div>

        {/* HERO IMAGE */}
        {article.heroImage && (
          <figure className="art-hero my-[28px] relative w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-auto max-h-[650px] object-cover object-top grayscale-img"
            />
            {article.caption && (
              <figcaption className="font-sans text-[11px] text-faint mt-2 tracking-[0.03em] uppercase">
                {article.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* ARTICLE BODY */}
        <div 
          className="art-body font-serif text-[18px] md:text-[19px] leading-[1.7] text-ink max-w-[680px] select-text selection:bg-ink selection:text-paper"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* FOOTER METADATA */}
        <div className="art-foot flex justify-between items-center font-sans text-[11px] text-faint tracking-[0.06em] uppercase pt-6 mt-12 border-t border-line">
          <span>
            Filed under:{" "}
            {article.tags.length > 0 ? (
              article.tags.map((t, idx) => (
                <span key={t.id} className="text-soft font-semibold hover:underline cursor-pointer">
                  {t.name}
                  {idx < article.tags.length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span className="text-soft font-semibold">{article.category.name}</span>
            )}
          </span>
          <button className="hover:text-ink transition-colors cursor-pointer font-medium">
            Share Piece
          </button>
        </div>
      </article>

      {/* RELATED READS FOOTER SECTION */}
      {relatedReads.length > 0 && (
        <section className="bg-paper border-t border-ink py-16 px-6 md:px-10">
          <div className="max-w-5xl mx-auto">
            <h3 className="font-sans text-[12px] tracking-[0.14em] uppercase text-soft font-semibold mb-8 select-none">
              Related Reads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 select-none">
              {relatedReads.map((read) => (
                <div key={read.id} className="flex flex-col group">
                  <Link href={`/article/${read.slug}`} className="flex flex-col h-full">
                    {read.heroImage && (
                      <div className="h-[140px] relative overflow-hidden mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={read.heroImage}
                          alt={read.title}
                          className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.01] transition-transform duration-500"
                        />
                      </div>
                    )}
                    <span className="font-sans text-[10px] tracking-[0.06em] uppercase text-faint mb-1.5 block">
                      {read.category.name}
                    </span>
                    <h4 className="display-font font-medium text-lg text-ink leading-snug group-hover:underline mb-2">
                      {read.title}
                    </h4>
                    <div className="font-sans text-[10px] text-faint uppercase mt-auto">
                      By {read.authors.map((a) => a.name).join(" · ")}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
