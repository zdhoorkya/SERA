import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ArticleForm from "@/components/studio/ArticleForm";

interface EditArticleStudioPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Dynamic DB queries on load

export default async function EditArticleStudioPage({ params }: EditArticleStudioPageProps) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const articleId = parseInt(params.id, 10);
  if (isNaN(articleId)) {
    notFound();
  }

  // Fetch the article details
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { authors: true, tags: true },
  });

  if (!article) {
    notFound();
  }

  // Enforce Author edit limitations
  const isAuthor = user.role === "AUTHOR";
  const isOwner = article.authors.some((auth) => auth.id === parseInt(user.id, 10));

  if (isAuthor && !isOwner) {
    redirect("/studio/articles"); // Unauthorized redirect
  }

  // Fetch categories and authors for form mapping
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const authors = await prisma.user.findMany({
    where: { role: { in: ["AUTHOR", "EDITOR", "ADMIN"] }, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 select-none">
      {/* HEADER */}
      <div className="border-b border-[#E4E4E7] pb-6">
        <span className="text-[10px] font-semibold tracking-wider text-[#71717A] uppercase block mb-1">
          Editorial Registry
        </span>
        <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
          Edit Article
        </h1>
        <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
          Update document content and manage lifecycle statuses
        </p>
      </div>

      <ArticleForm 
        categories={categories} 
        authors={authors} 
        currentUser={user}
        initialArticle={article}
      />
    </div>
  );
}
