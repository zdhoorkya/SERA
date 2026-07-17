import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticlesFilterHeader from "@/components/studio/ArticlesFilterHeader";
import DeleteArticleButton from "@/components/studio/DeleteArticleButton";
import { FileText, Plus, Edit3, MessageCircle } from "lucide-react";

export const revalidate = 0; // Dynamic database results

interface ArticlesPageProps {
  searchParams: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    q?: string;
    from?: string;
    to?: string;
  };
}

export default async function StudioArticlesDatabasePage({ searchParams }: ArticlesPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user || {};
  const isAuthor = user.role === "AUTHOR";

  // Parse filters
  const status = searchParams.status || undefined;
  const categoryId = searchParams.categoryId ? parseInt(searchParams.categoryId, 10) : undefined;
  const authorId = searchParams.authorId ? parseInt(searchParams.authorId, 10) : undefined;
  const q = searchParams.q || "";
  const dateFrom = searchParams.from ? new Date(searchParams.from) : undefined;
  const dateTo = searchParams.to ? new Date(searchParams.to) : undefined;

  // Build Prisma query filters
  const whereClause: any = {};

  // Authors can only see/edit their own articles unless they are ADMIN or EDITOR
  if (isAuthor) {
    whereClause.authors = {
      some: { id: parseInt(user.id, 10) },
    };
  } else if (authorId) {
    whereClause.authors = {
      some: { id: authorId },
    };
  }

  if (status) {
    whereClause.status = status;
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { deck: { contains: q } },
      { body: { contains: q } },
    ];
  }

  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) whereClause.createdAt.gte = dateFrom;
    if (dateTo) whereClause.createdAt.lte = dateTo;
  }

  // Fetch articles based on filter
  const articles = await prisma.article.findMany({
    where: whereClause,
    include: { authors: true, category: true, comments: true },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch categories and authors for filters
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const authors = await prisma.user.findMany({
    where: { role: { in: ["AUTHOR", "EDITOR", "ADMIN"] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E4E7] pb-6 gap-4">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-[#71717A] uppercase block mb-1">
            Article Control Center
          </span>
          <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
            Articles Database
          </h1>
          <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
            {isAuthor ? "Manage and draft your personal pieces" : "System-wide publishing dashboard"}
          </p>
        </div>

        <Link
          href="/studio/articles/new"
          className="flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase px-5 py-3 transition-colors border border-black"
        >
          <Plus size={14} />
          <span>Create New Article</span>
        </Link>
      </div>

      {/* FILTER CONTROLS */}
      <ArticlesFilterHeader categories={categories} authors={authors} isAuthor={isAuthor} />

      {/* ARTICLES TABLE MODULE */}
      <div className="bg-white border border-[#E4E4E7] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[#71717A] font-semibold tracking-wider uppercase">
              <th className="p-4 w-1/3">Title</th>
              <th className="p-4">Author(s)</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Reads</th>
              <th className="p-4 text-center">Reviews</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E4E7]">
            {articles.map((art) => {
              const formattedDate = new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date(art.updatedAt));

              return (
                <tr key={art.id} className="hover:bg-[#FAFAFA] transition-colors">
                  {/* TITLE */}
                  <td className="p-4 font-semibold text-[#18181B]">
                    <div className="min-w-0">
                      <Link href={art.status === "PUBLISHED" ? `/article/${art.slug}` : `/studio/articles/${art.id}/edit`} target={art.status === "PUBLISHED" ? "_blank" : undefined} className="hover:underline text-sm font-bold block truncate max-w-[280px]">
                        {art.title}
                      </Link>
                      <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide block mt-1">
                        Updated {formattedDate}
                      </span>
                    </div>
                  </td>

                  {/* AUTHORS */}
                  <td className="p-4 text-[#52525B] font-medium uppercase tracking-wide">
                    {art.authors.map((a) => a.name).join(", ")}
                  </td>

                  {/* CATEGORY */}
                  <td className="p-4 text-[#52525B] font-medium uppercase tracking-wide">
                    {art.category.name}
                  </td>

                  {/* STATUS BADGE */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded ${
                      art.status === "PUBLISHED"
                        ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                        : art.status === "PENDING_ADMIN"
                        ? "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]"
                        : art.status === "IN_REVIEW"
                        ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
                        : art.status === "CHANGES_REQUESTED"
                        ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                        : "bg-[#F4F4F5] border-[#E4E4E7] text-[#71717A]"
                    }`}>
                      {art.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* READS */}
                  <td className="p-4 text-center text-[#18181B] font-bold text-sm">
                    {art.status === "PUBLISHED" ? art.views.toLocaleString() : "—"}
                  </td>

                  {/* REVIEWS COMMENTS */}
                  <td className="p-4 text-center text-[#71717A]">
                    {art.comments.length > 0 ? (
                      <div className="inline-flex items-center gap-1.5 font-bold">
                        <MessageCircle size={12} />
                        <span>{art.comments.length}</span>
                      </div>
                    ) : (
                      "0"
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3.5">
                      <Link
                        href={`/studio/articles/${art.id}/edit`}
                        className="text-[#52525B] hover:text-[#18181B] flex items-center gap-1 font-semibold uppercase tracking-wider"
                        title="Edit Article"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </Link>
                      
                      {/* Delete button (Admins/Editors or Author if Draft) */}
                      {(!isAuthor || art.status === "DRAFT") && (
                        <DeleteArticleButton articleId={art.id} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {articles.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-sm text-[#A1A1AA] uppercase tracking-wider italic">
                  No articles found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
