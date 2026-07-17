import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export const revalidate = 0; // Fresh search matches on run

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  // Query articles matching title, deck, or body content
  const articles = query
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query } },
            { deck: { contains: query } },
            { body: { contains: query } },
          ],
        },
        include: { authors: true, category: true },
        orderBy: { publishDate: "desc" },
      })
    : [];

  return (
    <div className="bg-paper min-h-screen">
      <Masthead />

      <div className="px-6 md:px-10 py-12 select-none">
        {/* SEARCH HEADER */}
        <header className="border-b border-ink pb-8 mb-10 max-w-5xl">
          <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2">
            Search Registry
          </span>
          <h1 className="display-font font-medium text-3xl md:text-5xl leading-tight text-ink uppercase mb-3">
            {query ? `Search Results for "${query}"` : "Search Database"}
          </h1>
          <span className="font-sans text-[10px] tracking-[0.1em] text-faint uppercase block">
            Found {articles.length} records in our archives
          </span>
        </header>

        {/* SEARCH RESULTS */}
        {articles.length === 0 ? (
          <div className="py-20 text-center text-faint font-sans text-sm italic border-b border-line max-w-5xl">
            {query
              ? "No articles matched your search keywords. Please try different terms."
              : "Please enter keywords in the search drawer to query the database."}
          </div>
        ) : (
          <div className="max-w-5xl divide-y divide-line border-b border-line">
            {articles.map((art) => (
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
                    <span className="font-sans text-[10px] tracking-[0.06em] uppercase text-soft block mb-1.5 font-semibold">
                      {art.category.name}
                    </span>
                    <h3 className="display-font font-medium text-xl md:text-2xl leading-snug text-ink group-hover:underline mb-2">
                      {art.title}
                    </h3>
                    <p className="font-serif text-sm text-soft leading-relaxed mb-3 max-w-3xl">
                      {art.deck}
                    </p>
                    <div className="font-sans text-[10px] tracking-[0.06em] uppercase text-faint">
                      By {art.authors.map((a) => a.name).join(" · ")} · {art.readTime} min read
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
