"use client";

import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer border-t border-line flex flex-col sm:flex-row justify-between items-center gap-4 px-6 md:px-10 py-[30px] font-sans text-[11px] text-faint tracking-[0.05em] uppercase bg-paper select-none">
      <div>
        <span>SERA — AN EDITORIAL PLATFORM BY </span>
        <a href="https://primpla.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors font-medium">
          PRIMPLA
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/about" className="hover:text-ink transition-colors">About</Link>
        <Link href="/contact" className="hover:text-ink transition-colors">Contact</Link>
        <Link href="/masthead" className="hover:text-ink transition-colors">Masthead</Link>
        <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
      </div>
      <div>
        <span>SERA.PRIMPLA.COM</span>
      </div>
    </footer>
  );
}
