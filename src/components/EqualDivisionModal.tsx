import { useState, useMemo, useEffect } from "react";
import { useCollage } from "@/context/CollageContext";
import { usePresetStore } from "@/stores/preset-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PresetSelector } from "@/components/ui/preset-selector";
import {
  calculateEqualDivision,
  COMMON_PIECE_OPTIONS,
  getGridForPieces,
} from "@/lib/equal-division";
import { Grid, Sparkles, ArrowRight, Layers, LayoutGrid } from "lucide-react";
import { UnitConverter } from "@/lib/unit-converter";
import { PageSize } from "@/types/collage";

interface EqualDivisionModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: () => void;
}

export function EqualDivisionModal({
  open,
  onClose,
  onApply,
}: EqualDivisionModalProps) {
  const { collageState, applyEqualDivision, updatePageSize } = useCollage();
  const allPageSizes = usePresetStore((state) => state.getAllPageSizes)();

  const [selectedPageSize, setSelectedPageSize] = useState<PageSize>(
    collageState.pageSize
  );
  const [selectedPieces, setSelectedPieces] = useState<number>(4);
  const [customCols, setCustomCols] = useState<number>(2);
  const [customRows, setCustomRows] = useState<number>(2);
  const [isCustomGrid, setIsCustomGrid] = useState<boolean>(false);
  const [margin, setMargin] = useState<number>(
    collageState.pageSize.margin || 10
  );
  const [gap, setGap] = useState<number>(collageState.rowGap || 2);

  // Keep state synced with current collage state when opened
  useEffect(() => {
    if (open) {
      setSelectedPageSize(collageState.pageSize);
      setMargin(collageState.pageSize.margin || 10);
      setGap(collageState.rowGap || 2);
    }
  }, [open, collageState.pageSize, collageState.rowGap]);

  // Update cols/rows when piece preset selected
  const handlePieceSelect = (pieces: number) => {
    setSelectedPieces(pieces);
    setIsCustomGrid(false);
    const grid = getGridForPieces(
      pieces,
      selectedPageSize.width,
      selectedPageSize.height
    );
    setCustomCols(grid.columns);
    setCustomRows(grid.rows);
  };

  const columns = isCustomGrid ? Math.max(1, customCols) : customCols;
  const rows = isCustomGrid ? Math.max(1, customRows) : customRows;

  // Calculate live division result
  const division = useMemo(() => {
    return calculateEqualDivision(
      {
        pageSize: selectedPageSize,
        columns,
        rows,
        margin,
        rowGap: gap,
        columnGap: gap,
      },
      collageState.selectedUnit
    );
  }, [
    selectedPageSize,
    columns,
    rows,
    margin,
    gap,
    collageState.selectedUnit,
  ]);

  const handleApply = () => {
    if (selectedPageSize.id !== collageState.pageSize.id) {
      updatePageSize({ ...selectedPageSize, margin });
    }
    applyEqualDivision(columns, rows, margin, gap, gap);
    if (onApply) onApply();
    onClose();
  };

  const formatDimension = (mmValue: number) => {
    return UnitConverter.formatDimension(mmValue, collageState.selectedUnit, 1);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Grid className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Equal Page Division Calculator
            </DialogTitle>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-semibold text-purple-600 border-purple-500/30 ml-auto"
            >
              Auto Calculate
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Split paper into equal pieces. Photo cell dimensions are automatically calculated after accounting for margins and gaps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Paper Size selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex justify-between">
              <span>Target Paper Size</span>
              <span className="text-muted-foreground font-normal">
                {formatDimension(selectedPageSize.width)} ×{" "}
                {formatDimension(selectedPageSize.height)}
              </span>
            </Label>
            <PresetSelector
              items={allPageSizes}
              selected={selectedPageSize}
              onSelect={(size) => {
                setSelectedPageSize(size);
                const grid = getGridForPieces(selectedPieces, size.width, size.height);
                setCustomCols(grid.columns);
                setCustomRows(grid.rows);
              }}
              formatItemLabel={(size) =>
                `${size.label} (${formatDimension(size.width)}×${formatDimension(size.height)})`
              }
              placeholder="Select paper size"
              className="w-full text-xs h-9"
            />
          </div>

          {/* Piece Options Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground">
                Number of Pieces / Grid Split
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] px-2 text-primary font-medium"
                onClick={() => setIsCustomGrid(!isCustomGrid)}
              >
                {isCustomGrid ? "Use Presets" : "Custom Grid (C×R)"}
              </Button>
            </div>

            {!isCustomGrid ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {COMMON_PIECE_OPTIONS.map((opt) => {
                  const isSelected =
                    !isCustomGrid && selectedPieces === opt.pieces;
                  return (
                    <button
                      key={opt.pieces}
                      type="button"
                      onClick={() => handlePieceSelect(opt.pieces)}
                      className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between h-16 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border/60 bg-card hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-extrabold font-mono">
                          {opt.pieces} Pcs
                        </span>
                        {opt.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-600 font-medium">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {opt.columns}×{opt.rows} Grid
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Columns (Width)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={customCols}
                    onChange={(e) =>
                      setCustomCols(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Rows (Height)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={customRows}
                    onChange={(e) =>
                      setCustomRows(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Margins & Gaps Controls */}
          <div className="grid grid-cols-2 gap-3 bg-card p-3 rounded-xl border border-border/50">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Page Margin (mm)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={margin}
                  onChange={(e) =>
                    setMargin(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Cell Gap (mm)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={gap}
                  onChange={(e) =>
                    setGap(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Result Card & Visual Grid Preview */}
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                  Calculated Photo Cell Size
                </span>
                <div className="text-lg font-extrabold font-mono text-foreground tracking-tight">
                  {division.formattedCellSizeLabel}
                </div>
              </div>

              <Badge className="bg-purple-600 text-white font-mono text-xs px-2.5 py-1">
                {division.totalPieces} Cells
              </Badge>
            </div>

            {/* SVG Visual Layout Diagram */}
            <div className="relative bg-background/80 rounded-lg p-3 border border-border/40 flex items-center justify-center min-h-[120px]">
              <svg
                viewBox={`0 0 ${selectedPageSize.width} ${selectedPageSize.height}`}
                className="max-h-[110px] w-auto drop-shadow-sm border border-muted-foreground/30 bg-card rounded"
                style={{
                  aspectRatio: `${selectedPageSize.width} / ${selectedPageSize.height}`,
                }}
              >
                {/* Usable Area Border */}
                <rect
                  x={margin}
                  y={margin}
                  width={selectedPageSize.width - margin * 2}
                  height={selectedPageSize.height - margin * 2}
                  fill="none"
                  stroke="rgba(147, 51, 234, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Draw Grid Cells */}
                {Array.from({ length: rows }).map((_, r) =>
                  Array.from({ length: columns }).map((_, c) => {
                    const x = margin + c * (division.cellWidth + gap);
                    const y = margin + r * (division.cellHeight + gap);
                    return (
                      <g key={`${r}-${c}`}>
                        <rect
                          x={x}
                          y={y}
                          width={division.cellWidth}
                          height={division.cellHeight}
                          fill="rgba(99, 102, 241, 0.15)"
                          stroke="rgb(99, 102, 241)"
                          strokeWidth="1"
                          rx="1"
                        />
                      </g>
                    );
                  })
                )}
              </svg>
            </div>

            <div className="text-[11px] text-muted-foreground flex justify-between">
              <span>
                Grid: {columns} cols × {rows} rows
              </span>
              <span>
                Usable Area: {formatDimension(division.usableWidth)} ×{" "}
                {formatDimension(division.usableHeight)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-xl text-xs font-bold gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
          >
            Apply Equal Division
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
