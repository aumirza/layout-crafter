import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link2, Link2Off } from "lucide-react";
import { MeasurementUnit } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";

interface GapControlsProps {
  rowGap: number;
  columnGap: number;
  gapsLinked: boolean;
  onRowGapChange: (value: number) => void;
  onColumnGapChange: (value: number) => void;
  onLinkedChange: (linked: boolean) => void;
  unit: MeasurementUnit;
}

export function GapControls({
  rowGap,
  columnGap,
  gapsLinked,
  onRowGapChange,
  onColumnGapChange,
  onLinkedChange,
  unit,
}: GapControlsProps) {
  const formattedRow = UnitConverter.formatDimension(rowGap, unit, 1);
  const formattedCol = UnitConverter.formatDimension(columnGap, unit, 1);

  const handleRowSliderChange = (vals: number[] | number) => {
    const val = Array.isArray(vals) ? vals[0] : vals;
    if (typeof val === "number" && !isNaN(val)) {
      onRowGapChange(val);
      if (gapsLinked) {
        onColumnGapChange(val);
      }
    }
  };

  const handleColumnSliderChange = (vals: number[] | number) => {
    const val = Array.isArray(vals) ? vals[0] : vals;
    if (typeof val === "number" && !isNaN(val)) {
      onColumnGapChange(val);
      if (gapsLinked) {
        onRowGapChange(val);
      }
    }
  };

  const setBothGaps = (valMm: number) => {
    onRowGapChange(valMm);
    onColumnGapChange(valMm);
  };

  return (
    <div className="space-y-3.5 bg-card/60 border border-border/60 p-3.5 rounded-xl shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          Grid Spacing & Gaps
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLinkedChange(!gapsLinked)}
          className="h-7 px-2 text-[11px] font-semibold gap-1.5 border-border/60"
          title={gapsLinked ? "Unlink row & column gaps" : "Link row & column gaps"}
        >
          {gapsLinked ? (
            <>
              <Link2 className="size-3.5 text-primary" />
              <span>Linked</span>
            </>
          ) : (
            <>
              <Link2Off className="size-3.5 text-muted-foreground" />
              <span>Unlinked</span>
            </>
          )}
        </Button>
      </div>

      {gapsLinked ? (
        <div className="space-y-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-[11px] font-medium text-foreground">Gap Size</Label>
            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
              {formattedRow} {unit}
            </Badge>
          </div>
          <Slider
            value={[rowGap]}
            onValueChange={handleRowSliderChange}
            min={0}
            max={30}
            step={0.5}
            className="py-1"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-xs">
              <Label className="text-[11px] font-medium text-foreground">Row Gap</Label>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                {formattedRow} {unit}
              </Badge>
            </div>
            <Slider
              value={[rowGap]}
              onValueChange={handleRowSliderChange}
              min={0}
              max={30}
              step={0.5}
              className="py-1"
            />
          </div>

          <div className="space-y-2 bg-muted/20 p-2.5 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-xs">
              <Label className="text-[11px] font-medium text-foreground">Column Gap</Label>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                {formattedCol} {unit}
              </Badge>
            </div>
            <Slider
              value={[columnGap]}
              onValueChange={handleColumnSliderChange}
              min={0}
              max={30}
              step={0.5}
              className="py-1"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-muted-foreground font-mono">Quick:</span>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBothGaps(0)}
            className="h-5 px-2 text-[10px] font-mono rounded border-border/60"
          >
            {UnitConverter.formatDimension(0, unit, 1)} (Seamless)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBothGaps(2)}
            className="h-5 px-2 text-[10px] font-mono rounded border-border/60"
          >
            {UnitConverter.formatDimension(2, unit, 1)} (Standard)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBothGaps(5)}
            className="h-5 px-2 text-[10px] font-mono rounded border-border/60"
          >
            {UnitConverter.formatDimension(5, unit, 1)} (Wide)
          </Button>
        </div>
      </div>
    </div>
  );
}