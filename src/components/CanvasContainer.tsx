import { RefObject, useEffect } from "react";
import { CollageCanvas } from "./CollageCanvas";
import { useCollage } from "@/context/CollageContext";
import { useCanvasControlsContext } from "@/context/CanvasControlsContext";

interface CanvasContainerProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CanvasContainer({ collageRef }: CanvasContainerProps) {
  const { collageState, assignImageToCell } = useCollage();

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

  return (
    <div
      ref={canvasContainerRef}
      className="flex-1 overflow-auto p-8 sm:p-12 flex justify-center items-center active:cursor-grabbing relative select-none bg-muted/30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-size-[20px_20px]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="shadow-2xl rounded-sm transition-shadow hover:shadow-primary/10"
        style={{
          transform: `scale(${zoom / 100}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
      >
        <CollageCanvas
          ref={collageRef}
          collageState={collageState}
          onAssignImage={assignImageToCell}
        />
      </div>
    </div>
  );
}
