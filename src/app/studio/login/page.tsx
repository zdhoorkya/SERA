"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StudioLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/studio");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center font-sans px-4 select-none">
      <div className="w-full max-w-[400px] bg-white border border-[#E4E4E7] p-8 shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="text-[9px] font-semibold tracking-[0.16em] text-[#71717A] uppercase block mb-3">
            Primpla Ecosystem
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SERA" className="h-9 w-auto grayscale-img mb-1" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#A1A1AA] uppercase">
            Studio
          </span>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#991B1B] p-3 mb-6 uppercase tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-sm p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
              placeholder="e.g. editor@sera.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-[#52525B] uppercase mb-1.5">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E4E4E7] text-sm p-2.5 outline-none text-[#18181B] focus:border-[#09090B] focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#18181B] hover:bg-[#09090B] text-white text-xs font-semibold tracking-widest uppercase p-3 transition-colors disabled:bg-[#A1A1AA]"
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN TO STUDIO"}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
            Admin: admin@sera.com / password123 <br />
            Editor: editor@sera.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
