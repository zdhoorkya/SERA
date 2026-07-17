"use client";

import Link from "next/link";
import React from "react";

interface LinkItem {
  name: string;
  href: string;
}

interface MastheadProps {
  links?: LinkItem[];
  volumeInfo?: string;
}

const defaultLinks: LinkItem[] = [
  { name: "World", href: "/category/world" },
  { name: "India", href: "/category/india" },
  { name: "Business", href: "/category/business" },
  { name: "Technology", href: "/category/technology" },
  { name: "Politics", href: "/category/politics" },
  { name: "Culture", href: "/category/culture" },
  { name: "Opinion", href: "/category/opinion" },
];

export default function Masthead({ links = defaultLinks, volumeInfo = "Vol. I, No. 214" }: MastheadProps) {
  // Format current date to match "Friday, 17 July 2026" format
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="masthead border-b border-ink flex items-baseline justify-between px-6 md:px-10 py-[18px] bg-paper select-none">
      <div className="dateline font-sans text-[10px] md:text-[11px] tracking-[0.1em] uppercase text-soft shrink-0">
        {formattedDate} {volumeInfo ? `— ${volumeInfo}` : ""}
      </div>
      <div className="nav-links hidden lg:flex gap-[26px] font-sans text-[11px] tracking-[0.08em] uppercase text-soft">
        {links.map((link, idx) => (
          <Link key={idx} href={link.href} className="hover:text-ink transition-colors">
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
