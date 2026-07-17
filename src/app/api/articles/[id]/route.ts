import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const articleId = parseInt(params.id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const user = session.user as any;

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { authors: true },
    });

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const isAuthor = user.role === "AUTHOR";
    const isOwner = article.authors.some((auth) => auth.id === parseInt(user.id, 10));

    if (isAuthor) {
      if (!isOwner) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      if (article.status !== "DRAFT") {
        return NextResponse.json(
          { message: "Authors can only delete draft articles. Submissions in review cannot be deleted." },
          { status: 400 }
        );
      }
    }

    await prisma.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (e) {
    console.error("DELETE article error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const articleId = parseInt(params.id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const user = session.user as any;
  const userRole = user.role;

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { authors: true, tags: true },
    });

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const isAuthor = user.role === "AUTHOR";
    const isOwner = article.authors.some((auth) => auth.id === parseInt(user.id, 10));

    // Authors can only edit their own articles
    if (isAuthor && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

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

    // Verify slug uniqueness if changed
    let finalSlug = article.slug;
    if (slug && slug !== article.slug) {
      let baseSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      finalSlug = baseSlug;
      let count = 1;
      while (true) {
        const existing = await prisma.article.findUnique({
          where: { slug: finalSlug },
        });
        if (!existing || existing.id === articleId) break;
        finalSlug = `${baseSlug}-${count}`;
        count++;
      }
    }

    // Workflow restrictions on state changes
    let finalStatus = status || article.status;
    if (status === "PUBLISHED" || status === "SCHEDULED") {
      if (userRole === "AUTHOR") {
        finalStatus = "IN_REVIEW";
      } else if (userRole === "EDITOR") {
        finalStatus = "PENDING_ADMIN";
      }
    }

    // Auto-calculate readTime (200 WPM)
    let readTime = article.readTime;
    if (body) {
      const plainText = body.replace(/<[^>]*>/g, " ").trim();
      const wordCount = plainText ? plainText.split(/\s+/).length : 0;
      readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Resolve authors connection
    let authorsUpdate: any = {};
    if (!isAuthor && authorIds) {
      // Admins/Editors can edit authors list
      authorsUpdate = {
        set: authorIds.map((id: number) => ({ id })),
      };
    }

    // Connect/create tags
    let tagsUpdate: any = {};
    if (tags) {
      const tagConnectOrCreate = tags.map((t: string) => {
        const trimmed = t.trim();
        return {
          where: { name: trimmed },
          create: { name: trimmed, slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        };
      });
      tagsUpdate = {
        set: [], // Clear old tags
        connectOrCreate: tagConnectOrCreate,
      };
    }

    // Update DB
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title !== undefined ? title : article.title,
        slug: finalSlug,
        deck: deck !== undefined ? deck : article.deck,
        body: body !== undefined ? body : article.body,
        categoryId: categoryId !== undefined ? parseInt(categoryId, 10) : article.categoryId,
        heroImage: heroImage !== undefined ? heroImage : article.heroImage,
        caption: caption !== undefined ? caption : article.caption,
        status: finalStatus,
        isOpinion: isOpinion !== undefined ? !!isOpinion : article.isOpinion,
        isPinnedToHeadlines: isPinnedToHeadlines !== undefined ? !!isPinnedToHeadlines : article.isPinnedToHeadlines,
        headlineOrder: headlineOrder !== undefined ? parseInt(headlineOrder.toString(), 10) : article.headlineOrder,
        publishDate: publishDate !== undefined ? (publishDate ? new Date(publishDate) : null) : article.publishDate,
        readTime,
        seoTitle: seoTitle !== undefined ? seoTitle : article.seoTitle,
        seoDesc: seoDesc !== undefined ? seoDesc : article.seoDesc,
        canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : article.canonicalUrl,
        ogImage: ogImage !== undefined ? ogImage : article.ogImage,
        authors: authorsUpdate,
        tags: tagsUpdate,
      },
    });

    return NextResponse.json({ message: "Article updated successfully", article: updatedArticle });
  } catch (e) {
    console.error("PUT article error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
