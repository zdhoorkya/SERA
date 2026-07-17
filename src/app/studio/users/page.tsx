import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserDirectory from "@/components/studio/UserDirectory";

export const revalidate = 0; // Dynamic directory updates

export default async function StudioUsersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Authorization check (Admins only)
  if (user?.role !== "ADMIN") {
    redirect("/studio");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  return (
    <div className="space-y-8 select-none">
      {/* HEADER */}
      <div className="border-b border-[#E4E4E7] pb-6">
        <span className="text-[10px] font-semibold tracking-wider text-[#71717A] uppercase block mb-1">
          Identity Access Control
        </span>
        <h1 className="text-3xl font-bold tracking-tight uppercase text-[#18181B]">
          User Directory
        </h1>
        <p className="text-sm text-[#71717A] mt-1.5 uppercase font-medium tracking-wide">
          Manage system invitations, credentials, and access roles
        </p>
      </div>

      <UserDirectory 
        initialUsers={users} 
        currentUserId={user.id} 
      />
    </div>
  );
}
