"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteArticleButtonProps {
  articleId: number;
}

export default function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this article?");
    if (!confirmDelete) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete article");
      } else {
        router.refresh();
      }
    } catch (e) {
      alert("An unexpected error occurred while deleting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1 font-semibold uppercase tracking-wider disabled:opacity-50"
      title="Delete Article"
    >
      <Trash2 size={12} />
      <span>{loading ? "Deleting..." : "Delete"}</span>
    </button>
  );
}
