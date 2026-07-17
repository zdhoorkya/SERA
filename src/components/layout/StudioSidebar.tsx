"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Users, 
  ExternalLink, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface StudioSidebarProps {
  session: any;
}

export default function StudioSidebar({ session }: StudioSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const user = session?.user || {};
  const isAdmin = user.role === "ADMIN";

  const menuItems = [
    { name: "Overview", href: "/studio", icon: LayoutDashboard },
    { name: "Articles Database", href: "/studio/articles", icon: FileText },
    { name: "Review Queue", href: "/studio/review-queue", icon: ClipboardList },
  ];

  if (isAdmin) {
    menuItems.push({ name: "User Directory", href: "/studio/users", icon: Users });
  }

  const isActive = (href: string) => {
    if (href === "/studio") return pathname === "/studio";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE BAR */}
      <div className="md:hidden flex items-center justify-between bg-[#09090B] text-white px-6 py-4 border-b border-[#27272A] z-40 sticky top-0 select-none">
        <div className="flex flex-col">
          <span className="text-[9px] tracking-wider uppercase font-semibold text-[#A1A1AA]">Sera Digital</span>
          <span className="text-sm font-bold tracking-widest uppercase">Studio Control</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-[#E4E4E7]">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR WRAPPER */}
      <aside className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        transition-transform duration-300 ease-in-out
        fixed md:sticky top-[53px] md:top-0 left-0 bottom-0 w-64 bg-[#09090B] text-[#E4E4E7] border-r border-[#27272A] p-6 flex flex-col justify-between z-30 h-[calc(100vh-53px)] md:h-screen select-none
      `}>
        <div>
          {/* HEADER (DESKTOP) */}
          <div className="hidden md:block mb-8">
            <span className="text-[10px] tracking-[0.2em] font-semibold text-[#A1A1AA] uppercase block mb-2">
              Primpla Ecosystem
            </span>
            <div className="flex items-baseline gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SERA" className="h-5 w-auto invert brightness-0" />
              <span className="text-xs font-bold tracking-widest text-[#A1A1AA] uppercase">Studio</span>
            </div>
          </div>

          {/* USER INFO */}
          <div className="border-b border-[#27272A] pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#27272A] flex items-center justify-center font-bold text-white uppercase border border-[#3F3F46]">
                {user.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white uppercase tracking-wide">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-[#27272A] text-[9px] font-bold text-white uppercase tracking-widest rounded border border-[#3F3F46]">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MENU ITEMS */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wider uppercase rounded transition-colors
                    ${active 
                      ? "bg-[#18181B] text-white border-l-2 border-white" 
                      : "text-[#A1A1AA] hover:bg-[#18181B] hover:text-white"
                    }
                  `}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ExternalLink size={16} />
            <span>Public Site</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-[#F87171] hover:bg-[#7F1D1D]/20 hover:text-white rounded transition-colors"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
