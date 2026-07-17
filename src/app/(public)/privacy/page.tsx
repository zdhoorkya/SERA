import React from "react";
import Masthead from "@/components/layout/Masthead";

export default function PrivacyPage() {
  return (
    <div className="bg-paper min-h-screen">
      <Masthead />
      <div className="max-w-[700px] mx-auto px-6 md:px-10 py-16">
        <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-soft font-semibold block mb-2 select-none">
          Legal Framework
        </span>
        <h1 className="display-font font-medium text-4xl md:text-6xl text-ink uppercase mb-8 select-none">
          Privacy Protocol
        </h1>
        <div className="font-serif text-base md:text-lg leading-relaxed text-ink space-y-6">
          <p>
            SERA, under the Primpla parent ecosystem, operates with strict privacy-by-design standards. We believe in minimal data footprinting and complete transparency.
          </p>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3 select-none">
              1. Reader Analytics & Tracking
            </h3>
            <p>
              We do not deploy third-party trackers, retargeting pixels, or programmatic advertising frames. Our analytical system tracks only aggregate views per page to measure general column interest, operating entirely server-side without recording user-specific identities.
            </p>
          </div>
          <div className="border-t border-line pt-6">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3 select-none">
              2. User Account Data
            </h3>
            <p>
              For registered employees and writers, we store credentials necessary for authentication and editorial workflow coordination (email, hashed credentials, titles, and public bios). This data is kept in an isolated database environment and is never shared or commercialized.
            </p>
          </div>
          <div className="border-t border-line pt-6 select-none">
            <h3 className="font-sans text-xs tracking-wider uppercase text-soft font-semibold mb-3">
              3. Data Retention
            </h3>
            <p>
              Static content, public articles, and byline metadata are maintained permanently for public archival access. Deactivated accounts will have personal credential keys purged while keeping public authorship attributions intact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
