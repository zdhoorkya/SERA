import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

export const revalidate = 0; // Fresh renders for real-time editorial changes

const ITEMS_PER_PAGE = 5;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const currentPage = parseInt(searchParams.page || "1", 10);

  // 1. Fetch category details
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // 2. Count articles for pagination
  const totalArticles = await prisma.article.count({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
    },
  });

  // 3. Fetch articles for the current page
  const articles = await prisma.article.findMany({
    where: {
      categoryId: category.id,
      status: "PUBLISHED",
    },
    include: { authors: true },
    orderBy: { publishDate: "desc" },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Split into lead and grid lists
  const leadArticle = articles[0];
  const listArticles = articles.slice(1);

  return (
    <div className="bg-paper min-h-screen">
      <Masthead />

      <div className="px-6 md:px-10 py-12 select-none">
        {/* CATEGORY HEADER */}
        <header className="border-b border-ink pb-8 mb-10 max-w-5xl">
          <h1 className="display-font font-medium text-4xl md:text-7xl leading-none text-ink uppercase mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="font-serif italic text-lg md:text-xl text-soft max-w-2xl">
              {category.description}
            </p>
          )}
          <span className="font-sans text-[10px] tracking-[0.1em] text-faint uppercase block mt-4">
            Showing {articles.length} of {totalArticles} pieces in this column
          </span>
        </header>

        {articles.length === 0 ? (
          <div className="py-20 text-center text-faint font-sans text-sm italic border-b border-line">
            No published pieces found in this category yet.
          </div>
        ) : (
          <div className="max-w-5xl">
            {/* LEAD STORY */}
            {leadArticle && (
              <div className="border-b border-line pb-10 mb-10">
                <Link href={`/article/${leadArticle.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {leadArticle.heroImage && (
                    <div className="lg:col-span-7 h-80 md:h-[400px] w-full overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={leadArticle.heroImage}
                        alt={leadArticle.title}
                        className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.01] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className={`${leadArticle.heroImage ? "lg:col-span-5" : "lg:col-span-12"}`}>
                    <span className="font-sans text-[10px] tracking-[0.08em] uppercase text-faint block mb-2">
                      LEAD STORY
                    </span>
                    <h2 className="display-font font-medium text-2xl md:text-4xl leading-tight text-ink group-hover:underline mb-3">
                      {leadArticle.title}
                    </h2>
                    <p className="font-serif text-sm md:text-base text-soft leading-relaxed mb-4">
                      {leadArticle.deck}
                    </p>
                    <div className="font-sans text-[11px] tracking-[0.06em] uppercase text-faint">
                      {leadArticle.authors.map((a) => a.name).join(" · ")} · {leadArticle.readTime} min read
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* LIST STRIPS */}
            {listArticles.length > 0 && (
              <div className="divide-y divide-line border-b border-line mb-10">
                {listArticles.map((art) => (
                  <div key={art.id} className="py-8 first:pt-0 last:pb-8 group">
                    <Link href={`/article/${art.slug}`} className="flex flex-col md:flex-row gap-6 items-start">
                      {art.heroImage && (
                        <div className="w-full md:w-[180px] md:flex-shrink-0 h-[120px] overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.heroImage}
                            alt={art.title}
                            className="w-full h-full object-cover grayscale-img transform group-hover:scale-[1.02] transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="display-font font-medium text-xl md:text-2xl leading-snug text-ink group-hover:underline mb-2">
                          {art.title}
                        </h3>
                        <p className="font-serif text-sm text-soft leading-relaxed mb-3 max-w-3xl">
                          {art.deck}
                        </p>
                        <div className="font-sans text-[10px] tracking-[0.06em] uppercase text-faint">
                          {art.authors.map((a) => a.name).join(" · ")} · {art.readTime} min read
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <nav className="flex justify-between items-center py-6 font-sans text-xs tracking-wider uppercase">
                <div>
                  {hasPrevPage ? (
                    <Link
                      href={`/category/${slug}?page=${currentPage - 1}`}
                      className="text-ink hover:underline font-semibold"
                    >
                      ← Previous Page
                    </Link>
                  ) : (
                    <span className="text-faint">← Previous Page</span>
                  )}
                </div>
                <div className="text-soft font-semibold select-none">
                  Page {currentPage} of {totalPages}
                </div>
                <div>
                  {hasNextPage ? (
                    <Link
                      href={`/category/${slug}?page=${currentPage + 1}`}
                      className="text-ink hover:underline font-semibold"
                    >
                      Next Page →
                    </Link>
                  ) : (
                    <span className="text-faint">Next Page →</span>
                  )}
                </div>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
