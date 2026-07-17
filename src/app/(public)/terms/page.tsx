import React from "react";
import Masthead from "@/components/layout/Masthead";

export default function TermsPage() {
  return (
    <div className="bg-paper min-h-screen">
      <Masthead />
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16">
        <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2 select-none">
          User Agreement
        </span>
        <h1 className="display-font font-medium text-4xl md:text-6xl text-ink uppercase mb-8 select-none">
          Terms of Service
        </h1>
        <div className="font-serif text-base md:text-lg leading-relaxed text-ink space-y-6">
          <p>
            By accessing SERA (sera.primpla.com), you agree to be bound by the following protocols and terms of the Primpla parent ecosystem.
          </p>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3 select-none">
              1. Intellectual Property
            </h3>
            <p>
              All published editorial contents, layouts, typography systems, and the trademark SERA logo are protected under copyright law. No part of the digital plates may be reproduced, redistributed, or commercialized without explicit written permission from the editorial board.
            </p>
          </div>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3 select-none">
              2. Permitted Use
            </h3>
            <p>
              Readers are granted a non-exclusive license to view the editorial platform for personal, non-commercial reading. Crawler indexing is permitted exclusively under the directives outlined in our public <code>robots.txt</code> and <code>llms.txt</code> registries.
            </p>
          </div>
          <div className="border-t border-line pt-6 select-none">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3">
              3. System Access & Integrity
            </h3>
            <p>
              Unauthorized access to our editorial dashboard (<code>/studio</code>), database endpoints, or server instances constitutes a breach of this agreement and is subject to immediate service revocation and legal referral.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
