import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReviewPanel from "@/components/studio/ReviewPanel";

interface ReviewDetailPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Dynamic review actions

export default async function StudioReviewDetailPage({ params }: ReviewDetailPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const articleId = parseInt(params.id, 10);
  if (isNaN(articleId)) {
    notFound();
  }

  // Fetch article with related details
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      authors: true,
      category: true,
      comments: {
        include: {
          user: {
            select: { name: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Enforce author boundaries
  const isAuthor = user.role === "AUTHOR";
  const isOwner = article.authors.some((auth) => auth.id === parseInt(user.id, 10));

  if (isAuthor && !isOwner) {
    redirect("/studio/review-queue");
  }

  return (
    <div className="space-y-6 select-none">
      {/* BACK NAVIGATION */}
      <div>
        <Link
          href="/studio/review-queue"
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#18181B] uppercase tracking-wider font-semibold hover:underline"
        >
          <ChevronLeft size={14} />
          <span>Back to Review Queue</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ARTICLE DETAIL PREVIEW PLATE (8 cols) */}
        <div className="lg:col-span-8 bg-[#F7F6F2] border border-[#D9D5C7] p-8 md:p-12 text-[#15130F] font-serif max-h-[85vh] overflow-y-auto shadow-sm">
          <div className="max-w-[640px] mx-auto space-y-6">
            
            {/* EYEBROW */}
            <span className="font-sans text-[11px] tracking-[0.14em] uppercase text-[#57544B] block">
              {article.category.name} — {article.isOpinion ? "Opinion Submission" : "Draft Submission"}
            </span>

            {/* TITLE */}
            <h1 className="display-font font-medium text-3xl md:text-4xl leading-[1.05] text-[#15130F] mb-2">
              {article.title}
            </h1>

            {/* BYLINE */}
            <div className="flex gap-4 font-sans text-[10px] tracking-[0.06em] uppercase text-[#8A8779] border-b border-[#15130F] pb-4 mb-4 select-none">
              <span>By {article.authors.map((a) => a.name).join(" & ")}</span>
              <span>·</span>
              <span>Submissions Review Plate</span>
            </div>

            {/* HERO IMAGE */}
            {article.heroImage && (
              <figure className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full max-h-[320px] object-cover grayscale"
                />
                {article.caption && (
                  <figcaption className="font-sans text-[10px] text-[#8A8779] mt-2 uppercase tracking-wide">
                    {article.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* DECK */}
            {article.deck && (
              <p className="text-lg italic text-[#57544B] leading-relaxed border-l-2 border-[#D9D5C7] pl-4">
                {article.deck}
              </p>
            )}

            {/* BODY RENDER */}
            <div
              className="preview-body leading-relaxed text-base md:text-lg select-text selection:bg-[#15130F] selection:text-[#F7F6F2]"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: MODERATION CONTROLS PANEL (4 cols) */}
        <div className="lg:col-span-4">
          <ReviewPanel
            articleId={article.id}
            initialStatus={article.status}
            comments={article.comments as any[]}
            currentUser={user}
            categorySlug={article.category.slug}
          />
        </div>
      </div>
    </div>
  );
}
