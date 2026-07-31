# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, Vite, Tailwind CSS v4, Zustand, HTML5 Canvas, jsPDF, html2canvas, Lucide React icons, Radix UI / Base UI (Open to stack/dependency adjustments for performance or visual capabilities).

## Users

Photographers, print shops, and content creators needing exact-dimension collage & photo grid layouts for printing or export.

## Product Purpose

Layout Crafter provides an intuitive, high-precision canvas editor for arranging photos into custom grid compositions with exact physical paper dimensions (mm, in, px), margins, gaps, and high-resolution export.

## Positioning

Precise physical paper size & unit control (mm, in, px) combined with custom grid divisions (equal division calculator), margin/gap controls, image fit modes, preset management, and high-DPI PDF/PNG export.

## Operating Context

Desktop browser web app where users upload photos, configure print canvas sizes (A4, A3, Letter, Legal, Custom), tune layout geometry, adjust individual image scale/rotation/crop, save custom layout presets, and export print-ready PDFs or image files.

## Capabilities and Constraints

- Multi-unit paper sizing (mm, inches, pixels) with preset standards and custom dimensions.
- Grid division tools: row/column count, margins, inner gaps, and equal division calculation.
- Drag-and-drop photo positioning and reordering.
- Per-image adjustment: fit/fill mode, scale, rotation, crop ratios, aspect matching.
- Preset management (saving, loading, applying predefined/custom layout configurations).
- Client-side rendering and export to PNG and PDF formats.
- Technical flexibility: Open to stack or dependency adjustments if needed for performance or visual capabilities.

## Brand Commitments

- Name: Layout Crafter
- Platform: Web app with clean, utility-focused workspace and modern canvas design.

## Evidence on Hand

- Existing workspace with interactive landing page (`src/pages/LandingPage.tsx`), editor view (`src/pages/Editor.tsx`), canvas renderer (`src/lib/canvas-renderer.ts`), and preset manager (`src/components/PresetManager.tsx`).

## Product Principles

1. **Precision First:** Every measurement and layout rule reflects exact physical or pixel dimensions accurately.
2. **Seamless Flow:** Instant visual feedback as users tune paper sizes, margins, gaps, and image transformations.
3. **Flexible Craft:** Support both automated grid presets (equal division) and hands-on per-image customization.
4. **Reliable Handoff:** High-DPI, accurate PDF and PNG export matching the on-screen canvas composition.

## Accessibility & Inclusion

- High visual contrast for editor controls, structured form fields with labels, accessible dialogs and panels via Radix UI primitives, keyboard-navigable sliders and buttons.
