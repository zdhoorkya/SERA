import React from "react";
import Masthead from "@/components/layout/Masthead";

export default function AboutPage() {
  return (
    <div className="bg-paper min-h-screen">
      <Masthead />
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16">
        <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2 select-none">
          Ecosystem Profile
        </span>
        <h1 className="display-font font-medium text-4xl md:text-6xl text-ink uppercase mb-8 select-none">
          About Sera
        </h1>
        <div className="font-serif text-base md:text-lg leading-relaxed text-ink divide-y divide-line">
          <div className="py-6">
            <p className="mb-4">
              SERA is an independent digital news and magazine platform hosted under the parent ecosystem{" "}
              <strong>Primpla</strong>. We dedicate ourselves to critical coverage, editorial permanence, and clean, physical-grade typography.
            </p>
            <p>
              In a digital environment saturated with flashing color, tracking scripts, and algorithmic recommendations, SERA provides a quiet alternative: a strict grayscale canvas where ideas, reportage, and arguments stand on their own merit.
            </p>
          </div>
          <div className="py-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3 select-none">
              Our Editorial Philosophy
            </h3>
            <p className="mb-4">
              We believe speed is often mistaken for progress. By extending our review cycles and keeping editorial standards high, we aim to produce articles with structural longevity.
            </p>
            <p>
              Every image uploaded to SERA is processed server-side to match high-contrast, black-and-white print plates, echoing the rich visual histories of legacy paper journalism.
            </p>
          </div>
          <div className="py-6 select-none">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3">
              Distribution & Technology
            </h3>
            <p>
              Sera is built using modern server-side rendering protocols, ensuring complete indexability and accessibility. Our pages are rendered statically at the edge, offering fast load times and permanent archival security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
