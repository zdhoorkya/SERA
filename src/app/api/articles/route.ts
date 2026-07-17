import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const userRole = user.role;

  try {
    const data = await req.json();
    const {
      title,
      slug,
      deck,
      body,
      categoryId,
      heroImage,
      caption,
      isOpinion,
      isPinnedToHeadlines,
      headlineOrder,
      status,
      publishDate,
      authorIds,
      tags,
      seoTitle,
      seoDesc,
      canonicalUrl,
      ogImage,
    } = data;

    if (!title || !body || !categoryId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Generate/verify unique slug
    let baseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseSlug) baseSlug = "article";
    
    let finalSlug = baseSlug;
    let count = 1;
    while (true) {
      const existing = await prisma.article.findUnique({ where: { slug: finalSlug } });
      if (!existing) break;
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    // 2. Enforce approval workflows on status
    let finalStatus = status || "DRAFT";
    
    if (finalStatus === "PUBLISHED" || finalStatus === "SCHEDULED") {
      if (userRole === "AUTHOR") {
        // Authors cannot self-publish or skip review
        finalStatus = "IN_REVIEW";
      } else if (userRole === "EDITOR") {
        // Editors cannot self-publish directly, must be verified by admin
        finalStatus = "PENDING_ADMIN";
      }
      // Admins can set directly to PUBLISHED
    }

    // 3. Auto-calculate read time (200 words per minute)
    const plainText = body.replace(/<[^>]*>/g, " ").trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // 4. Resolve authors
    let finalAuthorIds = authorIds || [];
    if (userRole === "AUTHOR") {
      // Authors must be listed as authors
      const currentAuthorId = parseInt(user.id, 10);
      if (!finalAuthorIds.includes(currentAuthorId)) {
        finalAuthorIds.push(currentAuthorId);
      }
    } else if (finalAuthorIds.length === 0) {
      // Default to current user
      finalAuthorIds.push(parseInt(user.id, 10));
    }

    // 5. Connect tags
    const tagConnectOrCreate = (tags || []).map((t: string) => {
      const trimmed = t.trim();
      return {
        where: { name: trimmed },
        create: { name: trimmed, slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      };
    });

    // 6. Create Article
    const article = await prisma.article.create({
      data: {
        title,
        slug: finalSlug,
        deck,
        body,
        categoryId: parseInt(categoryId, 10),
        heroImage,
        caption,
        status: finalStatus,
        isOpinion: !!isOpinion,
        isPinnedToHeadlines: !!isPinnedToHeadlines,
        headlineOrder: headlineOrder ? parseInt(headlineOrder.toString(), 10) : 0,
        publishDate: publishDate ? new Date(publishDate) : null,
        readTime,
        seoTitle,
        seoDesc,
        canonicalUrl,
        ogImage,
        authors: {
          connect: finalAuthorIds.map((id: number) => ({ id })),
        },
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
    });

    return NextResponse.json({ message: "Article created successfully", article }, { status: 201 });
  } catch (e) {
    console.error("Create Article API error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
