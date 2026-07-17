import React from "react";
import { prisma } from "@/lib/prisma";
import SpineNavigation from "@/components/layout/SpineNavigation";
import Footer from "@/components/layout/Footer";

export const revalidate = 0; // Disable static caching so content updates instantly

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all categories to feed the navigation spine
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { name: true, slug: true },
    });
  } catch (e) {
    console.warn("Failed to fetch categories for spine navigation:", e);
  }

  return (
    <div className="layout min-h-screen flex flex-col md:flex-row bg-paper text-ink selection:bg-ink selection:text-paper">
      <SpineNavigation categories={categories} />
      <main className="main flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
