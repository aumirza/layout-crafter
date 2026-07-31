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
  Sparkles,
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
  Maximize2,
  ShieldCheck,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Grid,
  MousePointerClick,
} from "lucide-react";

// Mock photos for hero preview
const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
];

type LayoutPresetType = "grid-4" | "strip-3" | "hero-large" | "masonry-5";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [activePreset, setActivePreset] = useState<LayoutPresetType>("grid-4");
  const [gapValue, setGapValue] = useState<number>(12);
  const [radiusValue, setRadiusValue] = useState<number>(12);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300 overflow-x-hidden">
      {/* Background Decor Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-linear-to-tr from-primary/20 via-purple-500/10 to-blue-500/10 blur-[120px] rounded-full opacity-70 dark:opacity-40" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute top-[70%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Sticky Header Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Layout className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Layout<span className="text-primary">Crafter</span>
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold py-0.5 px-2 border-primary/30 text-primary">
              Pro Studio
            </Badge>
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
              className="rounded-full w-9 h-9 border border-border/50 hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            <Link to="/editor" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="rounded-full font-medium">
                Sign In
              </Button>
            </Link>

            <Link to="/editor">
              <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-1.5 px-4 font-semibold">
                Launch Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary backdrop-blur-md shadow-sm hover:border-primary/40 transition-colors">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Layout Crafter 2.0 • High-DPI Collage Engine</span>
              <ChevronRight className="h-3 w-3" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-foreground">
              Design Print-Ready Photo Collages{" "}
              <span className="bg-linear-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
              The intuitive layout studio for creators, photographers, and print enthusiasts.
              Arrange photos, fine-tune grid ratios, and export high-resolution PDFs with millimeter precision.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/editor" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base font-semibold rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2">
                  Start Creating Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#demo-preview" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 h-12 text-base font-medium rounded-full border-border/80 hover:bg-accent/60 gap-2">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  Try Interactive Demo
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Free & Client-Side</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>300 DPI Print Precision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Standard A4 / 4x6 / Letter Sizes</span>
              </div>
            </div>
          </div>

          {/* APP SHOWCASE MOCKUP (INTERACTIVE DEMO) */}
          <div id="demo-preview" className="mt-14 md:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden group">
              {/* SaaS Browser Header Bar */}
              <div className="h-11 bg-muted/60 border-b border-border/60 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-medium text-muted-foreground hidden sm:inline-block">
                    Layout Studio • Live Sandbox
                  </span>
                </div>

                <div className="bg-background/80 border border-border/40 rounded-md px-3 py-1 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 shadow-inner">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  layoutcrafter.app/studio
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    300 DPI READY
                  </Badge>
                </div>
              </div>

              {/* Interactive Sandbox Layout Body */}
              <div className="p-4 sm:p-6 md:p-8 bg-linear-to-b from-card to-background grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Side: Dynamic Controls Panel */}
                <div className="lg:col-span-4 space-y-5 bg-muted/40 p-4 rounded-xl border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                      Live Canvas Adjuster
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono font-semibold">
                      Interactive
                    </span>
                  </div>

                  {/* Preset Selector Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Select Grid Preset</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "grid-4", label: "2x2 Classic", icon: LayoutGrid },
                        { id: "strip-3", label: "Photo Strip", icon: Grid },
                        { id: "hero-large", label: "Hero Focus", icon: Maximize2 },
                        { id: "masonry-5", label: "Gallery Spread", icon: Layers },
                      ].map((preset) => {
                        const IconComponent = preset.icon;
                        const isSelected = activePreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setActivePreset(preset.id as LayoutPresetType)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all text-left border ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card hover:bg-accent border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <IconComponent className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gap Range Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Grid Gap</span>
                      <span className="font-mono text-primary font-bold">{gapValue}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={gapValue}
                      onChange={(e) => setGapValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Corner Radius Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Corner Radius</span>
                      <span className="font-mono text-primary font-bold">{radiusValue}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={radiusValue}
                      onChange={(e) => setRadiusValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Quick Editor Launch Button */}
                  <Link to="/editor" className="block pt-2">
                    <Button size="sm" className="w-full rounded-lg text-xs font-semibold gap-1.5 shadow-md">
                      Open Full Editor with this Layout
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* Right Side: Live Canvas Rendering Box */}
                <div className="lg:col-span-8 bg-muted/20 border border-border/50 rounded-xl p-4 sm:p-6 min-h-[320px] flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div
                    className="w-full max-w-md bg-card p-3 rounded-xl border border-border/60 shadow-lg transition-all duration-300"
                    style={{
                      padding: `${Math.max(6, gapValue)}px`,
                    }}
                  >
                    {/* Render Preset 1: Grid 2x2 */}
                    {activePreset === "grid-4" && (
                      <div
                        className="grid grid-cols-2 gap-2 transition-all"
                        style={{ gap: `${gapValue}px` }}
                      >
                        {MOCK_PHOTOS.slice(0, 4).map((src, idx) => (
                          <div
                            key={idx}
                            className="aspect-square overflow-hidden bg-muted relative group/item"
                            style={{ borderRadius: `${radiusValue}px` }}
                          >
                            <img
                              src={src}
                              alt={`Sample ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                              <Badge className="text-[9px] bg-background/90 text-foreground shadow-sm">
                                Photo #{idx + 1}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Preset 2: Photo Strip */}
                    {activePreset === "strip-3" && (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 transition-all"
                        style={{ gap: `${gapValue}px` }}
                      >
                        {MOCK_PHOTOS.slice(0, 3).map((src, idx) => (
                          <div
                            key={idx}
                            className="aspect-3/4 overflow-hidden bg-muted relative group/item"
                            style={{ borderRadius: `${radiusValue}px` }}
                          >
                            <img
                              src={src}
                              alt={`Sample Strip ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Preset 3: Hero Featured */}
                    {activePreset === "hero-large" && (
                      <div
                        className="grid grid-cols-3 gap-2 transition-all"
                        style={{ gap: `${gapValue}px` }}
                      >
                        <div
                          className="col-span-2 row-span-2 aspect-4/3 overflow-hidden bg-muted relative group/item"
                          style={{ borderRadius: `${radiusValue}px` }}
                        >
                          <img
                            src={MOCK_PHOTOS[0]}
                            alt="Hero Sample"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          />
                        </div>
                        <div
                          className="aspect-square overflow-hidden bg-muted relative group/item"
                          style={{ borderRadius: `${radiusValue}px` }}
                        >
                          <img
                            src={MOCK_PHOTOS[1]}
                            alt="Side 1"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          />
                        </div>
                        <div
                          className="aspect-square overflow-hidden bg-muted relative group/item"
                          style={{ borderRadius: `${radiusValue}px` }}
                        >
                          <img
                            src={MOCK_PHOTOS[2]}
                            alt="Side 2"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                          />
                        </div>
                      </div>
                    )}

                    {/* Render Preset 4: Gallery Spread */}
                    {activePreset === "masonry-5" && (
                      <div
                        className="grid grid-cols-3 gap-2 transition-all"
                        style={{ gap: `${gapValue}px` }}
                      >
                        {MOCK_PHOTOS.slice(0, 5).map((src, idx) => (
                          <div
                            key={idx}
                            className={`overflow-hidden bg-muted relative group/item ${
                              idx === 0 ? "col-span-2 aspect-16/10" : "aspect-square"
                            }`}
                            style={{ borderRadius: `${radiusValue}px` }}
                          >
                            <img
                              src={src}
                              alt={`Spread ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAAS STATS STRIP */}
        <section className="border-y border-border/40 bg-card/40 py-8 px-4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">300 DPI</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Print Export Quality</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">0 ms</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Server Lag (Local)</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">100%</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Free & Privacy-First</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Infinite</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Custom Layout Ratios</p>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO GRID SECTION */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-primary/30 text-primary">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything You Need for Perfect Layouts
            </h2>
            <p className="text-muted-foreground text-base">
              Engineered with pixel perfection, intuitive alignment helpers, and instant high-res rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-linear-to-br from-card via-card to-primary/5 p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 shadow-md group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Smart Grid & Custom Dimensions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Choose standard paper presets like A4, Letter, 4x6", 5x7" or define millimeter-exact custom dimensions.
                Easily specify row counts, columns, and automatic aspect ratio locks.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">A4 & Letter Standard</Badge>
                <Badge variant="secondary" className="text-xs">Photo Print 4x6" / 5x7"</Badge>
                <Badge variant="secondary" className="text-xs">Custom mm / inch / px</Badge>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 shadow-md group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Printer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Ultra High-DPI Export</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Export ultra-crisp vector PDFs or high-resolution PNGs ready to send straight to home printers or professional print shops.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-500">
                <Check className="h-3.5 w-3.5" /> Up to 300+ DPI Crisp Output
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 shadow-md group">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Live Spacing & Radius Controls</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Tweak outer margins, grid gaps, corner roundness, border strokes, and background colors with real-time feedback.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                <Check className="h-3.5 w-3.5" /> Dynamic Live Sliders
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-linear-to-tr from-card via-card to-purple-500/5 p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 shadow-md group">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">100% Private & Client-Side</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your personal memories and high-res photos never leave your device. All image processing, canvas operations, and PDF exports run directly inside your browser.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">No Server Uploads</Badge>
                <Badge variant="secondary" className="text-xs">Instant Processing</Badge>
                <Badge variant="secondary" className="text-xs">Offline Compatible</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES / PRESET SHOWCASE SECTION */}
        <section id="presets" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/30 rounded-3xl border border-border/40 my-12">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-primary/30 text-primary">
              Ready-to-Use Presets
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Collage Styles for Every Memory
            </h2>
            <p className="text-muted-foreground text-base">
              Start from scratch or pick a pre-configured design template optimized for prints, albums, and social posts.
            </p>

            {/* Tab Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: "all", label: "All Templates" },
                { id: "print", label: "Print & Framing" },
                { id: "strip", label: "Photo Strips" },
                { id: "social", label: "Social & Square" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTemplateTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTemplateTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50"
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
                title: "Classic 4-Photo Square",
                desc: "Equal 2x2 grid layout ideal for standard 6x6 square photo prints.",
                img: MOCK_PHOTOS[0],
                badge: "Popular",
                category: "print",
              },
              {
                title: "Vertical Film Strip",
                desc: "3-photo vertical stack mimicking nostalgic photobooth film strips.",
                img: MOCK_PHOTOS[1],
                badge: "Trending",
                category: "strip",
              },
              {
                title: "Featured Memory Spread",
                desc: "One dominant focal photo paired with two side support snapshots.",
                img: MOCK_PHOTOS[2],
                badge: "Editor's Choice",
                category: "social",
              },
              {
                title: "Wall Gallery Grid",
                desc: "6-item high density grid engineered for A4 wall frame collages.",
                img: MOCK_PHOTOS[3],
                badge: "A4 Print",
                category: "print",
              },
              {
                title: "Triple Landscape Row",
                desc: "Horizontal panorama layout for panoramic view photos and travel logs.",
                img: MOCK_PHOTOS[4],
                badge: "Wide",
                category: "social",
              },
              {
                title: "Minimalist Bordered Trio",
                desc: "Clean wide margins with refined image gap spacing for modern art prints.",
                img: MOCK_PHOTOS[5],
                badge: "Minimalist",
                category: "print",
              },
            ]
              .filter((item) => selectedTemplateTab === "all" || item.category === selectedTemplateTab)
              .map((template, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm group hover:-translate-y-1"
                >
                  <div className="aspect-16/10 overflow-hidden bg-muted relative">
                    <img
                      src={template.img}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-background/90 text-foreground font-semibold text-[10px] shadow-sm">
                        {template.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-foreground">{template.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{template.desc}</p>
                    <Link to="/editor" className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1 pt-1">
                      Use Preset in Studio
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
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-primary/30 text-primary">
              Simple 3-Step Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From Idea to Print in Minutes
            </h2>
            <p className="text-muted-foreground text-base">
              No complex design tools required. Crafting photo collages is fast and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                title: "Choose Canvas & Ratios",
                desc: "Select standard print paper dimensions or set custom width, height, and grid counts.",
                icon: MousePointerClick,
              },
              {
                step: "02",
                title: "Drop & Arrange Photos",
                desc: "Drag your photos onto the canvas. Adjust gaps, padding, corner roundedness, and crop focal points.",
                icon: Sliders,
              },
              {
                step: "03",
                title: "Export High-Res PDF",
                desc: "Click export to download print-ready 300 DPI PDF or PNG files ready for your home printer.",
                icon: Download,
              },
            ].map((st, i) => {
              const IconComp = st.icon;
              return (
                <div
                  key={i}
                  className="bg-card rounded-2xl border border-border/60 p-8 relative flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-black text-primary/40">{st.step}</span>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <IconComp className="h-5 w-5" />
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
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 border-primary/30 text-primary">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm">Everything you need to know about Layout Crafter.</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="item-1" className="border border-border/60 rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Is Layout Crafter free to use?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                Yes! Layout Crafter is 100% free with no watermarks or hidden export limits. All features including high-res PDF export are freely accessible.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border/60 rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Are my uploaded photos sent to any server?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                No. All image loading, canvas rendering, grid adjustments, and file generation happen entirely in your browser using modern Web APIs. Your images stay completely private on your machine.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border/60 rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                What file formats can I export?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                You can export high-resolution PDF documents (perfect for standard home & professional printing) as well as high-DPI PNG images for digital sharing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border/60 rounded-xl px-4 bg-card">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
                Can I specify exact paper sizes like A4 or 4x6"?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                Absolutely. The editor comes built-in with preset paper sizes (A4, Letter, 4x6 photo paper, 5x7 art print) and supports custom unit inputs in millimeters, inches, or pixels.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* HIGH-CONVERSION CTA BANNER */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-3xl bg-linear-to-r from-primary via-purple-600 to-blue-600 p-8 sm:p-12 md:p-16 text-primary-foreground text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
            <div className="relative max-w-2xl mx-auto space-y-6">
              <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 text-xs font-semibold px-3 py-1">
                Start Building Now
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Ready to Craft Your Next Photo Collage?
              </h2>
              <p className="text-white/80 text-base sm:text-lg">
                Join thousands of creators making print-perfect photo layouts effortlessly.
              </p>
              <div className="pt-2">
                <Link to="/editor">
                  <Button size="lg" className="bg-white text-foreground hover:bg-white/90 px-8 h-12 text-base font-bold rounded-full shadow-xl hover:scale-105 transition-all gap-2">
                    Launch Layout Studio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-card/60 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              LC
            </div>
            <span className="font-bold text-foreground text-sm">LayoutCrafter</span>
            <span>• High-DPI Photo Collage Maker</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#presets" className="hover:text-foreground transition-colors">Presets</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <Link to="/editor" className="hover:text-foreground transition-colors">Studio</Link>
          </div>

          <p>&copy; {new Date().getFullYear()} LayoutCrafter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
