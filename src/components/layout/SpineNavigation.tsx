"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, User, Compass } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface Category {
  name: string;
  slug: string;
}

interface SpineNavigationProps {
  categories: Category[];
}

export default function SpineNavigation({ categories }: SpineNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  const isActive = (slug: string) => pathname === `/category/${slug}`;

  return (
    <>
      {/* DESKTOP SPINE (w-16, md:flex hidden) */}
      <aside className="hidden md:flex w-16 flex-col items-center justify-between py-6 border-r border-ink sticky top-0 h-screen bg-paper z-40 select-none">
        {/* LOGO IMAGE */}
        <Link href="/" className="hover:opacity-80 transition-opacity my-3 shrink-0 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SERA" className="w-[42px] h-auto grayscale-img" />
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="flex flex-col gap-4 items-center my-auto py-4">
          {categories.map((cat) => {
            const active = isActive(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`[writing-mode:vertical-rl] text-[10px] tracking-[0.12em] uppercase font-sans transition-colors ${
                  active ? "text-ink font-semibold" : "text-soft hover:text-ink"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM UTILITY / FOOTER */}
        <div className="flex flex-col gap-4 items-center shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-soft hover:text-ink transition-colors"
            title="Search"
          >
            <Search size={16} />
          </button>
          
          <Link
            href={session ? "/studio" : "/studio/login"}
            className="text-soft hover:text-ink transition-colors"
            title={session ? "Go to Studio" : "Sign In"}
          >
            <User size={16} />
          </Link>

          <span className="text-[9px] text-faint [writing-mode:vertical-rl] tracking-[0.1em] mt-1">
            SERA / PRIMPLA
          </span>
        </div>
      </aside>

      {/* MOBILE HEADER (md:hidden visible) */}
      <header className="md:hidden flex flex-col w-full border-b border-ink sticky top-0 bg-paper z-40">
        <div className="flex items-center justify-between px-6 py-3">
          {/* MOBILE TOGGLE MENU */}
          <button onClick={() => setMobileMenuOpen(true)} className="text-ink">
            <Menu size={20} />
          </button>

          {/* LOGO IMAGE */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="SERA" className="h-5 w-auto grayscale-img" />
          </Link>

          {/* SEARCH & STUDIO */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-ink">
              <Search size={18} />
            </button>
            <Link href={session ? "/studio" : "/studio/login"} className="text-ink">
              <User size={18} />
            </Link>
          </div>
        </div>

        {/* HORIZONTAL CATEGORIES SUB-NAV */}
        <div className="flex items-center gap-5 overflow-x-auto px-6 py-2.5 border-t border-line no-scrollbar bg-paper">
          {categories.map((cat) => {
            const active = isActive(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`text-[9px] tracking-[0.1em] uppercase font-sans shrink-0 transition-colors ${
                  active ? "text-ink font-semibold border-b border-ink" : "text-soft"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-ink bg-opacity-40 z-50 transition-opacity">
          <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-paper p-8 flex flex-col justify-between border-r border-ink">
            <div>
              <div className="flex items-center justify-between mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="SERA" className="h-6 w-auto grayscale-img" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-ink">
                  <X size={20} />
                </button>
              </div>

              {/* SEARCH IN DRAWER */}
              <form onSubmit={handleSearchSubmit} className="mb-8 relative border-b border-ink pb-2">
                <input
                  type="text"
                  placeholder="SEARCH ARTICLES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-[11px] font-sans tracking-[0.1em] outline-none text-ink placeholder-faint uppercase"
                />
                <button type="submit" className="absolute right-0 top-0 text-soft hover:text-ink">
                  <Search size={16} />
                </button>
              </form>

              {/* NAV LINKS */}
              <nav className="flex flex-col gap-5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-[12px] tracking-[0.12em] uppercase font-sans ${
                    pathname === "/" ? "text-ink font-semibold" : "text-soft"
                  }`}
                >
                  Home
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[12px] tracking-[0.12em] uppercase font-sans ${
                      isActive(cat.slug) ? "text-ink font-semibold" : "text-soft"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* DRAWER FOOTER */}
            <div>
              {session && (
                <div className="mb-6">
                  <p className="text-[11px] font-sans text-faint mb-2">SIGNED IN AS: {session.user.name}</p>
                  <Link
                    href="/studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[11px] font-sans font-semibold tracking-wider text-ink mb-2 uppercase"
                  >
                    Go to Studio Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setMobileMenuOpen(false);
                    }}
                    className="text-[10px] font-sans text-soft uppercase underline tracking-wider"
                  >
                    Log Out
                  </button>
                </div>
              )}
              <div className="text-[10px] font-sans text-faint tracking-wider">
                SERA — DIGITAL MAGAZINE BY PRIMPLA
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SEARCH DIALOG (DESKTOP) */}
      {searchOpen && (
        <div className="fixed inset-0 bg-ink bg-opacity-20 z-50 flex items-start justify-center pt-24 px-4 transition-all">
          <div className="w-full max-w-xl bg-paper border border-ink p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-sans tracking-[0.12em] text-soft uppercase font-semibold">
                Search Sera Database
              </span>
              <button onClick={() => setSearchOpen(false)} className="text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative border-b border-ink pb-3">
              <input
                type="text"
                autoFocus
                placeholder="TYPE SEARCH KEYWORDS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-2xl font-serif outline-none text-ink placeholder-line"
              />
              <button type="submit" className="absolute right-0 bottom-2 text-ink">
                <Search size={22} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
