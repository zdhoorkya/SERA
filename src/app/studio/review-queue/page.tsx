import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, ClipboardList, AlertCircle, MessageCircle } from "lucide-react";

export const revalidate = 0; // Fresh review queues

export default async function StudioReviewQueuePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isAuthor = user.role === "AUTHOR";

  const whereClause: any = {};

  if (isAuthor) {
    // Authors can only see their own submissions that are in review, pending admin, or changes requested
    whereClause.authors = { some: { id: parseInt(user.id, 10) } };
    whereClause.status = { in: ["IN_REVIEW", "PENDING_ADMIN", "CHANGES_REQUESTED"] };
  } else {
    // Editors/Admins see all articles pending editor review or admin verification
    whereClause.status = { in: ["IN_REVIEW", "PENDING_ADMIN", "CHANGES_REQUESTED"] };
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    include: { authors: true, category: true, comments: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8 select-none">
      {/* HEADER */}
      <div className="border-b border-[#E4E4E7] pb-6">
        <span className="text-[10px] font-semibold tracking-wider text-[#71717A] uppercase block mb-1">
          Quality Control Bureau
        </span>
        <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
          Review Queue
        </h1>
        <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
          {isAuthor ? "Track your editorial submissions" : "Review drafts, write comments, and verify articles"}
        </p>
      </div>

      {/* QUEUE LIST */}
      <div className="bg-white border border-[#E4E4E7] shadow-sm">
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
            Active Submissions ({articles.length})
          </span>
        </div>

        <div className="divide-y divide-[#E4E4E7]">
          {articles.map((art) => {
            const formattedDate = new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(art.updatedAt));

            return (
              <div key={art.id} className="p-6 hover:bg-[#FAFAFA] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* STATUS TAG */}
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border rounded ${
                      art.status === "PENDING_ADMIN"
                        ? "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]"
                        : art.status === "IN_REVIEW"
                        ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
                        : "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                    }`}>
                      {art.status === "PENDING_ADMIN" ? "Admin Verify Needed" : art.status === "IN_REVIEW" ? "Editor Review" : "Changes Requested"}
                    </span>
                    <span className="text-[10px] text-[#71717A] font-medium uppercase tracking-wider">
                      {art.category.name}
                    </span>
                  </div>

                  <Link href={`/studio/review-queue/${art.id}`} className="text-base font-bold text-[#18181B] hover:underline block">
                    {art.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#A1A1AA] uppercase tracking-wider font-medium">
                    <span>By {art.authors.map((a) => a.name).join(", ")}</span>
                    <span>·</span>
                    <span>Updated {formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Comments count */}
                  {art.comments.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#71717A] font-bold uppercase tracking-wider border border-[#E4E4E7] px-2.5 py-1 bg-[#FAFAFA]">
                      <MessageCircle size={12} />
                      <span>{art.comments.length} Comments</span>
                    </div>
                  )}

                  <Link
                    href={`/studio/review-queue/${art.id}`}
                    className="bg-[#18181B] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest px-5 py-2.5 transition-colors border border-black"
                  >
                    Open Review
                  </Link>
                </div>
              </div>
            );
          })}

          {articles.length === 0 && (
            <div className="p-16 text-center text-sm text-[#A1A1AA] uppercase tracking-wider italic">
              No submissions currently pending review in your queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
