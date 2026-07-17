import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const execAsync = promisify(exec);

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
    console.log("Starting production database setup...");
    
    // 1. Run Prisma Db Push to sync the database schema on Hostinger's filesystem
    const { stdout, stderr } = await execAsync("npx prisma db push --accept-data-loss");
    console.log("DB Push stdout:", stdout);
    if (stderr) console.warn("DB Push stderr:", stderr);

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
      message: "Database push and seeding completed successfully!",
      stdout,
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
