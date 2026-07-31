import { RefObject, useEffect, useState } from "react";
import { CollageCanvas } from "./CollageCanvas";
import { useCollage } from "@/context/CollageContext";
import { useCanvasControlsContext } from "@/context/CanvasControlsContext";

interface CanvasContainerProps {
  collageRef: RefObject<HTMLDivElement>;
  selectedCellId?: string | null;
  onSelectCell?: (cellId: string | null) => void;
}

export function CanvasContainer({ collageRef, selectedCellId, onSelectCell }: CanvasContainerProps) {
  const { collageState } = useCollage();
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const {
    canvasContainerRef,
    zoom,
    isDragging,
    dragOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useCanvasControlsContext();

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleWheel(e);
    };

    container.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelEvent);
    };
  }, [handleWheel, canvasContainerRef]);

  const onContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const unit = collageState.selectedUnit || "mm";
  const { width, height } = collageState.pageSize;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-background text-foreground select-none">
      {/* TOP HORIZONTAL RULER */}
      <div className="h-6 w-full bg-muted/80 border-b border-border flex items-center relative overflow-hidden pl-6 z-10 text-[9px] font-mono text-muted-foreground backdrop-blur-xs">
        <div className="flex w-full justify-between px-4">
          <span>0 {unit}</span>
          <span>{Math.round(width * 0.25)} {unit}</span>
          <span>{Math.round(width * 0.5)} {unit}</span>
          <span>{Math.round(width * 0.75)} {unit}</span>
          <span>{width} {unit}</span>
        </div>
        {/* Dynamic Cursor Line X */}
        <div
          className="absolute top-0 bottom-0 w-px bg-primary/80 pointer-events-none transition-none"
          style={{ left: `${cursorPos.x}px` }}
        />
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT VERTICAL RULER */}
        <div className="w-6 bg-muted/80 border-r border-border flex flex-col justify-between py-4 text-[9px] font-mono text-muted-foreground items-center z-10 relative backdrop-blur-xs">
          <span>0</span>
          <span>{Math.round(height * 0.5)}</span>
          <span>{height}</span>
          {/* Dynamic Cursor Line Y */}
          <div
            className="absolute left-0 right-0 h-px bg-primary/80 pointer-events-none transition-none"
            style={{ top: `${cursorPos.y}px` }}
          />
        </div>

        {/* MAIN CANVAS VIEWPORT */}
        <div
          ref={canvasContainerRef}
          className="flex-1 overflow-auto p-8 sm:p-12 flex justify-center items-center active:cursor-grabbing relative select-none bg-background bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px]"
          onMouseDown={handleMouseDown}
          onMouseMove={onContainerMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className=""
            style={{
              transform: `scale(${zoom / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
          >
            <CollageCanvas
              ref={collageRef}
              collageState={collageState}
              selectedCellId={selectedCellId}
              onAssignImage={(row, col, cellId) => {
                if (onSelectCell) onSelectCell(cellId);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
