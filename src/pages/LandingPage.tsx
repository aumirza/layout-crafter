import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "@/hooks/use-theme";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Printer,
  Sliders,
  Download,
  Layers,
  ArrowRight,
  CheckCircle2,
  Moon,
  Sun,
  Layout,
  ShieldCheck,
  Check,
  ChevronRight,
  Grid,
  MousePointerClick,
  Ruler,
  Scissors,
  FileText,
  Sparkles,
  SlidersHorizontal,
  Maximize2,
  Square,
  Sparkle,
} from "lucide-react";
import { CollageCanvas } from "@/components/CollageCanvas";
import { CollageState } from "@/types/collage";

// Authentic default CollageState for Hero Live Canvas Preview
const HERO_DEMO_COLLAGE: CollageState = {
  pageSize: {
    id: "a4",
    name: "A4 Standard",
    width: 210,
    height: 297,
    label: "A4 (210 × 297 mm)",
    margin: 10,
  },
  layout: {
    id: "grid-4",
    name: "2×2 Grid",
    cellWidth: 91,
    cellHeight: 134.5,
    label: "2×2 Equal",
  },
  images: [], // Clean empty placeholders as requested
  cells: [
    [
      { id: "cell-0-0", imageId: null, orientation: "auto" },
      { id: "cell-0-1", imageId: null, orientation: "auto" },
    ],
    [
      { id: "cell-1-0", imageId: null, orientation: "auto" },
      { id: "cell-1-1", imageId: null, orientation: "auto" },
    ],
  ],
  rows: 2,
  columns: 2,
  spaceOptimization: "loose",
  showCuttingMarkers: true,
  markerColor: "#64748b",
  markerSize: 5,
  selectedUnit: "mm",
  rowGap: 8,
  columnGap: 8,
  gapsLinked: true,
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 overflow-x-hidden antialiased">
      {/* Precision Blueprint Grid Background (No AI Slop Gradients) */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />

      {/* Sticky Header Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Layout className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                Layout<span className="text-primary font-black">Crafter</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold py-0.5 px-2 border-border text-muted-foreground">
                Studio
              </Badge>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#presets" className="hover:text-foreground transition-colors">
              Templates
            </a>
            <a href="#workflow" className="hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg w-9 h-9 border border-border/60 hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            <Link to="/library">
              <Button size="sm" className="rounded-lg shadow-sm font-semibold gap-1.5 px-4">
                Launch Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs font-medium text-foreground backdrop-blur-sm shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>High-Precision Photo Layout & Print Engine</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-foreground">
              Design Print-Ready Photo Collages with Millimeter Precision
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
              Arrange photos into exact physical grid layouts. Control margins, gaps, cutting markers, and export print-ready PDFs directly in your browser.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/library" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold rounded-lg shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all gap-2">
                  Open Studio Library
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#demo-preview" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 h-12 text-base font-medium rounded-lg border-border hover:bg-accent gap-2">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  View Studio Canvas
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Client-Side Privacy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>300 DPI Export Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Standard A4 / Letter / Custom Sizes</span>
              </div>
            </div>
          </div>

          {/* AUTHENTIC EDITOR UI SHOWCASE (REAL CANVAS PREVIEW) */}
          <div id="demo-preview" className="mt-12 md:mt-16 max-w-5xl mx-auto">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Studio Window Title Bar */}
              <div className="h-10 bg-muted/80 border-b border-border px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-foreground/80 hidden sm:inline-block">
                    Layout Studio • Live Editor Canvas
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[11px] font-mono bg-background text-foreground border-border px-2.5 py-0.5">
                    <span className="text-primary font-bold mr-1">A4</span> 210 × 297 mm
                  </Badge>
                  <Badge className="text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    300 DPI READY
                  </Badge>
                </div>
              </div>

              {/* Editor Workspace Shell */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] bg-slate-950 text-slate-100">
                {/* Left Mini Sidebar */}
                <div className="hidden md:flex md:col-span-3 border-r border-slate-800 bg-slate-900/90 p-4 flex-col justify-between text-xs">
                  <div className="space-y-4">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                      Studio Controls
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Page Presets</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> A4 Paper
                          </span>
                          <span className="text-[10px] font-mono">210×297mm</span>
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-800/60 text-slate-400 text-xs hover:text-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Square className="h-3.5 w-3.5" /> 4×6" Print
                          </span>
                          <span className="text-[10px] font-mono">102×152mm</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-xs font-medium text-slate-300">Grid Division</label>
                      <div className="grid grid-cols-2 gap-1.5 text-center">
                        <div className="p-2 rounded bg-indigo-600 text-white font-medium text-xs">
                          2 × 2 Grid
                        </div>
                        <div className="p-2 rounded bg-slate-800 text-slate-400 font-medium text-xs">
                          3 × 3 Grid
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-slate-300 text-xs">
                        <span>Cut Markers</span>
                        <span className="text-emerald-400 font-mono font-semibold">Enabled</span>
                      </div>
                      <div className="flex justify-between text-slate-300 text-xs">
                        <span>Margin / Gaps</span>
                        <span className="text-slate-400 font-mono">8 mm</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/library" className="pt-4 border-t border-slate-800">
                    <Button size="sm" className="w-full text-xs font-semibold gap-1 bg-indigo-600 hover:bg-indigo-500 text-white">
                      Open Studio Library
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Right Workspace with Measurement Rulers & Real Canvas */}
                <div className="md:col-span-9 flex flex-col relative overflow-hidden bg-slate-950">
                  {/* Top Measurement Ruler */}
                  <div className="h-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-[9px] font-mono text-slate-400 select-none">
                    <span>0 mm</span>
                    <span>52 mm</span>
                    <span>105 mm</span>
                    <span>157 mm</span>
                    <span>210 mm</span>
                  </div>

                  {/* Canvas Viewport Area */}
                  <div className="flex-1 flex relative items-center justify-center p-6 sm:p-8 bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                    {/* Left Ruler */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-6 text-[9px] font-mono text-slate-400 items-center select-none">
                      <span>0</span>
                      <span>148</span>
                      <span>297</span>
                    </div>

                    {/* Real Collage Canvas Component Container */}
                    <div className="shadow-2xl rounded border border-slate-800 bg-white p-2 max-w-[280px] sm:max-w-[320px] transition-transform">
                      <CollageCanvas
                        collageState={HERO_DEMO_COLLAGE}
                        onAssignImage={() => {}}
                      />
                    </div>
                  </div>

                  {/* Bottom Viewport Control Strip */}
                  <div className="h-8 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Ruler className="h-3 w-3 text-indigo-400" /> mm
                      </span>
                      <span className="flex items-center gap-1">
                        <Scissors className="h-3 w-3 text-slate-400" /> Markers: On
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Zoom: 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="border-y border-border/60 bg-muted/30 py-8 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">300 DPI</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Print Export Resolution</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">0 ms</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Server Lag (Client-Side)</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">100%</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Private & Free</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Exact mm</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Physical Dimension Control</p>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO GRID SECTION */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-border text-foreground">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for High-Precision Print & Layout Crafts
            </h2>
            <p className="text-muted-foreground text-base">
              Intuitive paper configuration, custom grid math, live cut markers, and crisp vector PDF generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 sm:p-8 hover:border-primary/40 transition-all shadow-xs group">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <LayoutGrid className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Physical Paper Sizing & Millimeter Control</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Choose standard paper sizes (A4, A3, Letter, 4x6" photo prints) or enter exact physical width, height, and margin inputs in millimeters, inches, or pixels.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">A4 & Letter Standard</Badge>
                <Badge variant="secondary" className="text-xs">4×6" & 5×7" Photo Paper</Badge>
                <Badge variant="secondary" className="text-xs">Custom mm / in / px</Badge>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 hover:border-primary/40 transition-all shadow-xs group">
              <div className="h-11 w-11 rounded-lg bg-slate-900 text-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Printer className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">300+ DPI Crisp PDF & PNG Export</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Export vector PDF documents or ultra high-resolution PNG files ready to send directly to your home printer or professional print service.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" /> High-Resolution Output
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 hover:border-primary/40 transition-all shadow-xs group">
              <div className="h-11 w-11 rounded-lg bg-slate-900 text-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Sliders className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Live Spacing & Cut Marker Overlay</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Adjust outer margins, inner row/column gaps, and toggle visible corner cut markers for easy post-print trimming.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Check className="h-3.5 w-3.5" /> Precision Cutting Lines
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 sm:p-8 hover:border-primary/40 transition-all shadow-xs group">
              <div className="h-11 w-11 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">100% Private & Client-Side Processing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your images and photos remain strictly on your local machine. Canvas generation, matrix transformations, and PDF exports run offline right inside your browser context.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">No Server Uploads</Badge>
                <Badge variant="secondary" className="text-xs">Zero Data Tracking</Badge>
                <Badge variant="secondary" className="text-xs">Works Offline</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* READY-TO-USE PRESETS SECTION */}
        <section id="presets" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-2xl border border-border/60 my-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-border text-foreground">
              Layout Presets
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Grid Templates for Every Project
            </h2>
            <p className="text-muted-foreground text-base">
              Start with standardized grid templates tailored for photo prints, albums, wall framing, and square grids.
            </p>

            {/* Tab Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: "all", label: "All Layouts" },
                { id: "print", label: "Standard Prints" },
                { id: "grid", label: "Equal Grids" },
                { id: "strip", label: "Photo Strips" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTemplateTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTemplateTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Classic 2×2 Photo Grid",
                desc: "Equal 4-cell layout optimized for 4x6 or A4 print sheets.",
                category: "grid",
                badge: "Standard",
              },
              {
                title: "Vertical 3-Strip Photobooth",
                desc: "3-photo vertical stack designed for strip printing and memories.",
                category: "strip",
                badge: "Popular",
              },
              {
                title: "Equal 3×3 Grid Matrix",
                desc: "9-cell high-density grid engineered for photo cataloging.",
                category: "grid",
                badge: "High Capacity",
              },
              {
                title: "A4 Wall Frame Grid",
                desc: "Balanced multi-photo composition structured for wall frames.",
                category: "print",
                badge: "A4 Print",
              },
              {
                title: "Panoramic Horizontal Trio",
                desc: "Wide aspect cell arrangement ideal for landscape snapshots.",
                category: "print",
                badge: "Landscape",
              },
              {
                title: "Bordered Trio Spread",
                desc: "Clean outer margins with generous gaps for art prints.",
                category: "print",
                badge: "Minimalist",
              },
            ]
              .filter((item) => selectedTemplateTab === "all" || item.category === selectedTemplateTab)
              .map((template, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border">
                        {template.badge}
                      </Badge>
                      <Layout className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{template.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{template.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
                    <Link to="/library" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1">
                      Use in Studio
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-border text-foreground">
              3-Step Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From Concept to Print in Minutes
            </h2>
            <p className="text-muted-foreground text-base">
              No complex design software needed. Create clean photo grid layouts effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Select Canvas & Paper Size",
                desc: "Choose from standard print paper sizes (A4, Letter, 4x6) or specify custom width, height, and margins in millimeters.",
                icon: MousePointerClick,
              },
              {
                step: "02",
                title: "Arrange & Fine-Tune Gaps",
                desc: "Position your photos into grid cells. Adjust row gaps, column spacing, image fit modes, and orientation locks.",
                icon: Sliders,
              },
              {
                step: "03",
                title: "Export Print-Ready PDF",
                desc: "Export 300 DPI high-resolution PDF or PNG files complete with corner cutting markers ready for printing.",
                icon: Download,
              },
            ].map((st, i) => {
              const IconComp = st.icon;
              return (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-8 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-bold text-primary">{st.step}</span>
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{st.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-border text-foreground">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Got Questions?</h2>
            <p className="text-muted-foreground text-sm">Everything you need to know about Layout Crafter.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Is Layout Crafter free to use?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                Yes! Layout Crafter is 100% free with no watermarks or artificial export restrictions. All features including 300 DPI PDF export are fully accessible.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Are my uploaded photos sent to external servers?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                No. All image loading, canvas rendering, grid adjustments, and file downloads happen locally in your browser using modern Web Canvas APIs. Your photos remain completely private on your device.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                What file formats can I export?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                You can export high-resolution PDF files (ready for home & commercial printing) as well as high-DPI PNG image files.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Can I specify exact paper sizes like A4 or 4×6"?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                Yes. The editor includes built-in paper size presets (A4, Letter, 4x6, 5x7) and supports custom physical measurements in millimeters, inches, or pixels.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA BANNER */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 p-8 sm:p-12 text-center shadow-xl">
            <div className="max-w-2xl mx-auto space-y-6">
              <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1">
                Start Creating Now
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to Craft Your Photo Layout?
              </h2>
              <p className="text-slate-400 text-base">
                Join creators and print enthusiasts making exact-dimension photo layouts with zero server lag.
              </p>
              <div className="pt-2">
                <Link to="/library">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-semibold rounded-lg shadow-md gap-2">
                    Open Studio Library
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              LC
            </div>
            <span className="font-bold text-foreground text-sm">LayoutCrafter</span>
            <span>• High-Precision Photo Grid Maker</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#presets" className="hover:text-foreground transition-colors">Templates</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <Link to="/library" className="hover:text-foreground transition-colors">Studio</Link>
          </div>

          <p>&copy; {new Date().getFullYear()} LayoutCrafter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
