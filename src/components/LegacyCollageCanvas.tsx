import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CollageState } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";
import { CanvasRenderer } from "@/lib/canvas-renderer";

interface LegacyCollageCanvasProps {
  collageState: CollageState;
  selectedCellId?: string | null;
  onAssignImage: (rowIndex: number, colIndex: number, cellId: string) => void;
}

export const LegacyCollageCanvas = forwardRef<HTMLDivElement, LegacyCollageCanvasProps>(
  ({ collageState, selectedCellId, onAssignImage }, ref) => {
    const {
      pageSize,
      layout,
      cells,
      rows,
      columns,
      selectedUnit,
      rowGap,
      columnGap,
    } = collageState;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = window.devicePixelRatio * 96;

    // Use shared renderer for consistent dimensions
    const canvasDimensions = CanvasRenderer.getCanvasDimensions(pageSize, dpi);
    const cellDimensions = CanvasRenderer.getCellDimensions(
      layout,
      pageSize.margin,
      dpi
    );

    // Render matrix-transformed preview onto high-res canvas
    useEffect(() => {
      if (canvasRef.current) {
        CanvasRenderer.renderToCanvas(collageState, {
          dpi,
          targetCanvas: canvasRef.current,
        });
      }
    }, [collageState, dpi]);

    const handleCellClick = (rowIndex: number, colIndex: number) => {
      const cellObj = cells[rowIndex]?.[colIndex];
      if (cellObj) {
        onAssignImage(rowIndex, colIndex, cellObj.id);
      }
    };

    // Format dimensions according to selected unit
    const formatDimension = (value: number): string => {
      return UnitConverter.formatDimension(value, selectedUnit, 1);
    };

    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 relative">
          <div
            ref={ref}
            className="bg-white shadow-md mx-auto"
            style={{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Native Canvas preview driven by matrix transformation stack */}
            <canvas
              ref={canvasRef}
              style={{
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
                display: "block",
              }}
            />

            {/* Interactive Cell Overlay for clicks */}
            <div className="absolute inset-0">
              {cells.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const hasImage = cell.imageId !== null;
                  const isSelected = selectedCellId === cell.id;

                  const cellPosition = CanvasRenderer.getCellPosition(
                    rowIndex,
                    colIndex,
                    cellDimensions,
                    rowGap,
                    columnGap,
                    dpi
                  );

                  return (
                    <div
                      key={cell.id}
                      className={cn(
                        "absolute cursor-pointer transition-all duration-150 group",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-1 bg-primary/10 z-20 shadow-md"
                          : "hover:bg-primary/5 hover:border hover:border-primary/40",
                        !hasImage && !isSelected && "bg-black/5 flex items-center justify-center"
                      )}
                      style={{
                        width: `${cellPosition.width}px`,
                        height: `${cellPosition.height}px`,
                        left: `${cellPosition.left}px`,
                        top: `${cellPosition.top}px`,
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {!hasImage && (
                        <span className="text-[11px] font-medium text-muted-foreground select-none group-hover:text-primary transition-colors">
                          + Empty Cell
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-2">
          <p>
            {pageSize.label} - {formatDimension(pageSize.width)}×
            {formatDimension(pageSize.height)}(
            {cells.flat().filter((cell) => cell.imageId !== null).length} of{" "}
            {rows * columns} cells filled)
          </p>
          <p className="text-xs mt-1">
            Photo size: {formatDimension(layout.cellWidth)}×
            {formatDimension(layout.cellHeight)}
          </p>
        </div>
      </div>
    );
  }
);

LegacyCollageCanvas.displayName = "LegacyCollageCanvas";
