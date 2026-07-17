import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StudioSidebar from "@/components/layout/StudioSidebar";

export const revalidate = 0;

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If there is no session, we render without the dashboard shell (intended for login page)
  if (!session) {
    return <div className="bg-[#F4F4F5] min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-[#18181B] font-sans antialiased">
      {/* SIDEBAR NAVIGATION SHELL */}
      <StudioSidebar session={session} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
