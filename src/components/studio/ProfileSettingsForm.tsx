"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Check, AlertCircle } from "lucide-react";

interface ProfileSettingsFormProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function ProfileSettingsForm({ currentUser }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentUser.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile name");
      }

      setMessage("Account name updated successfully!");
      
      // Refresh Next.js page state and force session cookie updates
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E4E4E7] p-6 shadow-sm">
      <h2 className="text-xs font-semibold tracking-wider uppercase text-[#18181B] border-b border-[#E4E4E7] pb-3.5 mb-5 flex items-center gap-1.5">
        <User size={14} className="text-[#71717A]" />
        <span>Profile Settings</span>
      </h2>

      {message && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] p-3 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Check size={14} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#991B1B] p-3 mb-4 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-semibold tracking-wider text-[#71717A] uppercase mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={currentUser.email}
            disabled
            className="w-full bg-[#F4F4F5] border border-[#E4E4E7] px-3 py-2 text-xs text-[#71717A] cursor-not-allowed select-text font-medium"
          />
          <p className="text-[9px] text-[#A1A1AA] uppercase tracking-wide mt-1">
            Email address is locked and managed by administrators.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-semibold tracking-wider text-[#18181B] uppercase mb-1.5">
            Account Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Ananya Reddy"
            className="w-full bg-white border border-[#D1D1D6] focus:border-[#18181B] px-3 py-2 text-xs text-[#18181B] outline-none font-medium select-text"
            required
            maxLength={100}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#18181B] hover:bg-black disabled:bg-[#71717A] text-white text-[10px] font-bold uppercase tracking-wider py-2.5 transition-colors border border-black"
        >
          {loading ? "Saving changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
