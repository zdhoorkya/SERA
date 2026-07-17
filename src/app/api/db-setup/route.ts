import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Security check to avoid unauthorized execution
  if (secret !== "sera-setup-12345") {
    return NextResponse.json(
      { message: "Unauthorized. Please provide the correct setup secret." },
      { status: 401 }
    );
  }

  try {
    console.log("Starting production database setup via raw SQL queries...");

    // Execute CREATE TABLE statements sequentially
    const queries = [
      `CREATE TABLE IF NOT EXISTS "User" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'AUTHOR',
        "title" TEXT,
        "bio" TEXT,
        "headshot" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "Category" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "displayOrder" INTEGER NOT NULL DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS "Tag" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS "Article" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "deck" TEXT,
        "body" TEXT NOT NULL,
        "categoryId" INTEGER NOT NULL,
        "heroImage" TEXT,
        "caption" TEXT,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "publishDate" DATETIME,
        "readTime" INTEGER NOT NULL DEFAULT 1,
        "seoTitle" TEXT,
        "seoDesc" TEXT,
        "canonicalUrl" TEXT,
        "ogImage" TEXT,
        "views" INTEGER NOT NULL DEFAULT 0,
        "isOpinion" BOOLEAN NOT NULL DEFAULT false,
        "isPinnedToHeadlines" BOOLEAN NOT NULL DEFAULT false,
        "headlineOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "ReviewComment" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "articleId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        "text" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReviewComment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ReviewComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "ViewEvent" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "articleId" INTEGER NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ViewEvent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "_ArticleAuthors" (
        "A" INTEGER NOT NULL,
        "B" INTEGER NOT NULL,
        CONSTRAINT "_ArticleAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_ArticleAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS "_ArticleTags" (
        "A" INTEGER NOT NULL,
        "B" INTEGER NOT NULL,
        CONSTRAINT "_ArticleTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_ArticleTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleAuthors_AB_unique" ON "_ArticleAuthors"("A", "B")`,
      `CREATE INDEX IF NOT EXISTS "_ArticleAuthors_B_index" ON "_ArticleAuthors"("B")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleTags_AB_unique" ON "_ArticleTags"("A", "B")`,
      `CREATE INDEX IF NOT EXISTS "_ArticleTags_B_index" ON "_ArticleTags"("B")`
    ];

    for (const sql of queries) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log("All tables and indexes verified/created.");

    // 2. Programmatically seed the database if categories do not exist
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log("No categories found. Seeding initial data...");

      // Hash password
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create Users
      const admin = await prisma.user.create({
        data: {
          email: "admin@sera.com",
          password: hashedPassword,
          name: "Siddharth Sen",
          role: "ADMIN",
          title: "Editor-in-Chief",
          bio: "Managing director and editor-in-chief of SERA.",
        },
      });

      const editor = await prisma.user.create({
        data: {
          email: "editor@sera.com",
          password: hashedPassword,
          name: "Devika Roy",
          role: "EDITOR",
          title: "Senior Copy Editor",
          bio: "Handles review queues, quality checking, and editorial policy.",
        },
      });

      const author1 = await prisma.user.create({
        data: {
          email: "author@sera.com",
          password: hashedPassword,
          name: "Sarah Thorne",
          role: "AUTHOR",
          title: "Staff Writer",
          bio: "Focuses on analog culture, media critique, and design longevity.",
        },
      });

      const author2 = await prisma.user.create({
        data: {
          email: "writer2@sera.com",
          password: hashedPassword,
          name: "Aman Verma",
          role: "AUTHOR",
          title: "Tech Reporter",
          bio: "Covers infrastructure, silicon trends, and cooling technologies.",
        },
      });

      // Categories
      const categoriesData = [
        { name: "World", slug: "world" },
        { name: "India", slug: "india" },
        { name: "Business", slug: "business" },
        { name: "Technology", slug: "technology" },
        { name: "Politics", slug: "politics" },
        { name: "Culture", slug: "culture" },
        { name: "Celebrity", slug: "celebrity" },
        { name: "Lifestyle", slug: "lifestyle" },
        { name: "Opinion", slug: "opinion" },
      ];

      const dbCategories: Record<string, any> = {};
      for (const cat of categoriesData) {
        const created = await prisma.category.create({ data: cat });
        dbCategories[cat.slug] = created;
      }

      // Tags
      const tagsData = ["Infrastructure", "Computing", "Slow Living", "Analog", "Identity"];
      const dbTags: Record<string, any> = {};
      for (const t of tagsData) {
        const created = await prisma.tag.create({
          data: { name: t, slug: t.toLowerCase().replace(/\s+/g, "-") },
        });
        dbTags[t] = created;
      }

      // Sample Articles
      const sampleArticles = [
        {
          title: "The Quiet Race to Control the World's Cooling Supply Chains",
          slug: "quiet-race-control-worlds-cooling-supply-chains",
          deck: "As global temperatures break records, the infrastructure of cold storage and transport becomes a critical geopolitical bottleneck.",
          body: `<p class="first">The modern world is built on a delicate, invisible grid of coldness. From mRNA vaccines that must be kept at sub-zero temperatures to the lithium-ion batteries powering electric vehicles, cooling is no longer a luxury of comfort—it is a baseline requirement of industrial society.</p>
<p>As summers grow longer and hotter, the machinery required to maintain these thermal margins is consuming a larger share of global energy resources.</p>
<p>But the race to control cooling is not just about energy; it is about physical hardware. A single country now manufactures more than sixty percent of the world's commercial refrigeration compressors, creating a supply chain vulnerability that mirrors the semiconductor market.</p>`,
          categoryId: dbCategories["technology"].id,
          heroImage: "https://picsum.photos/id/1043/800/600",
          caption: "Industrial liquid cooling towers operating in a high-density server farm.",
          status: "PUBLISHED",
          isOpinion: false,
          readTime: 5,
          publishDate: new Date("2026-07-16T10:00:00.000Z"),
          authors: { connect: [{ id: author2.id }] },
          tags: { connect: [{ id: dbTags["Infrastructure"].id }, { id: dbTags["Computing"].id }] },
        },
        {
          title: "An Interview with Sarah Thorne on Analog Longevity",
          slug: "interview-sarah-thorne-analog-longevity",
          deck: "The screen icon discusses her decision to move off social networks and focus on theatrical film print archives.",
          body: `<p class="first">Sarah Thorne, celebrated for her decades in character cinema, sits down with SERA to discuss why she refuses to allow digital distribution of her archives.</p>
<p>"Physical film contains a grain that represents time. Digital pixels represent a copy of time," she tells us. Her archives will be housed in an e-ink indexed facility.</p>`,
          categoryId: dbCategories["celebrity"].id,
          heroImage: "https://picsum.photos/id/1062/800/600",
          caption: "A high-contrast profile of Sarah Thorne looking out a window.",
          status: "PUBLISHED",
          isOpinion: false,
          readTime: 6,
          publishDate: new Date("2026-07-15T14:00:00.000Z"),
          authors: { connect: [{ id: author1.id }] },
          tags: { connect: [{ id: dbTags["Analog"].id }, { id: dbTags["Slow Living"].id }] },
        },
        {
          title: "When Chips Freeze: The Silicon Transition to Fine Cooling",
          slug: "chips-fine-cooling-breaks-first",
          deck: "How micro-refrigeration arrays on processor dies are rewriting physics inside high-performance computing centers.",
          body: `<p class="first">For fifty years, silicon chips have been cooled by blowing air over aluminum fins or circulating liquid through metal blocks. But at sub-two-nanometer scales, standard thermal conduction is failing.</p>
<p>New designs introduce microscopic channels directly into the active silicon substrate, pumping non-conductive dielectric fluids micrometers away from transistor gates.</p>`,
          categoryId: dbCategories["technology"].id,
          heroImage: "https://picsum.photos/id/1044/800/600",
          caption: "A macro detail of a liquid-submerged silicon wafer showing refraction.",
          status: "PUBLISHED",
          isOpinion: false,
          readTime: 4,
          publishDate: new Date("2026-07-15T09:30:00.000Z"),
          authors: { connect: [{ id: author2.id }] },
          tags: { connect: [{ id: dbTags["Computing"].id }, { id: dbTags["Infrastructure"].id }] },
          isPinnedToHeadlines: true,
          headlineOrder: 3,
        },
        {
          title: "Mistaking Speed for Progress in the Anthropocene",
          slug: "mistaking-speed-for-progress",
          deck: "An inquiry into why accelerationism fails to deliver resilience in community infrastructure.",
          body: `<p class="first">We are obsessed with speed. The metric of success for everything from internet connections to transportation networks is latency reduction. But resilience requires buffer times.</p>
<p>When you optimize a system to run at maximum velocity with zero slack, you remove the system's ability to survive a shock.</p>`,
          categoryId: dbCategories["opinion"].id,
          heroImage: "https://picsum.photos/id/1057/800/600",
          caption: "A long-exposure light trail of vehicles along a coastal causeway.",
          status: "PUBLISHED",
          isOpinion: true,
          readTime: 7,
          publishDate: new Date("2026-07-14T11:00:00.000Z"),
          authors: { connect: [{ id: admin.id }] },
          tags: { connect: [{ id: dbTags["Slow Living"].id }] },
          isPinnedToHeadlines: true,
          headlineOrder: 4,
        },
      ];

      for (const art of sampleArticles) {
        await prisma.article.create({ data: art });
      }

      // Seed view events for trending calculation velocity
      const dbArticles = await prisma.article.findMany();
      const now = new Date();
      for (const art of dbArticles) {
        let count = 0;
        if (art.slug === "interview-sarah-thorne-analog-longevity") count = 38;
        else if (art.slug === "quiet-race-control-worlds-cooling-supply-chains") count = 30;
        else if (art.slug === "chips-fine-cooling-breaks-first") count = 22;
        else if (art.slug === "mistaking-speed-for-progress") count = 16;

        for (let i = 0; i < count; i++) {
          const minutesAgo = Math.floor(Math.random() * 300); // within last 5 hours
          const eventTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
          await prisma.viewEvent.create({
            data: {
              articleId: art.id,
              createdAt: eventTime,
            },
          });
        }
      }
      console.log("Seeding complete!");
    } else {
      console.log("Database already initialized. Skipping seed.");
    }

    return NextResponse.json({
      message: "Database schema verification and seeding completed successfully!",
    });
  } catch (error: any) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        message: "Failed to setup database.",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}
