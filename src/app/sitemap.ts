import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sera.primpla.com";

  // Fetch published articles
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  // Fetch categories
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  // Fetch authors
  const authors = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, updatedAt: true },
  });

  const articleEntries = articles.map((art) => ({
    url: `${baseUrl}/article/${art.slug}`,
    lastModified: art.updatedAt,
  }));

  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
  }));

  const authorEntries = authors.map((auth) => ({
    url: `${baseUrl}/author/${auth.id}`,
    lastModified: auth.updatedAt,
  }));

  const staticEntries = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/masthead`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
  ];

  return [...staticEntries, ...categoryEntries, ...articleEntries, ...authorEntries];
}
