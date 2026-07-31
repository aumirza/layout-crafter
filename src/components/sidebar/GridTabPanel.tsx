import { useState, useEffect, useRef, useMemo } from "react";
import { useCollage } from "@/context/CollageContext";
import { usePresetStore } from "@/stores/preset-store";
import { GapControls } from "../GapControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UnitConverter } from "@/lib/unit-converter";
import { toast } from "@/hooks/use-toast";
import { PresetSelector } from "@/components/ui/preset-selector";
import { TemplatePresetGrid } from "@/components/TemplatePresetGrid";
import { PreConfiguredTemplate } from "@/data/template-presets";
import { layoutPresets } from "@/data/layout-presets";
import {
  CustomPresetDialog,
  LayoutData,
} from "@/components/ui/custom-preset-dialog";
import {
  Sparkles,
  BookmarkPlus,
  Scale,
  SlidersHorizontal,
  RotateCcw,
  Maximize2,
  RectangleVertical,
  RectangleHorizontal,
  LayoutTemplate,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface GridTabPanelProps {
  onOpenEqualDivModal: () => void;
}

export function GridTabPanel({ onOpenEqualDivModal }: GridTabPanelProps) {
  const {
    collageState,
    setGapsLinked,
    setRowGap,
    setColumnGap,
    createCustomLayout,
    updateLayout,
    updatePageSize,
    setSpaceOptimization,
  } = useCollage();

  const presetStore = usePresetStore();
  const currentUnit = collageState.selectedUnit || "mm";
  const currentLayout = collageState.layout;
  const cellW = currentLayout.cellWidth;
  const cellH = currentLayout.cellHeight;
  const spaceOptimization = collageState.spaceOptimization;

  const maxCells = useMemo(
    () => collageState.rows * collageState.columns,
    [collageState.rows, collageState.columns]
  );

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

  const addCustomLayout = usePresetStore((state) => state.addCustomLayout);
  const customLayouts = usePresetStore((state) => state.customLayouts);
  const defaultLayouts = usePresetStore((state) => state.defaultLayouts);

  const allLayouts = useMemo(() => {
    return [...(defaultLayouts.length > 0 ? defaultLayouts : layoutPresets), ...customLayouts];
  }, [defaultLayouts, customLayouts]);

  // Track base dimensions before scaling
  const [baseDimensions, setBaseDimensions] = useState<{ width: number; height: number } | null>(
    null
  );
  const [scaleOffset, setScaleOffset] = useState<number>(0);
  const prevLayoutIdRef = useRef<string>("");

  useEffect(() => {
    const layoutId = currentLayout.id;
    if (
      layoutId !== prevLayoutIdRef.current &&
      layoutId !== "custom" &&
      !layoutId.startsWith("scaled_")
    ) {
      setBaseDimensions({ width: currentLayout.cellWidth, height: currentLayout.cellHeight });
      setScaleOffset(0);
      prevLayoutIdRef.current = layoutId;
    } else if (!baseDimensions) {
      setBaseDimensions({ width: currentLayout.cellWidth, height: currentLayout.cellHeight });
      prevLayoutIdRef.current = layoutId;
    }
  }, [currentLayout.id, currentLayout.cellWidth, currentLayout.cellHeight, baseDimensions]);

  // Save Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");

  // Custom Preset Dialog state
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const formattedW = UnitConverter.formatDimension(cellW, currentUnit, 1);
  const formattedH = UnitConverter.formatDimension(cellH, currentUnit, 1);

  const handleSelectTemplate = (tmpl: PreConfiguredTemplate) => {
    const targetLayout = allLayouts.find((l) => l.id === tmpl.layoutId);
    if (targetLayout) {
      updateLayout(targetLayout);
      setSpaceOptimization(tmpl.optimization);
    }
  };

  const handleSliderChange = (newOffset: number) => {
    setScaleOffset(newOffset);
    const baseW = baseDimensions?.width || cellW;
    const baseH = baseDimensions?.height || cellH;

    const scaleFactor = 1 + newOffset / 100;
    const newWidth = Math.max(1, Math.round(baseW * scaleFactor * 10) / 10);
    const newHeight = Math.max(1, Math.round(baseH * scaleFactor * 10) / 10);

    createCustomLayout(newWidth, newHeight);
  };

  const handleResetScale = () => {
    if (baseDimensions) {
      setScaleOffset(0);
      createCustomLayout(baseDimensions.width, baseDimensions.height);
      toast({
        title: "Scale Reset",
        description: `Reset to original dimensions (${UnitConverter.formatDimension(baseDimensions.width, currentUnit, 1)} × ${UnitConverter.formatDimension(baseDimensions.height, currentUnit, 1)})`,
      });
    }
  };

  const handleOpenSaveModal = () => {
    const defaultName =
      currentLayout.name &&
      !currentLayout.id.startsWith("custom") &&
      !currentLayout.id.startsWith("equal_") &&
      !currentLayout.id.startsWith("scaled_")
        ? `${currentLayout.name} (${formattedW} × ${formattedH})`
        : `Custom Cell ${formattedW} × ${formattedH}`;
    setPresetNameInput(defaultName);
    setIsSaveModalOpen(true);
  };

  const handleSavePreset = () => {
    const nameToSave = presetNameInput.trim();
    if (!nameToSave) return;

    const newPreset = presetStore.addCustomLayout({
      name: nameToSave,
      label: nameToSave,
      cellWidth: cellW,
      cellHeight: cellH,
    });

    updateLayout(newPreset);
    setIsSaveModalOpen(false);
    toast({
      title: "Dimension Saved!",
      description: `Saved "${nameToSave}" (${formattedW} × ${formattedH}) to your layout presets.`,
    });
  };

  const handleCustomPresetSave = (data: LayoutData) => {
    createCustomLayout(data.cellWidth, data.cellHeight);
    if (data.saveAsPreset) {
      addCustomLayout({
        name: data.name,
        id: `custom_${Date.now()}`,
        cellWidth: data.cellWidth,
        cellHeight: data.cellHeight,
        label: data.name,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Equal Page Calculator Callout Card */}
      <div className="p-3.5 rounded-xl border border-sidebar-primary/20 bg-sidebar-primary/5 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-1.5">
            <Sparkles className="size-4 text-sidebar-primary" />
            Equal Page Calculator
          </span>
          <Badge
            variant="secondary"
            className="text-[9px] uppercase font-mono tracking-wider font-bold"
          >
            Auto-Fit
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Partition canvas into uniform grid pieces with precise margin math.
        </p>
        <Button
          size="sm"
          onClick={onOpenEqualDivModal}
          className="w-full h-8 text-xs font-semibold rounded-lg gap-2 shadow-2xs"
        >
          <Sparkles className="size-3.5" />
          Open Calculator
        </Button>
      </div>

      <SidebarSeparator />

      {/* 2. Pre-Configured Templates (4 items in 2x2 Grid) */}
      <TemplatePresetGrid
        selectedLayoutId={currentLayout.id}
        onSelectTemplate={handleSelectTemplate}
        unit={currentUnit}
        allLayouts={allLayouts}
        compact
      />

      <SidebarSeparator />

      {/* 3. Photo Size Selector & Dimensions */}
      <div className="flex flex-col gap-3 bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
            <Maximize2 className="size-4 text-primary" />
            Photo Size Selector
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            Fits {maxCells} photos/page
          </span>
        </div>

        {/* Dropdown Selector */}
        <PresetSelector
          items={allLayouts}
          selected={currentLayout}
          onSelect={updateLayout}
          onCustomCreate={() => setIsCustomDialogOpen(true)}
          formatItemLabel={(layout) =>
            `${layout.label} (${UnitConverter.formatDimension(layout.cellWidth, currentUnit, 1)} × ${UnitConverter.formatDimension(layout.cellHeight, currentUnit, 1)})`
          }
          placeholder="Select a photo size..."
          customCreateLabel="Create Custom Size..."
          className="w-full"
        />

        {/* Active Dimensions Display */}
        <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              Cell Dimensions ({currentUnit})
            </span>
            <span className="text-sm font-bold font-mono text-foreground">
              {formattedW} × {formattedH}
            </span>
          </div>
          {currentUnit !== "mm" && (
            <span className="text-[10px] text-muted-foreground font-mono">
              ({cellW} × {cellH} mm)
            </span>
          )}
        </div>
      </div>

      {/* 4. Scale Adjustor (Moved below photo selector!) */}
      <div className="flex flex-col gap-2.5 bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" />
            Scale Adjustment
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
              {scaleOffset > 0 ? `+${scaleOffset}%` : `${scaleOffset}%`}
            </Badge>
            {scaleOffset !== 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetScale}
                className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1"
                title="Reset scale to 0%"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Slider from -5% to +5% */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] font-mono font-semibold text-amber-500">-5%</span>
          <Slider
            value={[scaleOffset]}
            onValueChange={(vals) => {
              const val = Array.isArray(vals) ? vals[0] : vals;
              if (typeof val === "number") handleSliderChange(val);
            }}
            min={-5}
            max={5}
            step={0.5}
            className="flex-1"
          />
          <span className="text-[10px] font-mono font-semibold text-emerald-500">+5%</span>
        </div>

        {/* Quick preset percentage buttons */}
        <div className="flex items-center justify-between pt-0.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSliderChange(-5)}
            className="h-6 px-2 text-[10px] font-mono rounded border-border/60"
          >
            -5% (Shrink)
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSliderChange(0)}
            className="h-6 px-2 text-[10px] font-mono rounded text-muted-foreground hover:text-foreground"
          >
            0% (Center)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSliderChange(5)}
            className="h-6 px-2 text-[10px] font-mono rounded border-border/60"
          >
            +5% (Enlarge)
          </Button>
        </div>
      </div>

      <SidebarSeparator />

      {/* 5. Spacing & Gaps (Moved after size selector & adjustor!) */}
      <GapControls
        rowGap={collageState.rowGap}
        columnGap={collageState.columnGap}
        gapsLinked={collageState.gapsLinked}
        onRowGapChange={setRowGap}
        onColumnGapChange={setColumnGap}
        onLinkedChange={setGapsLinked}
        unit={collageState.selectedUnit}
      />

      <SidebarSeparator />

      {/* 6. Save Current Dimension Option (At the very bottom!) */}
      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <BookmarkPlus className="size-4 text-primary" />
            Custom Presets
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formattedW} × {formattedH}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Save the current cell dimensions to your custom preset library.
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleOpenSaveModal}
          className="w-full h-8 text-xs font-semibold rounded-lg gap-2 shadow-2xs hover:bg-secondary/80"
        >
          <BookmarkPlus className="size-3.5 text-primary" />
          Save Current Dimension
        </Button>
      </div>

      {/* Dialog Modals */}
      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="layout"
        onSave={handleCustomPresetSave}
      />

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <BookmarkPlus className="size-5 text-primary" />
              Save Layout Dimension
            </DialogTitle>
            <DialogDescription className="text-xs">
              Save current cell dimensions to your custom preset library for easy reuse.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <div className="bg-muted/40 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase font-mono">
                Cell Size
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {formattedW} × {formattedH} ({cellW} × {cellH} mm)
              </span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="preset-name" className="text-xs font-semibold">
                Preset Name
              </Label>
              <Input
                id="preset-name"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="e.g. Passport Photo 35x45"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSavePreset();
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSavePreset}>
              Save to Presets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
