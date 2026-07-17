import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Masthead from "@/components/layout/Masthead";

export const revalidate = 0; // Dynamic staff changes

export default async function MastheadStaffPage() {
  const staff = await prisma.user.findMany({
    where: { active: true },
    orderBy: { role: "asc" }, // Admin, then Editor, then Author
  });

  const admins = staff.filter((u) => u.role === "ADMIN");
  const editors = staff.filter((u) => u.role === "EDITOR");
  const authors = staff.filter((u) => u.role === "AUTHOR");

  return (
    <div className="bg-paper min-h-screen">
      <Masthead />
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16 select-none">
        <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2">
          Staff Registry
        </span>
        <h1 className="display-font font-medium text-4xl md:text-6xl text-ink uppercase mb-8">
          The Masthead
        </h1>
        <p className="font-serif italic text-base md:text-lg text-soft leading-relaxed mb-12">
          SERA is coordinated by a decentralized team of editors, correspondents, and developers under the Primpla ecosystem guidelines.
        </p>

        <div className="space-y-12">
          {/* LEADERSHIP */}
          {admins.length > 0 && (
            <div>
              <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-ink font-semibold border-b border-ink pb-2 mb-6">
                Editorial Leadership
              </h2>
              <ul className="space-y-4">
                {admins.map((u) => (
                  <li key={u.id} className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                    <Link href={`/author/${u.id}`} className="font-serif font-bold text-lg hover:underline text-ink">
                      {u.name}
                    </Link>
                    <span className="font-sans text-xs tracking-wide text-soft uppercase font-medium">
                      {u.title || "Administrator"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* EDITORS */}
          {editors.length > 0 && (
            <div>
              <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-ink font-semibold border-b border-ink pb-2 mb-6">
                Editorial Board & Desk
              </h2>
              <ul className="space-y-4">
                {editors.map((u) => (
                  <li key={u.id} className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                    <Link href={`/author/${u.id}`} className="font-serif font-bold text-lg hover:underline text-ink">
                      {u.name}
                    </Link>
                    <span className="font-sans text-xs tracking-wide text-soft uppercase font-medium">
                      {u.title || "Managing Editor"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CORRESPONDENTS */}
          {authors.length > 0 && (
            <div>
              <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-ink font-semibold border-b border-ink pb-2 mb-6">
                Correspondents & Writers
              </h2>
              <ul className="space-y-4">
                {authors.map((u) => (
                  <li key={u.id} className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                    <Link href={`/author/${u.id}`} className="font-serif font-bold text-lg hover:underline text-ink">
                      {u.name}
                    </Link>
                    <span className="font-sans text-xs tracking-wide text-soft uppercase font-medium">
                      {u.title || "Writer"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
