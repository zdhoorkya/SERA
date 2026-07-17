"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface ArticlesFilterHeaderProps {
  categories: Category[];
  authors: User[];
  isAuthor: boolean;
}

export default function ArticlesFilterHeader({ categories, authors, isAuthor }: ArticlesFilterHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [authorId, setAuthorId] = useState(searchParams.get("authorId") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    if (authorId && !isAuthor) params.set("authorId", authorId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    router.push(`/studio/articles?${params.toString()}`);
  };

  const handleReset = () => {
    setQ("");
    setStatus("");
    setCategoryId("");
    setAuthorId("");
    setFrom("");
    setTo("");
    router.push("/studio/articles");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

  return (
    <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm space-y-4">
      {/* ROW 1: SEARCH & BASIC DROPDOWNS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search titles, deck..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 pl-8 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-3.5 text-[#A1A1AA]" />
        </div>

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-semibold tracking-wider"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="PENDING_ADMIN">Pending Admin Verify</option>
          <option value="PUBLISHED">Published</option>
        </select>

        {/* CATEGORY */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-semibold tracking-wider"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* AUTHOR (IF ADMIN/EDITOR) */}
        {!isAuthor ? (
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-semibold tracking-wider"
          >
            <option value="">All Authors</option>
            {authors.map((auth) => (
              <option key={auth.id} value={auth.id}>
                {auth.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 text-[#A1A1AA] flex items-center uppercase font-semibold tracking-wider border-dashed select-none">
            Filtering: Personal Pieces
          </div>
        )}
      </div>

      {/* ROW 2: DATE RANGE & BUTTONS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2 border-t border-[#F4F4F5]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mr-1">
            Created Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
            />
            <span className="text-xs text-[#A1A1AA] uppercase font-bold">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-transparent hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-xs font-semibold tracking-wider uppercase px-4 py-2.5 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleApplyFilters}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-wider uppercase px-5 py-2.5 transition-colors border border-black"
          >
            <Filter size={12} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
