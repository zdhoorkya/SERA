import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";

interface AuthorPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Fresh renders for real-time biographical updates

export default async function AuthorPage({ params }: AuthorPageProps) {
  const authorId = parseInt(params.id, 10);

  if (isNaN(authorId)) {
    notFound();
  }

  // 1. Fetch author details
  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  // Check if user exists and active
  if (!author || !author.active) {
    notFound();
  }

  // 2. Fetch all published articles by this author
  const articles = await prisma.article.findMany({
    where: {
      authors: {
        some: { id: author.id },
      },
      status: "PUBLISHED",
    },
    include: { category: true },
    orderBy: { publishDate: "desc" },
  });

  return (
    <div className="bg-paper min-h-screen">
      <Masthead />

      <div className="px-6 md:px-10 py-12 select-none">
        {/* AUTHOR BIO CARD */}
        <div className="border-b border-ink pb-12 mb-12 flex flex-col md:flex-row gap-8 items-start max-w-5xl">
          {author.headshot && (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden flex-shrink-0 bg-line border border-ink relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={author.headshot.startsWith("/") ? author.headshot : "https://picsum.photos/id/1025/300/300"}
                alt={author.name}
                className="w-full h-full object-cover grayscale-img"
                onError={(e) => {
                  // Fallback if local headshot doesn't exist yet
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name)}&backgroundColor=d9d5c7&textColor=15130f`;
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-1">
              {author.title || author.role}
            </span>
            <h1 className="display-font font-medium text-3xl md:text-5xl leading-none text-ink mb-3 uppercase">
              {author.name}
            </h1>
            {author.bio ? (
              <p className="font-serif italic text-base md:text-lg text-soft leading-relaxed max-w-2xl">
                {author.bio}
              </p>
            ) : (
              <p className="font-serif italic text-base md:text-lg text-faint">
                No bio information provided.
              </p>
            )}
            <div className="mt-4 font-sans text-[10px] tracking-[0.08em] uppercase text-faint">
              Contact: {author.email}
            </div>
          </div>
        </div>

        {/* ARTICLES GRID */}
        <div className="max-w-5xl">
          <h2 className="font-sans text-xs tracking-[0.12em] uppercase text-ink font-semibold mb-8">
            Published Works ({articles.length})
          </h2>

          {articles.length === 0 ? (
            <div className="py-20 text-center text-faint font-sans text-sm italic border border-dashed border-line">
              This author has not published any pieces yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-line pb-12">
              {articles.map((art) => (
                <div key={art.id} className="group border border-line p-6 hover:border-ink transition-colors flex flex-col justify-between">
                  <Link href={`/article/${art.slug}`} className="flex flex-col h-full">
                    {art.heroImage && (
                      <div className="h-44 relative overflow-hidden mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.heroImage}
                          alt={art.title}
                          className="w-full h-full object-cover grayscale-img"
                        />
                      </div>
                    )}
                    <span className="font-sans text-[10px] tracking-[0.06em] uppercase text-faint mb-1.5 block">
                      {art.category.name}
                    </span>
                    <h3 className="display-font font-medium text-xl text-ink leading-snug group-hover:underline mb-2">
                      {art.title}
                    </h3>
                    <p className="font-serif text-xs md:text-sm text-soft leading-relaxed mb-4 line-clamp-3">
                      {art.deck}
                    </p>
                    <div className="font-sans text-[10px] text-faint uppercase mt-auto">
                      {art.readTime} min read
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
