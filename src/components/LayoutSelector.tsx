import { useState, useEffect, useMemo } from "react";
import { LayoutPreset } from "@/types/collage";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UnitConverter } from "@/lib/unit-converter";
import { PresetSelector } from "@/components/ui/preset-selector";
import {
  CustomPresetDialog,
  LayoutData,
} from "@/components/ui/custom-preset-dialog";
import { EqualDivisionModal } from "@/components/EqualDivisionModal";
import { usePresetStore } from "@/stores/preset-store";
import { useCollage } from "@/context/CollageContext";
import { layoutPresets } from "@/data/layout-presets";
import { TemplatePresetGrid } from "@/components/TemplatePresetGrid";
import { PreConfiguredTemplate } from "@/data/template-presets";
import { Grid, Sparkles } from "lucide-react";

export function LayoutSelector() {
  const {
    collageState,
    updateLayout,
    createCustomLayout,
    setSpaceOptimization,
  } = useCollage();

  const {
    layout: selectedLayout,
    selectedUnit,
    spaceOptimization,
  } = collageState;

  const maxCells = useMemo(
    () => collageState.rows * collageState.columns,
    [collageState.rows, collageState.columns]
  );

  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [isEqualDivisionOpen, setIsEqualDivisionOpen] = useState(false);
  const presetStore = usePresetStore();
  const [allLayouts, setAllLayouts] = useState<LayoutPreset[]>(layoutPresets);

  useEffect(() => {
    setAllLayouts(presetStore.getAllLayouts());
  }, [presetStore]);

  const formatDimension = (value: number): string => {
    return UnitConverter.formatDimension(value, selectedUnit, 1);
  };

  const handleCustomPresetSave = (data: LayoutData) => {
    createCustomLayout(data.cellWidth, data.cellHeight);

    if (data.saveAsPreset) {
      presetStore.addCustomLayout({
        name: data.name,
        id: `custom_${Date.now()}`,
        cellWidth: data.cellWidth,
        cellHeight: data.cellHeight,
        label: data.name,
      });

      setAllLayouts(presetStore.getAllLayouts());
    }
  };

  const handleSelectTemplate = (tmpl: PreConfiguredTemplate) => {
    const targetLayout = allLayouts.find((l) => l.id === tmpl.layoutId);
    if (targetLayout) {
      updateLayout(targetLayout);
      setSpaceOptimization(tmpl.optimization);
    }
  };

  return (
    <div className="space-y-4">
      {/* Equal Page Division Action Banner */}
      <div className="bg-linear-to-r from-purple-500/10 to-indigo-500/10 p-3 rounded-xl border border-purple-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-xs">
            <Grid className="h-4 w-4" />
            <span>Equal Page Division</span>
          </div>
          <span className="text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono px-1.5 py-0.5 rounded font-semibold">
            Auto Fit
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Divide paper into 2, 4, 8, 16 equal pieces with margin & gap calculation.
        </p>
        <Button
          onClick={() => setIsEqualDivisionOpen(true)}
          className="w-full h-8 text-xs font-bold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg gap-1.5 shadow-sm"
        >
          <Grid className="h-3.5 w-3.5" />
          Divide Page into Pieces...
        </Button>
      </div>

      <hr className="border-border/40" />

      {/* Reusable Pre-Configured Templates Component */}
      <TemplatePresetGrid
        selectedLayoutId={selectedLayout.id}
        onSelectTemplate={handleSelectTemplate}
        compact
      />

      <hr className="border-border/40" />

      {/* Custom Cell Photo Size */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-foreground">Custom Cell Photo Size</h3>

        <PresetSelector
          items={allLayouts}
          selected={selectedLayout}
          onSelect={updateLayout}
          onCustomCreate={() => setIsCustomDialogOpen(true)}
          formatItemLabel={(layout) =>
            `${layout.label} (${formatDimension(
              layout.cellWidth
            )} x ${formatDimension(layout.cellHeight)})`
          }
          placeholder="Select a photo size"
          customCreateLabel="Create Custom Size..."
          className="w-full"
        />

        <div className="space-y-2.5 pt-2">
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Cell size:</span>
            <span className="font-mono text-foreground font-semibold">
              {formatDimension(selectedLayout.cellWidth)} × {formatDimension(selectedLayout.cellHeight)}
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-muted/30 p-2.5 rounded-xl border border-border/40">
            <Switch
              id="space-optimization"
              checked={spaceOptimization === "tight"}
              onCheckedChange={(checked) =>
                setSpaceOptimization(checked ? "tight" : "loose")
              }
            />
            <Label htmlFor="space-optimization" className="text-xs cursor-pointer">
              <span className="font-semibold block text-foreground">Tight Space Optimization</span>
              <span className="text-[10px] text-muted-foreground block">
                {spaceOptimization === "tight"
                  ? "Packs maximum photos per page"
                  : "Preserves consistent layout orientation"}
              </span>
            </Label>
          </div>

          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl text-center border border-emerald-500/20">
            Fits up to <span className="font-bold">{maxCells}</span> photos per page
          </div>
        </div>
      </div>

      <CustomPresetDialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        type="layout"
        onSave={handleCustomPresetSave}
      />

      <EqualDivisionModal
        open={isEqualDivisionOpen}
        onClose={() => setIsEqualDivisionOpen(false)}
      />
    </div>
  );
}

