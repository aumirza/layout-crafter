import { Button } from "./ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MoveHorizontal,
  Maximize2,
} from "lucide-react";
import { useCanvasControlsContext } from "@/context/CanvasControlsContext";

export function CanvasControls() {
  const {
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitToContainer,
  } = useCanvasControlsContext();

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 backdrop-blur-xl bg-card/90 border border-border/70 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 transition-all hover:border-primary/50">
      <div className="flex items-center gap-1 border-r border-border/60 pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-accent"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>

        <span className="text-xs font-mono font-bold w-12 text-center text-primary">
          {zoom.toFixed(0)}%
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-accent"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-accent"
          onClick={handleResetZoom}
          title="Reset Zoom to 100%"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-accent"
          onClick={handleFitToContainer}
          title="Fit to Screen"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 border-l border-border/60 pl-3 text-[11px] text-muted-foreground font-medium">
        <MoveHorizontal className="h-3.5 w-3.5 text-primary" />
        <span>Middle-click or Drag to pan</span>
      </div>
    </div>
  );
}
