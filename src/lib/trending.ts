import { prisma } from "./prisma";

let cachedTrending: any[] = [];
let lastFetched = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function getTrendingArticles() {
  const now = Date.now();
  if (cachedTrending.length > 0 && now - lastFetched < CACHE_DURATION) {
    return cachedTrending;
  }

  try {
    const clockLimit = new Date(now - 6 * 60 * 60 * 1000);

    // Query DB to find view event counts per article in the last 6 hours
    const viewCounts = await prisma.viewEvent.groupBy({
      by: ["articleId"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: clockLimit,
        },
        article: {
          status: "PUBLISHED",
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // Fetch the detailed article records
    const articleIds = viewCounts.map((v) => v.articleId);

    const articles = await prisma.article.findMany({
      where: {
        id: {
          in: articleIds,
        },
      },
      include: {
        category: true,
        authors: {
          select: { name: true },
        },
      },
    });

    // Map view event counts to preserve the correct velocity-based order
    const orderedArticles = viewCounts
      .map((vc) => {
        const art = articles.find((a) => a.id === vc.articleId);
        if (!art) return null;
        return {
          ...art,
          trendingCount: vc._count.id,
        };
      })
      .filter((a) => a !== null) as any[];

    // Fallback: If less than 5 articles have view events in the last 6 hours,
    // fill the remaining slots with the most viewed articles overall
    if (orderedArticles.length < 5) {
      const existingIds = orderedArticles.map((a) => a.id);
      const fallbacks = await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          id: {
            notIn: existingIds,
          },
        },
        orderBy: {
          views: "desc",
        },
        take: 5 - orderedArticles.length,
        include: {
          category: true,
          authors: {
            select: { name: true },
          },
        },
      });

      orderedArticles.push(
        ...fallbacks.map((f) => ({
          ...f,
          trendingCount: 0,
        }))
      );
    }

    cachedTrending = orderedArticles.slice(0, 5);
    lastFetched = now;
    return cachedTrending;
  } catch (error) {
    console.error("Error computing trending articles:", error);
    return cachedTrending;
  }
}
