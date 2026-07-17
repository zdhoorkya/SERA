import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (currentUser.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { email, name, role } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "A user with that email already exists" }, { status: 400 });
    }

    // Default temporary password
    const defaultPassword = "password123";
    const passwordHash = bcrypt.hashSync(defaultPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: passwordHash,
        active: true,
      },
    });

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        tempPassword: defaultPassword
      }, 
      { status: 201 }
    );
  } catch (e) {
    console.error("Create User API error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
