"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HomeAnimations() {
  useEffect(() => {
    // Check if we are running in browser context
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // 1. Subtle Hero Entrance
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );

      gsap.fromTo(
        ".hero-img-container",
        { opacity: 0, scale: 1.02 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );

      // 2. Section Rule Drawing-In Animation (Draw lines as they scroll into view)
      const rules = document.querySelectorAll(".section-rule");
      rules.forEach((rule) => {
        gsap.fromTo(
          rule,
          { width: "0%" },
          {
            width: "100%",
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rule,
              start: "top 90%", // Trigger when the top of the line hits 90% viewport height
              toggleActions: "play none none none",
            },
          }
        );
      });

      // 3. Subtle Image Reveals for Lead Main and cards
      const images = document.querySelectorAll(".image-reveal");
      images.forEach((img) => {
        gsap.fromTo(
          img,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power1.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }
  }, []);

  return null; // This component is purely behavior-driven
}
