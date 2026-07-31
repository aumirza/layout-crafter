import { useState, useEffect } from "react";
import { MeasurementUnit, SpaceOptimization } from "@/types/collage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
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
import { Layout, Sparkles, ArrowRight, CheckCircle2, Grid } from "lucide-react";
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
  const [calculatedCells, setCalculatedCells] = useState<number>(0);

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

  // Estimate photo cell capacity
  useEffect(() => {
    if (pageSize && layout) {
      const usableWidth = pageSize.width - pageSize.margin * 2;
      const usableHeight = pageSize.height - pageSize.margin * 2;
      const columns = Math.floor(usableWidth / layout.cellWidth);
      const rows = Math.floor(usableHeight / layout.cellHeight);
      setCalculatedCells(Math.max(1, rows * columns));
    }
  }, [allPageSizes, allLayouts, pageSize, layout]);

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-linear-to-tr from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-sm">
              <Layout className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Setup Layout Studio
            </DialogTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/30 ml-auto">
              Quick Setup
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure canvas paper dimensions and photo layouts or pick a pre-configured template.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Pre-configured templates selector */}
          <div className="bg-muted/30 p-3.5 rounded-xl border border-border/50 space-y-2">
            <TemplatePresetGrid
              selectedLayoutId={layout?.id || ""}
              onSelectTemplate={handleSelectTemplate}
              compact
            />
          </div>

          {/* Unit selector row */}
          <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-border/50">
            <div>
              <Label className="text-xs font-bold text-foreground">Measurement Unit</Label>
              <p className="text-[11px] text-muted-foreground">Dimension display format</p>
            </div>
            <Select
              value={selectedUnit}
              onValueChange={(value: MeasurementUnit) => setSelectedUnit(value)}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs font-medium">
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
              <Label className="text-xs font-bold text-foreground">Paper Size</Label>
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
                className="w-full text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Photo Size</Label>
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
                className="w-full text-xs h-9"
              />
            </div>
          </div>

          {/* Equal Page Division Banner Card */}
          <div className="bg-linear-to-r from-purple-500/10 to-indigo-500/10 p-3 rounded-xl border border-purple-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Grid className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Equal Page Division
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Auto-calculate cell size for 2, 4, 8, 16+ pieces
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEqualDivisionOpen(true)}
              className="h-8 text-xs font-semibold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 gap-1 rounded-lg shrink-0"
            >
              Calculate...
            </Button>
          </div>

          {/* Space optimization switch */}
          <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-border/50">
            <div>
              <Label className="text-xs font-bold text-foreground">Space Optimization</Label>
              <p className="text-[10px] text-muted-foreground">
                {spaceOptimization === "loose"
                  ? "Loose Fit: Consistent orientation"
                  : "Tight Fit: Maximize photo count"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="fit-toggle"
                checked={spaceOptimization === "tight"}
                onCheckedChange={(checked) =>
                  setSpaceOptimization(checked ? "tight" : "loose")
                }
              />
            </div>
          </div>

          {/* Estimation status pill */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Estimated Capacity:</span>
            </div>
            <span className="font-bold text-sm font-mono">{calculatedCells} Photo Cells</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
