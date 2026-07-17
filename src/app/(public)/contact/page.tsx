import React from "react";
import Masthead from "@/components/layout/Masthead";

export default function ContactPage() {
  return (
    <div className="bg-paper min-h-screen">
      <Masthead />
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16">
        <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2 select-none">
          Registry Channels
        </span>
        <h1 className="display-font font-medium text-4xl md:text-6xl text-ink uppercase mb-8 select-none">
          Contact Bureau
        </h1>
        <div className="font-serif text-base md:text-lg leading-relaxed text-ink space-y-6">
          <p>
            For editorial inquiries, story tips, or press releases, please contact the appropriate bureau. All correspondences are archived in accordance with our retention policy.
          </p>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-2 select-none">
              General Inquiries
            </h3>
            <p className="font-mono text-sm">desk@primpla.com</p>
          </div>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-2 select-none">
              Editorial Studio & Submissions
            </h3>
            <p className="font-mono text-sm">editor.sera@primpla.com</p>
          </div>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-2 select-none">
              Technical Infrastructure
            </h3>
            <p className="font-mono text-sm">tech.sera@primpla.com</p>
          </div>
          <div className="border-t border-line pt-6 select-none">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-2">
              Mailing Address
            </h3>
            <p className="text-soft text-sm not-italic font-serif leading-relaxed">
              Primpla Parent Ecosystem<br />
              Attn: SERA Editorial Board<br />
              Central Operations Plaza, Floor 14<br />
              Mumbai, MH 400001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
