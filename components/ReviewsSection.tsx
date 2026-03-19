"use client";

import React from "react";
import Image from "next/image";

const reviewData1 = [
  {
    name: "Syskey DMG",
    handle: "@syskey_dmg",
    text: "Just discovered Codophile — a sleek, minimal, and super dev-friendly component library. Clean UI, easy to use, and perfect for modern projects.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Syskey",
  },
  {
    name: "Shad CN",
    handle: "@shadcn",
    text: "Everything about this is next level: the components, the registry, dynamic items. Absolutely amazing work.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shad",
  },
  {
    name: "Roshni",
    handle: "@roshni_codes",
    text: "Codophile has completely streamlined our development workflow. The components are accessible, customizable, and built with best practices in mind.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roshni",
  },
  {
    name: "David Haz",
    handle: "@DIYDevs",
    text: "Have you heard of Codophile? Lovingly put together a collection of animated and fully customizable React components.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    name: "Amira Hassan",
    handle: "@amira_dev",
    text: "The attention to detail in Codophile is outstanding. It is transforming the way we prototype applications.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amira",
  },
];

const reviewData2 = [
  {
    name: "Logreg",
    handle: "@logreg_n_coffee",
    text: "Literally the coolest component library in React. Building dashboards and websites has never been this smooth.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Logreg",
  },
  {
    name: "Makwana Deepam",
    handle: "@makwanadeepam",
    text: "Obsessed with the animations on Codophile. Check them out, seriously impressive work.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Makwana",
  },
  {
    name: "Chen Wei",
    handle: "@chenwei_builds",
    text: "The interface is so intuitive. Designers and developers collaborate effortlessly, and the UI feels consistent across every project we build.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen",
  },
  {
    name: "Liam Anderson",
    handle: "@liam_codes",
    text: "With Codophile, our team ships projects in record time. The design is sleek, the code is clean, and there are no hidden complexities.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
  },
  {
    name: "Sophia Martinez",
    handle: "@sophia_ui",
    text: "Codophile helps us deliver modern, responsive, and production-ready components right out of the box. Highly recommended.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
  },
];

export default function ReviewsSection() {
  return (
    <section className="relative w-full py-24 overflow-hidden bg-transparent">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-400 text-sm font-medium mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          OUR REVIEWS
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
          Loved by devs worldwide
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Codophile has transformed the way we build applications. The components are clean, customizable, and production-ready, saving us hours of repetitive coding.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative flex flex-col gap-6 w-full max-w-[100vw] overflow-hidden">
        {/* Left Fading Edge */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-[rgba(3,0,20,0.8)] to-transparent z-20 pointer-events-none" />
        
        {/* Row 1 - Left to Right */}
        <div className="flex w-max gap-6 hover:[animation-play-state:paused] animate-scroll-left">
          {/* We duplicate the items to create a seamless infinite loop */}
          {[...reviewData1, ...reviewData1].map((review, idx) => (
            <div
              key={`row1-${idx}`}
              className="w-[350px] md:w-[400px] shrink-0 p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-colors"
            >
              <p className="text-gray-300 text-[15px] leading-relaxed mb-6 h-24">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 p-1"
                />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{review.name}</span>
                  <span className="text-gray-500 text-xs">{review.handle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-max gap-6 hover:[animation-play-state:paused] animate-scroll-right">
          {[...reviewData2, ...reviewData2].map((review, idx) => (
            <div
              key={`row2-${idx}`}
              className="w-[350px] md:w-[400px] shrink-0 p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-colors"
            >
              <p className="text-gray-300 text-[15px] leading-relaxed mb-6 h-24">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 p-1"
                />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{review.name}</span>
                  <span className="text-gray-500 text-xs">{review.handle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Fading Edge */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[rgba(3,0,20,0.8)] to-transparent z-20 pointer-events-none" />
      </div>
    </section>
  );
}
