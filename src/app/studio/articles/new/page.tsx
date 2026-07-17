import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/studio/ArticleForm";

export const revalidate = 0; // Dynamic DB queries on load

export default async function NewArticleStudioPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user || {};

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
          Drafting Registry
        </span>
        <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
          Create New Article
        </h1>
        <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
          Compose your text and compile it to the database
        </p>
      </div>

      <ArticleForm 
        categories={categories} 
        authors={authors} 
        currentUser={user} 
      />
    </div>
  );
}
