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

  try {
    const { articleId, text } = await req.json();

    if (!articleId || !text || !text.trim()) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const comment = await prisma.reviewComment.create({
      data: {
        articleId: parseInt(articleId, 10),
        userId: parseInt(user.id, 10),
        text: text.trim(),
      },
    });

    // Touch the article's updatedAt timestamp to signal activity in the queue
    await prisma.article.update({
      where: { id: parseInt(articleId, 10) },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: "Comment added successfully", comment }, { status: 201 });
  } catch (e) {
    console.error("Create Review Comment error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
