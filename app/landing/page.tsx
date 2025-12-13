"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type WorkflowStep = {
  title: string;
  caption: string;
  visual: string;
  screenshot?: string;
};

type Screenshot = {
  title: string;
  src: string;
  alt: string;
  hint: string;
  href?: string;
};

const workflow: WorkflowStep[] = [
  {
    title: "Understand",
    caption: "Reframe understands objects, lighting, and mood.",
    visual: "Scene canvas with highlights",
    screenshot: "/screenshots/scene-editor.png",
  },
  {
    title: "Reframe",
    caption: "Edit intent, not pixels. Adjust attributes with precision.",
    visual: "Inspector edits in place",
    screenshot: "/screenshots/scene-inspector.png",
  },
  {
    title: "Apply",
    caption: "One image. Many outcomes — prompts, variants, accessibility.",
    visual: "Variants and exports",
    screenshot: "/screenshots/products.png",
  },
];

const capabilities = [
  {
    title: "Scene Editor",
    description: "Visual reasoning and prompt generation from any image.",
  },
  {
    title: "Accessibility",
    description: "Alt-text and audio descriptions, built-in and fast.",
  },
  {
    title: "Product Variants",
    description: "Colors, backgrounds, consistency at scale for commerce.",
  },
  {
    title: "Catalog Intelligence",
    description: "Auto-tagging and structured metadata for every image.",
  },
];

const personas = ["Creators and designers", "E-commerce teams", "Visual content leads"];

const liveScreenshots: Screenshot[] = [
  {
    title: "Scene Editor",
    src: "/screenshots/scene-editor.png",
    alt: "Scene Editor live UI",
    hint: "Image → JSON blueprint → prompts",
    href: "/",
  },
  {
    title: "Accessibility",
    src: "/screenshots/accessibility.png",
    alt: "Accessibility live UI",
    hint: "Alt text and audio in one pass",
    href: "/accessibility",
  },
  {
    title: "Product Variants",
    src: "/screenshots/products.png",
    alt: "Products live UI",
    hint: "Color + material + background variations",
    href: "/products",
  },
  {
    title: "Catalog",
    src: "/screenshots/catalog.png",
    alt: "Catalog live UI",
    hint: "Visual spreadsheet of tagged images",
    href: "/catalog",
  },
];

function ScreenshotCard({ shot }: { shot: Screenshot }) {
  const [errored, setErrored] = useState(false);
  return (
    <Link
      href={shot.href || "#"}
      className="group block rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden hover:border-indigo-500/40 transition"
    >
      <div className="relative aspect-[16/10] bg-zinc-900">
        {!errored ? (
          <Image
            src={shot.src}
            alt={shot.alt}
            fill
            className="object-cover"
            priority={shot.title === "Scene Editor"}
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
            Add {shot.src} to /public to show live UI
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{shot.title}</p>
          <p className="text-xs text-zinc-500">{shot.hint}</p>
        </div>
        <span className="text-xs text-indigo-300 group-hover:text-indigo-200">View</span>
      </div>
    </Link>
  );
}

function WorkflowCard({ step }: { step: WorkflowStep }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-200 flex items-center justify-center">
          •
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-zinc-500">{step.title}</p>
          <p className="text-sm text-zinc-300">{step.caption}</p>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-500 relative aspect-[4/3]">
        {step.screenshot && !errored ? (
          <>
            <Image
              src={step.screenshot}
              alt={step.caption}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={() => setErrored(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
            Add {step.screenshot || "screenshot"} to /public/screenshots
          </div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col items-center text-center gap-6">
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">
              Visual Intelligence Platform
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Reframe images into understanding.
            </h1>
            <p className="text-zinc-400 max-w-2xl text-base md:text-lg">
              A visual intelligence platform for creators and product teams.
              Show the canvas, not the buzzwords.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition"
              >
                Open Reframe
              </Link>
              <Link
                href="/remix"
                className="px-5 py-3 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-200 hover:border-zinc-500 transition"
              >
                View demo
              </Link>
            </div>

            {/* Hero Visual - live screenshot */}
            <div className="mt-10 w-full">
              <div className="relative rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-[#0f1420] to-[#0b0d13] shadow-2xl overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <ScreenshotCard
                    shot={{
                      title: "Scene Editor",
                      src: "/screenshots/scene-editor.png",
                      alt: "Scene Editor live UI",
                      hint: "Canvas + Inspector",
                      href: "/",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Reframe Does */}
      <section className="px-6 py-16 border-t border-zinc-900/60 bg-[#06070c]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">What Reframe does</h2>
          <div className="space-y-3 text-zinc-400 text-lg">
            <p>Reframe looks at an image the way a human would — understanding its scene, structure, and intent.</p>
            <p>Then it helps you transform it with precision.</p>
            <p>One canvas, multiple intelligent outcomes.</p>
          </div>
        </div>
      </section>

      {/* Core Workflow */}
      <section className="px-6 py-16 border-t border-zinc-900/60">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center">
            <h3 className="text-xl font-semibold">How Reframe works</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {workflow.map((step) => (
              <WorkflowCard key={step.title} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="px-6 py-16 border-t border-zinc-900/60 bg-[#070910]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 space-y-3"
            >
              <p className="text-sm uppercase tracking-wide text-indigo-300/80">{cap.title}</p>
              <p className="text-zinc-300 text-base">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 py-16 border-t border-zinc-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-xl font-semibold">Designed for people who work with images professionally.</h3>
          <div className="flex flex-wrap justify-center gap-3 text-zinc-200">
            {personas.map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-6 py-16 border-t border-zinc-900/60 bg-[#06070c]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h3 className="text-xl font-semibold">Built with intent</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-zinc-300">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">Accessibility-first thinking</div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">Reversible AI actions</div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">No black-box decisions</div>
          </div>
        </div>
      </section>

      {/* Live product captures */}
      <section className="px-6 py-16 border-t border-zinc-900/60">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Live from the product</h3>
            <p className="text-sm text-zinc-500">
              These tiles load straight from /public/screenshots. Drop fresh captures there to keep this page current.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {liveScreenshots.map((shot) => (
              <ScreenshotCard key={shot.title} shot={shot} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-16 border-t border-zinc-900/60">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-semibold">Start with one image.</h3>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition"
            >
              Open Reframe
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-zinc-900/60 text-sm text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <span>Reframe ©</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-zinc-300 transition">About</Link>
            <Link href="#" className="hover:text-zinc-300 transition">Privacy</Link>
            <Link href="#" className="hover:text-zinc-300 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

