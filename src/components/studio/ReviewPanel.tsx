"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Check, X, Send, RefreshCw } from "lucide-react";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
}

interface ReviewPanelProps {
  articleId: number;
  initialStatus: string;
  comments: Comment[];
  currentUser: any;
  categorySlug: string;
}

export default function ReviewPanel({ articleId, initialStatus, comments, currentUser, categorySlug }: ReviewPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const isAuthor = currentUser.role === "AUTHOR";
  const isEditor = currentUser.role === "EDITOR";
  const isAdmin = currentUser.role === "ADMIN";

  // Post comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);

    try {
      const res = await fetch("/api/review-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, text: commentText }),
      });

      if (!res.ok) {
        alert("Failed to add comment.");
      } else {
        setCommentText("");
        router.refresh();
      }
    } catch (err) {
      alert("Error adding comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Change article status
  const handleStatusChange = async (newStatus: string) => {
    const confirmationMsg = 
      newStatus === "PUBLISHED" 
        ? "Verify and publish this article live to the site?" 
        : newStatus === "PENDING_ADMIN" 
        ? "Approve this article and send it to administrators for final verification?" 
        : newStatus === "CHANGES_REQUESTED"
        ? "Reject this submission and request changes from the author?"
        : "Resubmit this article for editor review?";

    const proceed = window.confirm(confirmationMsg);
    if (!proceed) return;

    setUpdatingStatus(true);

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          // If publishing, set publishDate
          publishDate: newStatus === "PUBLISHED" ? new Date().toISOString() : undefined
        }),
      });

      if (!res.ok) {
        alert("Failed to update article status.");
      } else {
        setStatus(newStatus);
        router.push("/studio/review-queue");
        router.refresh();
      }
    } catch (err) {
      alert("Error updating status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* 1. DECISION ACTIONS CARD */}
      <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-2">
          Moderation Panel
        </h3>

        {/* CURRENT STATUS */}
        <div className="flex justify-between items-center bg-[#FAFAFA] p-3 border border-[#E4E4E7]">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">State</span>
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded ${
            status === "PENDING_ADMIN"
              ? "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]"
              : status === "IN_REVIEW"
              ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
              : "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
          }`}>
            {status.replace("_", " ")}
          </span>
        </div>

        {/* CELEBRITY REMINDER CARD */}
        {categorySlug === "celebrity" && (
          <div className="bg-[#FFFBEB] border border-[#FCD34D] p-3 text-[10px] text-[#92400E] space-y-1.5 uppercase tracking-wide font-semibold">
            <span className="font-bold block border-b border-[#FCD34D] pb-1 text-[11px]">
              ⚠️ Celebrity Policy Reminder
            </span>
            <p className="normal-case text-[10px] font-medium leading-relaxed select-none">
              Before approving or verifying this article, confirm:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[9px] select-none">
              <li>The hero image is fully licensed for editorial use.</li>
              <li>No quotes are invented, speculative, or unverified.</li>
            </ul>
          </div>
        )}

        {/* ACTIONS BUTTONS */}
        <div className="space-y-3 pt-1">
          {/* EDITOR / ADMIN ACTIONS */}
          {(isEditor || isAdmin) && (
            <>
              {/* Request changes */}
              {status !== "CHANGES_REQUESTED" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange("CHANGES_REQUESTED")}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-xs font-semibold tracking-widest uppercase p-3 transition-colors disabled:opacity-50"
                >
                  <X size={12} />
                  <span>Request Changes</span>
                </button>
              )}

              {/* Editor Approve (sends to pending admin verify) */}
              {isEditor && status === "IN_REVIEW" && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange("PENDING_ADMIN")}
                  className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50"
                >
                  <Check size={12} />
                  <span>Approve & Send to Admin</span>
                </button>
              )}

              {/* Admin verify & publish (available to admin at any step in queue) */}
              {isAdmin && (status === "IN_REVIEW" || status === "PENDING_ADMIN") && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange("PUBLISHED")}
                  className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-[#16A34A] disabled:opacity-50"
                >
                  <Check size={12} />
                  <span>Verify & Publish Live</span>
                </button>
              )}
            </>
          )}

          {/* AUTHOR ACTIONS */}
          {isAuthor && status === "CHANGES_REQUESTED" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange("IN_REVIEW")}
              className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors border border-black disabled:opacity-50"
            >
              <RefreshCw size={12} />
              <span>Resubmit for Review</span>
            </button>
          )}

          {isAuthor && status !== "CHANGES_REQUESTED" && (
            <p className="text-[10px] text-faint uppercase text-center italic mt-2">
              Submission locked. Awaiting editor review.
            </p>
          )}
        </div>
      </div>

      {/* 2. COMMENT LOG / FEEDBACK THREAD */}
      <div className="bg-white border border-[#E4E4E7] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3 mb-2 flex items-center gap-2">
          <MessageSquare size={14} className="text-[#71717A]" />
          <span>Peer Feedback Loop</span>
        </h3>

        {/* FEEDBACK LOG */}
        <div className="max-h-[300px] overflow-y-auto space-y-3.5 pr-1.5 scrollbar-thin">
          {comments.map((comm) => {
            const date = new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(comm.createdAt));

            return (
              <div key={comm.id} className="bg-[#FAFAFA] border border-[#E4E4E7] p-3 text-xs space-y-2">
                <div className="flex justify-between items-start gap-2 select-none">
                  <div>
                    <span className="font-bold text-[#18181B] uppercase tracking-wide block">{comm.user.name}</span>
                    <span className="text-[9px] text-[#A1A1AA] uppercase">{date}</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#E4E4E7] text-[8px] font-bold uppercase tracking-widest text-[#52525B] rounded border border-[#D4D4D8]">
                    {comm.user.role}
                  </span>
                </div>
                <p className="text-[#3F3F46] font-serif leading-relaxed select-text">{comm.text}</p>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="py-6 text-center text-xs text-[#A1A1AA] uppercase tracking-wider italic select-none">
              No review comments logged yet.
            </div>
          )}
        </div>

        {/* ADD COMMENT FORM */}
        <form onSubmit={handleAddComment} className="pt-3 border-t border-[#F4F4F5] space-y-2 select-none">
          <textarea
            required
            rows={3}
            placeholder="Type inline review comments, change requests, or notes..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-xs p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={submittingComment}
            className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-black text-white text-[10px] font-semibold tracking-wider uppercase p-2 border border-black disabled:opacity-50"
          >
            <Send size={10} />
            <span>{submittingComment ? "LOGGING..." : "ADD COMMENT"}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
