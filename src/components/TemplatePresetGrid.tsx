import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PRECONFIGURED_TEMPLATES,
  PreConfiguredTemplate,
} from "@/data/template-presets";
import { UnitConverter } from "@/lib/unit-converter";
import { MeasurementUnit, LayoutPreset } from "@/types/collage";

interface TemplatePresetGridProps {
  selectedLayoutId: string;
  onSelectTemplate: (template: PreConfiguredTemplate) => void;
  unit?: MeasurementUnit;
  allLayouts?: LayoutPreset[];
  compact?: boolean;
  className?: string;
}

export function TemplatePresetGrid({
  selectedLayoutId,
  onSelectTemplate,
  unit = "mm",
  allLayouts = [],
  compact = false,
  className = "",
}: TemplatePresetGridProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          Pre-Configured Templates
        </label>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
          1-Click Apply
        </Badge>
      </div>

      <div className={`grid gap-1.5 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {PRECONFIGURED_TEMPLATES.map((tmpl) => {
          const IconComp = tmpl.icon;
          const isSelected = selectedLayoutId === tmpl.layoutId;

          const targetLayout = allLayouts.find((l) => l.id === tmpl.layoutId);
          let displayDesc = tmpl.desc;
          if (targetLayout && unit !== "mm") {
            const formattedW = UnitConverter.formatDimension(targetLayout.cellWidth, unit, 1);
            const formattedH = UnitConverter.formatDimension(targetLayout.cellHeight, unit, 1);
            displayDesc = `${formattedW} × ${formattedH}`;
          }

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl)}
              className={`p-2.5 rounded-xl text-left transition-all border relative overflow-hidden group ${
                isSelected
                  ? "bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/30"
                  : "bg-card hover:bg-accent/80 border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <IconComp className="h-4 w-4" />
                {isSelected ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  tmpl.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {tmpl.badge}
                    </span>
                  )
                )}
              </div>
              <div className="text-xs font-bold truncate text-foreground">{tmpl.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{displayDesc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
