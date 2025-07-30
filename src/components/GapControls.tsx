import { useState, useEffect } from "react";
import { Link, Unlink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  // Convert gap values to display unit
  const [displayRowGap, setDisplayRowGap] = useState(
    UnitConverter.convertFromMm(rowGap, unit).toString()
  );
  const [displayColumnGap, setDisplayColumnGap] = useState(
    UnitConverter.convertFromMm(columnGap, unit).toString()
  );

  // Update display values when props change
  useEffect(() => {
    setDisplayRowGap(UnitConverter.convertFromMm(rowGap, unit).toString());
  }, [rowGap, unit]);

  useEffect(() => {
    setDisplayColumnGap(UnitConverter.convertFromMm(columnGap, unit).toString());
  }, [columnGap, unit]);

  const handleRowGapChange = (value: string) => {
    setDisplayRowGap(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      const mmValue = UnitConverter.convertToMm(numValue, unit);
      onRowGapChange(mmValue);
      if (gapsLinked) {
        onColumnGapChange(mmValue);
      }
    }
  };

  const handleColumnGapChange = (value: string) => {
    setDisplayColumnGap(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      const mmValue = UnitConverter.convertToMm(numValue, unit);
      onColumnGapChange(mmValue);
      if (gapsLinked) {
        onRowGapChange(mmValue);
      }
    }
  };

  const handleLinkToggle = () => {
    onLinkedChange(!gapsLinked);
  };

  const getUnitLabel = () => {
    switch (unit) {
      case "mm":
        return "mm";
      case "cm":
        return "cm";
      case "in":
        return "in";
      default:
        return "mm";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Gap Spacing</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLinkToggle}
          className="h-8 w-8 p-0"
          title={gapsLinked ? "Unlink gaps" : "Link gaps"}
        >
          {gapsLinked ? (
            <Link className="h-4 w-4" />
          ) : (
            <Unlink className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="row-gap" className="text-xs text-muted-foreground">
            Row Gap
          </Label>
          <div className="relative">
            <Input
              id="row-gap"
              type="number"
              value={displayRowGap}
              onChange={(e) => handleRowGapChange(e.target.value)}
              min="0"
              step="0.1"
              className="pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {getUnitLabel()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="column-gap" className="text-xs text-muted-foreground">
            Column Gap
          </Label>
          <div className="relative">
            <Input
              id="column-gap"
              type="number"
              value={displayColumnGap}
              onChange={(e) => handleColumnGapChange(e.target.value)}
              min="0"
              step="0.1"
              className="pr-8"
              disabled={gapsLinked}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {getUnitLabel()}
            </span>
          </div>
        </div>
      </div>

      {gapsLinked && (
        <p className="text-xs text-muted-foreground">
          Gaps are linked - changing one will update both
        </p>
      )}
    </div>
  );
}