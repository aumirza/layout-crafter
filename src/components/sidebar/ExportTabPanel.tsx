import { useState, useEffect, RefObject } from "react";
import { useCollage } from "@/context/CollageContext";
import { ExportFormat } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";
import { exportCollage } from "@/lib/export-utility";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarSeparator } from "@/components/ui/sidebar";
import {
  Download,
  Printer,
  RefreshCw,
  Trash2,
  Scissors,
  SlidersHorizontal,
  FileCheck,
  Sparkles,
  AlertTriangle,
  FileImage,
  FileType,
} from "lucide-react";

interface ExportTabPanelProps {
  collageRef: RefObject<HTMLDivElement>;
}

const MARKER_COLOR_PRESETS = [
  { name: "Slate", hex: "#9ca3af" },
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Black", hex: "#000000" },
];

const DPI_PRESETS = [150, 300, 600, 1200];

export function ExportTabPanel({ collageRef }: ExportTabPanelProps) {
  const {
    collageState,
    toggleCuttingMarkers,
    setMarkerColor,
    setMarkerSize,
    resetCanvas,
    clearAll,
    settings,
  } = useCollage();

  const isEnabled = collageState.images.length > 0;
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState<number>(2);

  // Initialize DPI based on app settings export quality
  const [customDpi, setCustomDpi] = useState<number>(() => {
    switch (settings.exportQuality) {
      case "low":
        return 150;
      case "medium":
        return 300;
      case "high":
        return 600;
      case "ultra":
        return 1200;
      default:
        return 300;
    }
  });

  // Sync DPI when app settings export quality changes
  useEffect(() => {
    const newDpi = (() => {
      switch (settings.exportQuality) {
        case "low":
          return 150;
        case "medium":
          return 300;
        case "high":
          return 600;
        case "ultra":
          return 1200;
        default:
          return 300;
      }
    })();
    setCustomDpi(newDpi);
  }, [settings.exportQuality]);

  const handleExportClick = async () => {
    if (!isEnabled || isExporting) return;

    setIsExporting(true);
    try {
      await exportCollage({
        collageState,
        collageRef,
        exportFormat,
        customDpi,
        exportScale,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, collageState.selectedUnit, 1);
  };

  const effectiveDpi = Math.round(customDpi * exportScale);
  const effectiveScale = ((customDpi / 96) * exportScale).toFixed(1);

  // Calculate pixel dimensions of final output
  const pxWidth = Math.round((collageState.pageSize.width / 25.4) * effectiveDpi);
  const pxHeight = Math.round((collageState.pageSize.height / 25.4) * effectiveDpi);

  return (
    <div className="flex flex-col gap-5 text-sidebar-foreground">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
          <Download className="size-4 text-primary" />
          Print & Export
        </span>
        <Badge
          variant="outline"
          className="text-[10px] font-mono border-sidebar-border bg-sidebar-accent/40 text-primary font-semibold px-2 py-0.5"
        >
          {customDpi} DPI READY
        </Badge>
      </div>

      {/* Quick Actions Card */}
      <div className="bg-sidebar-accent/20 border border-sidebar-border/60 rounded-xl p-3 space-y-2">
        <span className="text-[11px] font-medium text-sidebar-foreground/70 uppercase tracking-wider block">
          Canvas Actions
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCanvas}
            className="h-8 text-xs flex items-center justify-center gap-1.5 border-sidebar-border bg-sidebar hover:bg-sidebar-accent/50 transition-colors"
          >
            <RefreshCw className="size-3.5 text-muted-foreground" />
            Reset Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-8 text-xs flex items-center justify-center gap-1.5 border-sidebar-border bg-sidebar hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Clear All
          </Button>
        </div>
      </div>

      <SidebarSeparator />

      {/* Export Format Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-sidebar-foreground flex items-center justify-between">
          <span>Export Format</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {exportFormat === "png"
              ? "High Resolution Raster"
              : exportFormat === "pdf"
              ? "Print-Ready Vector Document"
              : "Browser Print Layout"}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/60">
          <button
            type="button"
            onClick={() => setExportFormat("png")}
            className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
              exportFormat === "png"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            }`}
          >
            <FileImage className="size-4" />
            PNG
          </button>
          <button
            type="button"
            onClick={() => setExportFormat("pdf")}
            className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
              exportFormat === "pdf"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            }`}
          >
            <FileType className="size-4" />
            PDF
          </button>
          <button
            type="button"
            onClick={() => setExportFormat("print")}
            className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg text-xs font-medium transition-all ${
              exportFormat === "print"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
            }`}
          >
            <Printer className="size-4" />
            Print
          </button>
        </div>
      </div>

      {/* Cutting Guidelines Section */}
      <div className="bg-sidebar-accent/20 border border-sidebar-border/60 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="size-4 text-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">
              Cutting Markers
            </span>
          </div>
          <Switch
            checked={collageState.showCuttingMarkers}
            onCheckedChange={toggleCuttingMarkers}
          />
        </div>

        {collageState.showCuttingMarkers && (
          <div className="space-y-3.5 pt-1 border-t border-sidebar-border/40">
            {/* Marker Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Marker Length</span>
                <span className="font-mono text-[11px] font-semibold text-primary">
                  {collageState.markerSize || 5} mm
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={collageState.markerSize || 5}
                onChange={(e) => setMarkerSize(Number(e.target.value))}
                className="w-full h-1.5 bg-sidebar-accent accent-primary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/70 font-mono">
                <span>2 mm</span>
                <span>10 mm</span>
                <span>20 mm</span>
              </div>
            </div>

            {/* Marker Color Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Marker Color</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={collageState.markerColor}
                    onChange={(e) => setMarkerColor(e.target.value)}
                    className="w-5 h-5 border border-sidebar-border rounded-md cursor-pointer bg-transparent"
                    title="Choose custom color"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    {collageState.markerColor}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {MARKER_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    title={preset.name}
                    onClick={() => setMarkerColor(preset.hex)}
                    className={`size-5 rounded-full border-2 transition-all ${
                      collageState.markerColor === preset.hex
                        ? "border-primary scale-110 shadow-sm"
                        : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resolution & Quality Settings */}
      <div className="bg-sidebar-accent/20 border border-sidebar-border/60 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sidebar-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" />
            Quality & Scaling
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {pxWidth}×{pxHeight} px
          </span>
        </div>

        {/* DPI Input and Quick Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">Base Resolution</span>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={customDpi}
                onChange={(e) => setCustomDpi(Math.max(72, Math.min(1200, Number(e.target.value))))}
                min="72"
                max="1200"
                step="25"
                className="w-16 h-7 text-xs font-mono text-right border-sidebar-border bg-sidebar px-1.5"
              />
              <span className="text-[11px] text-muted-foreground font-mono">DPI</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {DPI_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCustomDpi(preset)}
                className={`py-1 text-[10px] font-mono rounded-md border transition-all ${
                  customDpi === preset
                    ? "bg-primary/10 border-primary text-primary font-bold"
                    : "border-sidebar-border/60 bg-sidebar/50 text-muted-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Export Scale Multiplier Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[11px]">Scale Multiplier</span>
            <span className="font-mono text-[11px] font-semibold text-primary">
              {exportScale}x ({effectiveScale}x effective)
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.5"
            value={exportScale}
            onChange={(e) => setExportScale(Number(e.target.value))}
            className="w-full h-1.5 bg-sidebar-accent accent-primary rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/70 font-mono">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
            <span>3.0x</span>
          </div>
        </div>

        {/* High DPI performance warning */}
        {effectiveDpi > 600 && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>High DPI rendering may take a few seconds to process.</span>
          </div>
        )}
      </div>

      {/* Page Dimension Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 bg-sidebar-accent/10 py-2 rounded-lg border border-sidebar-border/40">
        <div className="flex items-center gap-1.5">
          <FileCheck className="size-3.5 text-primary" />
          <span>
            {collageState.pageSize.name} ({formatDimension(collageState.pageSize.width)} ×{" "}
            {formatDimension(collageState.pageSize.height)})
          </span>
        </div>
        <span className="font-mono text-[10px] text-sidebar-foreground/70">
          {collageState.rows * collageState.columns} cells
        </span>
      </div>

      {/* Primary Export Button */}
      <div className="space-y-2">
        <Button
          disabled={isExporting || !isEnabled}
          className="w-full h-10 flex items-center justify-center gap-2 font-medium shadow-sm transition-all"
          onClick={handleExportClick}
          variant={isEnabled ? "default" : "outline"}
        >
          {isExporting ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : exportFormat === "print" ? (
            <Printer className="size-4" />
          ) : (
            <Download className="size-4" />
          )}
          <span>
            {isExporting
              ? "Rendering Export..."
              : exportFormat === "print"
              ? "Print Collage"
              : `Export ${exportFormat.toUpperCase()}`}
          </span>
        </Button>

        {!isEnabled && (
          <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Sparkles className="size-3 text-muted-foreground" />
            Add images to canvas to enable export
          </p>
        )}
      </div>
    </div>
  );
}
