import { useCollage } from "@/context/CollageContext";
import { PageSizeSelector } from "../PageSizeSelector";
import { pageSizes } from "@/data/page-sizes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { UnitConverter } from "@/lib/unit-converter";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  CheckCircle2,
  LayoutTemplate,
  RectangleVertical,
  RectangleHorizontal,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PaperTabPanel() {
  const { collageState, updatePageSize } = useCollage();
  const currentUnit = collageState.selectedUnit || "mm";

  const handleSetPageOrientation = (targetOrientation: "portrait" | "landscape") => {
    const currentW = collageState.pageSize.width;
    const currentH = collageState.pageSize.height;
    const isLandscape = currentW >= currentH;

    if (targetOrientation === "landscape" && !isLandscape) {
      updatePageSize({
        ...collageState.pageSize,
        width: Math.max(currentW, currentH),
        height: Math.min(currentW, currentH),
      });
      toast({
        title: "Page Orientation Changed",
        description: "Set page to Landscape orientation.",
      });
    } else if (targetOrientation === "portrait" && isLandscape) {
      updatePageSize({
        ...collageState.pageSize,
        width: Math.min(currentW, currentH),
        height: Math.max(currentW, currentH),
      });
      toast({
        title: "Page Orientation Changed",
        description: "Set page to Portrait orientation.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Page Orientation Selector */}
      <div className="flex flex-col gap-2.5 bg-sidebar-accent/20 border border-sidebar-border p-3.5 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-1.5">
            <LayoutTemplate className="size-4 text-sidebar-primary" />
            Page Orientation
          </span>
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 border-sidebar-primary/30 text-sidebar-primary bg-sidebar-primary/5"
          >
            {collageState.pageSize.width >= collageState.pageSize.height
              ? "Landscape"
              : "Portrait"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Button
            type="button"
            variant={
              collageState.pageSize.width < collageState.pageSize.height
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => handleSetPageOrientation("portrait")}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <RectangleVertical className="size-3.5 shrink-0" />
            <span>Portrait</span>
          </Button>

          <Button
            type="button"
            variant={
              collageState.pageSize.width >= collageState.pageSize.height
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => handleSetPageOrientation("landscape")}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <RectangleHorizontal className="size-3.5 shrink-0" />
            <span>Landscape</span>
          </Button>
        </div>
      </div>

      <SidebarSeparator />

      {/* 2. Page Margin Adjuster */}
      <div className="flex flex-col gap-2.5 bg-sidebar-accent/20 border border-sidebar-border p-3.5 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-1.5">
            <Maximize2 className="size-4 text-sidebar-primary" />
            Page Margin
          </span>
          <Badge
            variant="secondary"
            className="text-[10px] font-mono font-bold px-2 py-0.5"
          >
            {UnitConverter.formatDimension(collageState.pageSize.margin, currentUnit, 1)} {currentUnit}
          </Badge>
        </div>

        {/* Margin Slider */}
        <div className="py-1">
          <Slider
            value={[collageState.pageSize.margin]}
            onValueChange={(vals) => {
              const val = Array.isArray(vals) ? vals[0] : vals;
              if (typeof val === "number" && !isNaN(val)) {
                updatePageSize({
                  ...collageState.pageSize,
                  margin: Math.max(0, val),
                });
              }
            }}
            min={0}
            max={50}
            step={0.5}
            className="py-1"
          />
        </div>

        {/* Quick margin preset buttons */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-muted-foreground font-mono">Quick:</span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={collageState.pageSize.margin === m ? "default" : "outline"}
                onClick={() =>
                  updatePageSize({
                    ...collageState.pageSize,
                    margin: m,
                  })
                }
                className="h-5 px-1.5 text-[10px] font-mono rounded"
              >
                {UnitConverter.formatDimension(m, currentUnit, 1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <SidebarSeparator />

      {/* 3. Standard Canvas Presets */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
            <FileText className="size-4 text-sidebar-primary" />
            Standard Canvas Presets
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-sidebar-border bg-sidebar-accent/30"
          >
            {UnitConverter.formatDimension(collageState.pageSize.width, currentUnit, 1)} × {UnitConverter.formatDimension(collageState.pageSize.height, currentUnit, 1)}
          </Badge>
        </div>

        {/* Preset Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          {pageSizes.slice(0, 8).map((ps) => {
            const isSelected = collageState.pageSize.name === ps.name;
            const formattedW = UnitConverter.formatDimension(ps.width, currentUnit, 1);
            const formattedH = UnitConverter.formatDimension(ps.height, currentUnit, 1);
            return (
              <button
                key={ps.name}
                onClick={() => updatePageSize(ps)}
                className={cn(
                  "p-3 rounded-xl text-left border transition-all flex flex-col gap-0.5",
                  isSelected
                    ? "bg-sidebar-primary/10 border-sidebar-primary text-sidebar-primary font-bold shadow-2xs"
                    : "bg-sidebar-accent/30 hover:bg-sidebar-accent border-sidebar-border text-muted-foreground hover:text-sidebar-foreground"
                )}
              >
                <div className="font-semibold text-xs truncate flex items-center justify-between">
                  <span>{ps.label || ps.name}</span>
                  {isSelected && (
                    <CheckCircle2 className="size-3 text-sidebar-primary shrink-0 ml-1" />
                  )}
                </div>
                <div className="text-[10px] opacity-75 font-mono">
                  {formattedW}×{formattedH} {currentUnit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <SidebarSeparator />

      {/* 4. Custom Dimension Selector */}
      <div className="flex flex-col gap-2.5">
        <span className="font-semibold text-xs text-sidebar-foreground">
          Custom Dimension Selector
        </span>
        <PageSizeSelector />
      </div>
    </div>
  );
}
