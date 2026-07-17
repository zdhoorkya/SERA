import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const targetUserId = parseInt(params.id, 10);
  if (isNaN(targetUserId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { role, active } = await req.json();

    // Prevent Admin from deactivating themselves
    if (active === false && targetUserId === parseInt(currentUser.id, 10)) {
      return NextResponse.json({ message: "Administrators cannot deactivate themselves" }, { status: 400 });
    }

    // Prevent Admin from changing their own role (optional, but good safeguard)
    if (role && role !== "ADMIN" && targetUserId === parseInt(currentUser.id, 10)) {
      return NextResponse.json({ message: "Administrators cannot demote their own account role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: role !== undefined ? role : targetUser.role,
        active: active !== undefined ? active : targetUser.active,
      },
    });

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (e) {
    console.error("PUT User API error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
