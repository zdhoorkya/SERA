import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, Eye, ClipboardList, CheckSquare, Users } from "lucide-react";
import ProfileSettingsForm from "@/components/studio/ProfileSettingsForm";

export const revalidate = 0; // Fresh metrics on load

export default async function StudioDashboardOverview() {
  const session = await getServerSession(authOptions);
  const user = session?.user || {};

  // Fetch counts and metrics
  const totalArticles = await prisma.article.count();
  const totalPublished = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const pendingReviewCount = await prisma.article.count({ where: { status: "IN_REVIEW" } });
  const pendingAdminCount = await prisma.article.count({ where: { status: "PENDING_ADMIN" } });
  
  // Sum views
  const viewsAggregate = await prisma.article.aggregate({
    _sum: { views: true },
  });
  const totalViews = viewsAggregate._sum.views || 0;

  const totalAuthors = await prisma.user.count({ where: { role: "AUTHOR" } });

  // Fetch top 5 viewed articles
  const topArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { authors: true, category: true },
    orderBy: { views: "desc" },
    take: 5,
  });

  // Fetch recent review queue items (IN_REVIEW and PENDING_ADMIN)
  const reviewQueue = await prisma.article.findMany({
    where: {
      status: { in: ["IN_REVIEW", "PENDING_ADMIN"] },
    },
    include: { authors: true, category: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const cards = [
    { name: "Total Articles", value: totalArticles, icon: FileText, desc: `${totalPublished} Published` },
    { name: "Total Reads / Views", value: totalViews.toLocaleString(), icon: Eye, desc: "Lifetime article reads" },
    { name: "Pending Editor Review", value: pendingReviewCount, icon: ClipboardList, desc: "Awaiting editorial check", link: "/studio/review-queue" },
    { name: "Pending Admin Verify", value: pendingAdminCount, icon: CheckSquare, desc: "Awaiting admin publish", link: "/studio/review-queue" },
  ];

  return (
    <div className="space-y-10 select-none">
      {/* HEADER */}
      <div className="border-b border-[#E4E4E7] pb-6">
        <span className="text-[10px] font-semibold tracking-wider text-[#71717A] uppercase block mb-1">
          Operations Overview
        </span>
        <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
          Dashboard Overview
        </h1>
        <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
          Welcome back, {user.name} · Role: {user.role}
        </p>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white border border-[#E4E4E7] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                  {card.name}
                </p>
                <p className="text-3xl font-bold text-[#18181B] mt-2">
                  {card.value}
                </p>
              </div>
              <div className="p-2 bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B]">
                <card.icon size={18} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F4F4F5] flex justify-between items-center text-[11px] font-semibold tracking-wider text-[#71717A] uppercase">
              <span>{card.desc}</span>
              {card.link && (
                <Link href={card.link} className="text-[#18181B] hover:underline">
                  View Queue →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* REVIEW QUEUE MODULE */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3.5 mb-5">
            Active Review Queue ({reviewQueue.length})
          </h2>

          <div className="divide-y divide-[#F4F4F5]">
            {reviewQueue.map((art) => (
              <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                <div className="min-w-0">
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border rounded mr-2 ${
                    art.status === "PENDING_ADMIN" 
                      ? "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]" 
                      : "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]"
                  }`}>
                    {art.status === "PENDING_ADMIN" ? "Admin" : "Editor"}
                  </span>
                  <Link href={`/studio/review-queue`} className="text-sm font-semibold text-[#18181B] hover:underline truncate inline-block max-w-[180px]">
                    {art.title}
                  </Link>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider mt-1">
                    {art.category.name}
                  </p>
                </div>
                <Link 
                  href={`/studio/review-queue`}
                  className="bg-[#18181B] hover:bg-black text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 transition-colors border border-black shrink-0"
                >
                  Moderate
                </Link>
              </div>
            ))}

            {reviewQueue.length === 0 && (
              <div className="py-8 text-center text-xs text-[#A1A1AA] uppercase tracking-wider italic">
                Queue is empty. No articles pending.
              </div>
            )}
          </div>
        </div>

        {/* TOP PERFORMING ARTICLES */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3.5 mb-5">
            Top Pieces (Reads)
          </h2>

          <div className="divide-y divide-[#F4F4F5]">
            {topArticles.map((art) => (
              <div key={art.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center">
                <div className="min-w-0">
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block mb-0.5">
                    {art.category.name}
                  </span>
                  <Link href={`/article/${art.slug}`} target="_blank" className="text-sm font-semibold text-[#18181B] hover:underline truncate block max-w-[200px]">
                    {art.title}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#18181B] border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1">
                  <Eye size={12} className="text-[#71717A]" />
                  <span>{art.views}</span>
                </div>
              </div>
            ))}

            {topArticles.length === 0 && (
              <div className="py-8 text-center text-xs text-[#A1A1AA] uppercase tracking-wider italic">
                No published analytics views.
              </div>
            )}
          </div>
        </div>

        {/* PROFILE SETTINGS FORM */}
        <ProfileSettingsForm currentUser={user} />
      </div>
    </div>
  );
}
