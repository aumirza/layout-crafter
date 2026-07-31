import { useState, useEffect, useMemo } from "react";
import { MeasurementUnit, SpaceOptimization } from "@/types/collage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PresetSelector } from "@/components/ui/preset-selector";
import { UnitConverter } from "@/lib/unit-converter";
import { Settings } from "@/types/settings";
import {
  CustomPresetDialog,
  type PageSizeData,
  type LayoutData,
} from "@/components/ui/custom-preset-dialog";
import { usePresetStore } from "@/stores/preset-store";
import { useCollage } from "@/context/CollageContext";
import { TemplatePresetGrid } from "@/components/TemplatePresetGrid";
import { PreConfiguredTemplate } from "@/data/template-presets";
import {
  Layout,
  ArrowRight,
  CheckCircle2,
  Grid,
  FileText,
  Image as ImageIcon,
  Ruler,
  Maximize2,
  Minimize2,
  Calculator,
  Sliders,
} from "lucide-react";
import { EqualDivisionModal } from "@/components/EqualDivisionModal";

interface InitialSetupModalProps {
  open: boolean;
  onClose: () => void;
  onApplySettings: (settings: Settings) => void;
}

export function InitialSetupModal({
  open,
  onClose,
  onApplySettings,
}: InitialSetupModalProps) {
  const [spaceOptimization, setSpaceOptimization] =
    useState<SpaceOptimization>("loose");
  const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>("mm");

  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customDialogType, setCustomDialogType] = useState<
    "pageSize" | "layout"
  >("pageSize");
  const [equalDivisionOpen, setEqualDivisionOpen] = useState(false);

  const { updateLayout, updatePageSize, collageState } = useCollage();

  const pageSize = collageState.pageSize;
  const layout = collageState.layout;

  const allPageSizes = usePresetStore((state) => state.getAllPageSizes)();
  const allLayouts = usePresetStore((state) => state.getAllLayouts)();
  const addCustomPageSize = usePresetStore((state) => state.addCustomPageSize);
  const addCustomLayout = usePresetStore((state) => state.addCustomLayout);

  // Estimate grid matrix and cell capacity
  const gridInfo = useMemo(() => {
    if (!pageSize || !layout) {
      return { columns: 0, rows: 0, cells: 0, usableWidth: 0, usableHeight: 0 };
    }
    const usableWidth = Math.max(0, pageSize.width - (pageSize.margin || 0) * 2);
    const usableHeight = Math.max(0, pageSize.height - (pageSize.margin || 0) * 2);
    const columns = Math.max(1, Math.floor(usableWidth / layout.cellWidth));
    const rows = Math.max(1, Math.floor(usableHeight / layout.cellHeight));
    return {
      columns,
      rows,
      cells: columns * rows,
      usableWidth,
      usableHeight,
    };
  }, [pageSize, layout]);

  const handleApply = () => {
    onApplySettings({
      pageSize,
      layout,
      spaceOptimization,
      selectedUnit,
    });
    onClose();
  };

  const handleSelectTemplate = (tmpl: PreConfiguredTemplate) => {
    const targetLayout = allLayouts.find((l) => l.id === tmpl.layoutId);
    if (targetLayout) {
      updateLayout(targetLayout);
      setSpaceOptimization(tmpl.optimization);
    }
  };

  const handleCreateCustomPageSize = () => {
    setCustomDialogType("pageSize");
    setCustomDialogOpen(true);
  };

  const handleCreateCustomLayout = () => {
    setCustomDialogType("layout");
    setCustomDialogOpen(true);
  };

  const handleSaveCustomPreset = (data: PageSizeData | LayoutData) => {
    if (customDialogType === "pageSize") {
      const pageSizeData = data as PageSizeData;
      const newCustomPageSize = addCustomPageSize({
        name: pageSizeData.name,
        label: pageSizeData.name,
        width: pageSizeData.width,
        height: pageSizeData.height,
        margin: pageSizeData.margin,
      });
      updatePageSize(newCustomPageSize);
    } else {
      const layoutData = data as LayoutData;
      const newCustomLayout = addCustomLayout({
        name: layoutData.name,
        label: layoutData.name,
        cellWidth: layoutData.cellWidth,
        cellHeight: layoutData.cellHeight,
      });
      updateLayout(newCustomLayout);
    }
    setCustomDialogOpen(false);
  };

  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Layout className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Setup Studio Workspace
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/30 ml-auto">
              Quick Setup
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure paper size, unit formats, and photo layouts or pick a pre-configured template to start creating immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Pre-configured templates selector */}
          <div className="bg-card p-3 rounded-xl border border-border/60 shadow-2xs">
            <TemplatePresetGrid
              selectedLayoutId={layout?.id || ""}
              onSelectTemplate={handleSelectTemplate}
              compact
            />
          </div>

          {/* Unit & Presets Section */}
          <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-primary" />
                Measurement Unit
              </span>
              <Select
                value={selectedUnit}
                onValueChange={(value: MeasurementUnit) => setSelectedUnit(value)}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs font-medium bg-background">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm">mm (Millimeter)</SelectItem>
                  <SelectItem value="cm">cm (Centimeter)</SelectItem>
                  <SelectItem value="in">in (Inches)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page size & Photo size grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Paper Size
                </Label>
                <PresetSelector
                  items={allPageSizes}
                  selected={pageSize}
                  onSelect={updatePageSize}
                  onCustomCreate={handleCreateCustomPageSize}
                  formatItemLabel={(size) =>
                    `${size.label} (${formatDimension(size.width)}×${formatDimension(size.height)})`
                  }
                  placeholder="Select page size"
                  customCreateLabel="Custom Size..."
                  className="w-full text-xs h-9 bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Photo Cell Size
                </Label>
                <PresetSelector
                  items={allLayouts}
                  selected={layout}
                  onSelect={updateLayout}
                  onCustomCreate={handleCreateCustomLayout}
                  formatItemLabel={(l) =>
                    `${l.label} (${formatDimension(l.cellWidth)}×${formatDimension(l.cellHeight)})`
                  }
                  placeholder="Select photo size"
                  customCreateLabel="Custom Photo..."
                  className="w-full text-xs h-9 bg-background"
                />
              </div>
            </div>
          </div>

          {/* Equal Page Division Banner Card */}
          <div className="bg-accent/40 hover:bg-accent/60 p-3 rounded-xl border border-border/60 flex items-center justify-between transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5 text-primary" />
                Equal Page Division Calculator
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Auto-calculate cell dimensions for 2, 4, 8, 16+ pieces
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEqualDivisionOpen(true)}
              className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 gap-1 rounded-lg shrink-0"
            >
              Calculate...
            </Button>
          </div>

          {/* Space Optimization Segmented Selector */}
          <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" />
                Space Optimization Strategy
              </Label>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {spaceOptimization === "loose" ? "Standard Layout" : "Maximum Capacity"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => setSpaceOptimization("loose")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  spaceOptimization === "loose"
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Minimize2 className="h-3.5 w-3.5 text-primary" />
                <span>Loose Fit</span>
              </button>
              <button
                type="button"
                onClick={() => setSpaceOptimization("tight")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  spaceOptimization === "tight"
                    ? "bg-background text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                <span>Tight Fit</span>
              </button>
            </div>
          </div>

          {/* Live Miniature Visual Canvas Preview & Capacity Summary Card */}
          <div className="bg-muted/30 border border-border/60 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-foreground">Calculated Grid Summary</span>
              </div>
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold px-2.5 py-0.5">
                {gridInfo.cells} Photo Cells
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* SVG Live Preview Box */}
              <div className="bg-background/90 rounded-lg p-2.5 border border-border/40 flex items-center justify-center min-h-[110px]">
                <svg
                  viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
                  className="max-h-[100px] w-auto drop-shadow-xs border border-border/60 bg-card rounded transition-all"
                  style={{
                    aspectRatio: `${pageSize.width} / ${pageSize.height}`,
                  }}
                >
                  <rect
                    x={0}
                    y={0}
                    width={pageSize.width}
                    height={pageSize.height}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground/30"
                  />
                  {pageSize.margin > 0 && (
                    <rect
                      x={pageSize.margin}
                      y={pageSize.margin}
                      width={gridInfo.usableWidth}
                      height={gridInfo.usableHeight}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.75"
                      strokeDasharray="2 2"
                      className="text-primary/40"
                    />
                  )}
                  {Array.from({ length: Math.min(gridInfo.rows, 12) }).map((_, r) =>
                    Array.from({ length: Math.min(gridInfo.columns, 12) }).map((_, c) => {
                      const gap = 1;
                      const x = pageSize.margin + c * (layout.cellWidth + gap);
                      const y = pageSize.margin + r * (layout.cellHeight + gap);
                      return (
                        <rect
                          key={`${r}-${c}`}
                          x={x}
                          y={y}
                          width={layout.cellWidth}
                          height={layout.cellHeight}
                          className="fill-primary/15 stroke-primary/80"
                          strokeWidth="0.75"
                          rx="1"
                        />
                      );
                    })
                  )}
                </svg>
              </div>

              {/* Grid Specifications List */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Paper Size</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatDimension(pageSize.width)} × {formatDimension(pageSize.height)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Photo Cell</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatDimension(layout.cellWidth)} × {formatDimension(layout.cellHeight)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Grid Matrix</span>
                  <span className="font-semibold text-foreground font-mono">
                    {gridInfo.columns} cols × {gridInfo.rows} rows
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Page Margin</span>
                  <span className="font-semibold text-foreground font-mono">
                    {formatDimension(pageSize.margin)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40 mt-1">
          <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs">
            Skip Setup
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
          >
            Start Creating in Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>

      <CustomPresetDialog
        open={customDialogOpen}
        onClose={() => setCustomDialogOpen(false)}
        type={customDialogType}
        onSave={handleSaveCustomPreset}
      />

      <EqualDivisionModal
        open={equalDivisionOpen}
        onClose={() => setEqualDivisionOpen(false)}
      />
    </Dialog>
  );
}

