import { LayoutGrid, Grid, Layers, Maximize2, LucideIcon } from "lucide-react";

export interface PreConfiguredTemplate {
  id: string;
  name: string;
  desc: string;
  layoutId: string;
  optimization: "tight" | "loose";
  icon: LucideIcon;
  badge?: string;
}

export const PRECONFIGURED_TEMPLATES: PreConfiguredTemplate[] = [
  {
    id: "passport-grid",
    name: "Passport Grid",
    desc: "Standard 35×45mm photos",
    layoutId: "passport_photo",
    optimization: "tight",
    icon: Maximize2,
    badge: "Essential",
  },
  {
    id: "classic-2x2",
    name: "2×2 Square Grid",
    desc: "Equal 2x2 photo tiles",
    layoutId: "2x2_photo",
    optimization: "tight",
    icon: LayoutGrid,
    badge: "Popular",
  },
  {
    id: "wallet-grid",
    name: "Wallet Size",
    desc: "Pocket 2.5×3.5\" photos",
    layoutId: "wallet_size",
    optimization: "tight",
    icon: Layers,
  },
  {
    id: "standard-4x6",
    name: "4×6\" Print",
    desc: "Standard photo print",
    layoutId: "4x6_photo",
    optimization: "loose",
    icon: Grid,
  },
];
