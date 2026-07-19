"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bold, 
  Italic, 
  Heading, 
  Link as LinkIcon, 
  Quote, 
  Image as ImageIcon, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit2
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface ArticleFormProps {
  categories: Category[];
  authors: User[];
  currentUser: any;
  initialArticle?: any; // If editing, pass current article data
}

export default function ArticleForm({ categories, authors, currentUser, initialArticle }: ArticleFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!initialArticle;
  const isAuthor = currentUser.role === "AUTHOR";
  const isEditor = currentUser.role === "EDITOR";
  const isAdmin = currentUser.role === "ADMIN";

  // Form states
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [deck, setDeck] = useState(initialArticle?.deck || "");
  const [body, setBody] = useState(initialArticle?.body || "");
  const [categoryId, setCategoryId] = useState(initialArticle?.categoryId?.toString() || categories[0]?.id?.toString() || "");
  const [heroImage, setHeroImage] = useState(initialArticle?.heroImage || "");
  const [caption, setCaption] = useState(initialArticle?.caption || "");
  const [isOpinion, setIsOpinion] = useState(initialArticle?.isOpinion || false);
  const [isPinnedToHeadlines, setIsPinnedToHeadlines] = useState(initialArticle?.isPinnedToHeadlines || false);
  const [headlineOrder, setHeadlineOrder] = useState(initialArticle?.headlineOrder || 0);
  const [publishDate, setPublishDate] = useState(
    initialArticle?.publishDate 
      ? new Date(initialArticle.publishDate).toISOString().substring(0, 16) 
      : ""
  );
  
  // SEO fields
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle || "");
  const [seoDesc, setSeoDesc] = useState(initialArticle?.seoDesc || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialArticle?.canonicalUrl || "");
  const [seoPanelOpen, setSeoPanelOpen] = useState(false);

  // Author selection
  const initialAuthorIds = initialArticle?.authors?.map((a: any) => a.id) || [parseInt(currentUser.id, 10)];
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>(initialAuthorIds);

  // Tags
  const initialTagsString = initialArticle?.tags?.map((t: any) => t.name).join(", ") || "";
  const [tagsString, setTagsString] = useState(initialTagsString);

  // Editor states
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focalPoint, setFocalPoint] = useState("top"); // focal point alignment class

  // Form submission handler
  const handleSubmit = async (statusOverride?: string) => {
    if (!title.trim() || !body.trim() || !categoryId) {
      alert("Please fill in Title, Body, and Category.");
      return;
    }

    setSaving(true);

    // Determine status
    let finalStatus = "DRAFT";
    if (statusOverride) {
      finalStatus = statusOverride;
    } else {
      // Default publishing triggers
      if (isAuthor) {
        finalStatus = "IN_REVIEW"; // Authors submit for review
      } else if (isEditor) {
        finalStatus = "PENDING_ADMIN"; // Editors submit for admin verification
      } else if (isAdmin) {
        finalStatus = "PUBLISHED"; // Admins can publish directly
      }
    }

    // Split tags
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      slug,
      deck,
      body,
      categoryId,
      heroImage,
      caption,
      isOpinion,
      isPinnedToHeadlines,
      headlineOrder,
      status: finalStatus,
      publishDate: publishDate || null,
      authorIds: selectedAuthorIds,
      tags,
      seoTitle,
      seoDesc,
      canonicalUrl,
      ogImage: heroImage, // Fallback OG image
    };

    try {
      const url = isEditing ? `/api/articles/${initialArticle.id}` : "/api/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Failed to save article");
      } else {
        router.push("/studio/articles");
        router.refresh();
      }
    } catch (e) {
      alert("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // HTML Toolbar actions
  const insertTag = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    setBody(text.substring(0, start) + replacement + text.substring(end));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Image upload failed.");
      } else {
        const data = await res.json();
        setHeroImage(data.url);
      }
    } catch (err) {
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleAuthorCheckboxChange = (id: number) => {
    if (selectedAuthorIds.includes(id)) {
      if (selectedAuthorIds.length > 1) {
        setSelectedAuthorIds(selectedAuthorIds.filter((aid) => aid !== id));
      }
    } else {
      setSelectedAuthorIds([...selectedAuthorIds, id]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      {/* LEFT SIDE: MAIN EDITOR FORM (8 cols) */}
      <div className="lg:col-span-8 bg-white border border-[#E4E4E7] p-6 shadow-sm space-y-6">
        
        {/* TABS (EDIT VS PREVIEW) */}
        <div className="flex border-b border-[#E4E4E7] pb-3 mb-6 select-none">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 border-b-2 transition-all ${
              activeTab === "edit" ? "border-[#09090B] text-[#09090B]" : "border-transparent text-[#71717A] hover:text-[#09090B]"
            }`}
          >
            <Edit2 size={12} />
            <span>Edit Article</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 border-b-2 transition-all ${
              activeTab === "preview" ? "border-[#09090B] text-[#09090B]" : "border-transparent text-[#71717A] hover:text-[#09090B]"
            }`}
          >
            <Eye size={12} />
            <span>Digital Plate Preview</span>
          </button>
        </div>

        {activeTab === "edit" ? (
          <div className="space-y-6">
            {/* TITLE */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase mb-1.5">
                Article Title (Headline)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }
                }}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-lg font-bold p-3 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
                placeholder="The chips are fine. It's the cooling..."
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase mb-1.5">
                URL Identifier (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors font-mono"
                placeholder="chips-fine-cooling-breaks-first"
              />
            </div>

            {/* DECK (SUBHEADING) */}
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase mb-1.5">
                Subheading / Deck
              </label>
              <textarea
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                rows={2}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-sm p-3 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors font-serif italic"
                placeholder="Every conversation about the limits of computing eventually turns to power..."
              />
            </div>

            {/* RICH TEXT BODY WITH EDITOR TOOLBAR */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase">
                  Article Body (HTML Rich Text)
                </label>
                <span className="text-[10px] text-[#A1A1AA] uppercase">HTML Tags Supported</span>
              </div>

              {/* EDITOR TOOLBAR */}
              <div className="flex flex-wrap gap-1 bg-[#FAFAFA] border border-b-0 border-[#E4E4E7] p-2">
                <button
                  type="button"
                  onClick={() => insertTag("<strong>", "</strong>")}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B]"
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<em>", "</em>")}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B]"
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag("<h2>", "</h2>")}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B]"
                  title="Section Header"
                >
                  <Heading size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter URL:", "https://");
                    if (url) insertTag(`<a href="${url}" target="_blank" class="underline">`, "</a>");
                  }}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B]"
                  title="Insert Link"
                >
                  <LinkIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<div class="pull">"', '"</div>')}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B] font-bold"
                  title="Pull Quote Block"
                >
                  <Quote size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<blockquote>', '</blockquote>')}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B] font-mono"
                  title="Blockquote"
                >
                  Block
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    const cap = prompt("Enter figure caption:");
                    if (url) {
                      insertTag(`<figure class="my-6"><img src="${url}" alt="" class="grayscale-img" /><figcaption class="font-sans text-[11px] text-faint mt-2 uppercase">${cap || ""}</figcaption></figure>`, "");
                    }
                  }}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B]"
                  title="Insert Embedded Figure"
                >
                  <ImageIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<p class="first">', '</p>')}
                  className="p-1.5 hover:bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] text-[#52525B] flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                  title="Drop-Cap First Paragraph"
                >
                  <Sparkles size={11} />
                  <span>Drop Cap</span>
                </button>
              </div>

              <textarea
                id="article-body-textarea"
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-sm p-4 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors font-mono leading-relaxed"
                placeholder='<p class="first">Every conversation about...</p>'
              />
            </div>
          </div>
        ) : (
          /* DIGITAL PLATE LIVE PREVIEW */
          <div className="bg-[#F7F6F2] p-8 border border-line text-[#15130F] font-serif min-h-[500px]">
            <div className="max-w-[680px] mx-auto space-y-6">
              <span className="font-sans text-[11px] tracking-[0.14em] uppercase text-soft block">
                Preview Mode — {categories.find((c) => c.id.toString() === categoryId)?.name || "Unfiled"}
              </span>
              <h1 className="display-font font-medium text-3xl md:text-4xl leading-[1.05] text-ink mb-2">
                {title || "[Headline Placeholder]"}
              </h1>
              <div className="flex gap-4 font-sans text-[10px] tracking-[0.06em] uppercase text-faint border-b border-ink pb-4 mb-4 select-none">
                <span>By {selectedAuthorIds.map((id) => authors.find((a) => a.id === id)?.name).join(" & ")}</span>
                <span>·</span>
                <span>Live Previewing Plate</span>
              </div>
              
              {heroImage && (
                <figure className="my-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="" className={`grayscale-img w-full max-h-[360px] object-cover object-${focalPoint}`} />
                  {caption && <figcaption className="font-sans text-[11px] text-faint mt-2 uppercase">{caption}</figcaption>}
                </figure>
              )}

              {deck && <p className="text-lg italic text-[#57544B] leading-relaxed border-l-2 border-line pl-4">{deck}</p>}

              <div 
                className="preview-body leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ 
                  __html: body || "<p className='italic text-faint'>Type body content to see preview...</p>" 
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: METADATA & SIDEBAR CONTROLS (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* PUBLISHING PANEL */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-2">
            Publish Actions
          </h3>

          {/* DRAFT / WORKFLOW STATUS DISPLAY */}
          <div className="flex justify-between items-center bg-[#FAFAFA] p-3 border border-[#E4E4E7] select-none">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Current Status</span>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#E4E4E7] text-[#18181B] border border-[#D4D4D8] rounded">
              {initialArticle?.status || "Drafting"}
            </span>
          </div>

          <div className="space-y-3">
            {/* Save Draft is always available */}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit("DRAFT")}
              className="w-full bg-white hover:bg-[#FAFAFA] border border-[#E4E4E7] text-[#18181B] text-xs font-semibold tracking-widest uppercase p-3 transition-colors disabled:opacity-50"
            >
              Save Local Draft
            </button>

            {/* Custom submit based on role */}
            {isAuthor && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit("IN_REVIEW")}
                className="w-full bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50"
              >
                Submit for Editorial Review
              </button>
            )}

            {isEditor && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit("PENDING_ADMIN")}
                className="w-full bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50"
              >
                Approve & Request Admin Verify
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmit("PUBLISHED")}
                  className="w-full bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50"
                >
                  Verify & Publish Now
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSubmit("PENDING_ADMIN")}
                  className="w-full bg-transparent hover:bg-[#FAFAFA] border border-dashed border-[#A1A1AA] text-[#52525B] text-xs font-semibold tracking-widest uppercase p-3 transition-colors disabled:opacity-50"
                >
                  Place in Verify Queue
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-[#F4F4F5] flex justify-between select-none">
            <button
              type="button"
              onClick={() => router.push("/studio/articles")}
              className="text-xs text-[#71717A] hover:text-[#18181B] uppercase tracking-wider hover:underline"
            >
              Cancel Edit
            </button>
          </div>
        </div>

        {/* METADATA MODULE */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-2 select-none">
            Document Settings
          </h3>

          {/* CATEGORY */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5">
              Category Column
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-semibold tracking-wider"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {categories.find((c) => c.id.toString() === categoryId)?.slug === "celebrity" && (
              <div className="mt-3 bg-[#FFFBEB] border border-[#FCD34D] p-3 text-[10px] text-[#92400E] space-y-1.5 uppercase tracking-wide font-semibold">
                <span className="font-bold block border-b border-[#FCD34D] pb-1 select-none text-[11px]">
                  ⚠️ Celebrity Checklist
                </span>
                <ul className="list-disc list-inside space-y-1 select-none">
                  <li>Image is licensed for editorial use.</li>
                  <li>Quotes verified; none invented or unverified.</li>
                </ul>
              </div>
            )}
          </div>

          {/* AUTHORS (ONLY EDITABLE BY ADMIN/EDITOR) */}
          <div className="select-none">
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5">
              Authors (Collaborators)
            </label>
            {!isAuthor ? (
              <div className="max-h-36 overflow-y-auto border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-2">
                {authors.map((auth) => (
                  <label key={auth.id} className="flex items-center gap-2.5 text-xs text-[#18181B] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAuthorIds.includes(auth.id)}
                      onChange={() => handleAuthorCheckboxChange(auth.id)}
                      className="border-[#E4E4E7] rounded text-black focus:ring-black cursor-pointer"
                    />
                    <span className="uppercase tracking-wider text-[11px]">{auth.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 text-[#52525B] font-semibold tracking-wider uppercase">
                {currentUser.name} (Assigned Owner)
              </div>
            )}
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
              placeholder="Infrastructure, Computing, Slow Living"
            />
          </div>

          {/* IS OPINION CHECKBOX */}
          <div className="select-none">
            <label className="flex items-center gap-2.5 text-xs text-[#18181B] font-bold cursor-pointer uppercase tracking-wider">
              <input
                type="checkbox"
                checked={isOpinion}
                onChange={(e) => setIsOpinion(e.target.checked)}
                className="border-[#E4E4E7] rounded text-black focus:ring-black cursor-pointer"
              />
              <span>Is Opinion Piece</span>
            </label>
          </div>

          {/* HEADLINES PINNING (EDITORS & ADMINS ONLY) */}
          {!isAuthor && (
            <div className="border-t border-[#E4E4E7] pt-4 space-y-4 select-none">
              <div>
                <label className="flex items-center gap-2.5 text-xs text-[#18181B] font-bold cursor-pointer uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isPinnedToHeadlines}
                    onChange={(e) => setIsPinnedToHeadlines(e.target.checked)}
                    className="border-[#E4E4E7] rounded text-black focus:ring-black cursor-pointer"
                  />
                  <span>Pin to Headlines Strip</span>
                </label>
              </div>

              {isPinnedToHeadlines && (
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5">
                    Headline Order Weight
                  </label>
                  <input
                    type="number"
                    value={headlineOrder}
                    onChange={(e) => setHeadlineOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
                    placeholder="0"
                    min={0}
                  />
                  <p className="text-[9px] text-[#A1A1AA] uppercase tracking-wide mt-1">
                    Lower numbers appear first in the scroller.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SCHEDULE PUBLISH DATE */}
          <div className="select-none">
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5">
              Schedule Publish Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* HERO IMAGE SETTINGS PANEL */}
        <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-2 select-none">
            Hero Image Settings
          </h3>

          {/* IMAGE PREVIEW */}
          {heroImage ? (
            <div className="border border-[#E4E4E7] bg-[#FAFAFA] p-2 relative group select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt="Preview"
                className={`w-full h-36 object-cover grayscale object-${focalPoint}`}
              />
              <button
                type="button"
                onClick={() => setHeroImage("")}
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white text-[10px] px-2 py-1 uppercase tracking-wider font-semibold border border-zinc-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[#A1A1AA] bg-[#FAFAFA] h-28 flex flex-col items-center justify-center text-center p-4 select-none">
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">No Hero Image Selected</span>
            </div>
          )}

          {/* IMAGE FILE INPUT */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5 select-none">
              Upload New Hero (Processed Server-side)
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
              className="text-xs w-full cursor-pointer file:cursor-pointer file:border file:border-[#E4E4E7] file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:text-[#52525B] hover:file:bg-[#FAFAFA]"
            />
            {uploading && <p className="text-[9px] text-faint uppercase mt-1 select-none">Converting to grayscale...</p>}
          </div>

          {/* FOCAL POINT SELECTOR */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5 select-none">
              Focal-Point Alignment (Crop Focus)
            </label>
            <select
              value={focalPoint}
              onChange={(e) => setFocalPoint(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors uppercase font-semibold tracking-wider"
            >
              <option value="center">Center Focus</option>
              <option value="top">Top Crop Focus</option>
              <option value="bottom">Bottom Crop Focus</option>
            </select>
          </div>

          {/* CAPTION */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1.5 select-none">
              Figure Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
              placeholder="e.g. A liquid-cooling facility outside Pune..."
            />
          </div>
        </div>

        {/* SEO PARAMETERS COLLAPSIBLE */}
        <div className="bg-white border border-[#E4E4E7] shadow-sm">
          <button
            type="button"
            onClick={() => setSeoPanelOpen(!seoPanelOpen)}
            className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-[#18181B]"
          >
            <span>Search Engines (SEO Defaults)</span>
            {seoPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {seoPanelOpen && (
            <div className="p-4 border-t border-[#F4F4F5] space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                  Meta Title (SEO Override)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B]"
                  placeholder="Keep under 60 characters"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                  Meta Description
                </label>
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B]"
                  placeholder="Keep under 160 characters"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-wider text-[#52525B] uppercase mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2 outline-none text-[#18181B] focus:border-[#09090B] font-mono"
                  placeholder="https://sera.primpla.com/..."
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
