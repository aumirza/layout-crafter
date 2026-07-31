import { forwardRef } from "react";
import { CollageState } from "@/types/collage";
import { KonvaCollageCanvas } from "./KonvaCollageCanvas";
import { LegacyCollageCanvas } from "./LegacyCollageCanvas";
import { useCollage } from "@/context/CollageContext";

interface CollageCanvasProps {
  collageState: CollageState;
  selectedCellId?: string | null;
  onAssignImage: (rowIndex: number, colIndex: number, cellId: string) => void;
  forceEngine?: "konva" | "legacy";
}

export const CollageCanvas = forwardRef<HTMLDivElement, CollageCanvasProps>(
  ({ collageState, selectedCellId, onAssignImage, forceEngine }, ref) => {
    const { updateCell } = useCollage();
    const useKonva = forceEngine
      ? forceEngine === "konva"
      : collageState.useKonvaCanvas !== false;

    if (!useKonva) {
      return (
        <LegacyCollageCanvas
          ref={ref}
          collageState={collageState}
          selectedCellId={selectedCellId}
          onAssignImage={onAssignImage}
        />
      );
    }

    return (
      <KonvaCollageCanvas
        ref={ref}
        collageState={collageState}
        selectedCellId={selectedCellId}
        onAssignImage={onAssignImage}
        onUpdateCellTransform={(cellId, transform) => {
          updateCell(cellId, { transform });
        }}
      />
    );
  }
);

CollageCanvas.displayName = "CollageCanvas";

