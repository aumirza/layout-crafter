import { useCollage } from "@/context/CollageContext";
import { CollageCell, ImageFitOption, ImageOrientation } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Layers,
  Trash2,
  Maximize,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  Square,
  RotateCw,
  Compass,
  RectangleVertical,
  RectangleHorizontal,
  ImageIcon,
  Plus,
} from "lucide-react";

interface CellTabPanelProps {
  selectedCellObj: CollageCell | null;
  selectedCellPos: { row: number; col: number } | null;
  onSwitchToMediaTab: () => void;
}

export function CellTabPanel({
  selectedCellObj,
  selectedCellPos,
  onSwitchToMediaTab,
}: CellTabPanelProps) {
  const { collageState, updateImageCount, updateCell, assignImageToCell } =
    useCollage();

  // Active selected image for the targeted cell
  const activeImage = selectedCellObj?.imageId
    ? collageState.images.find((img) => img.id === selectedCellObj.imageId)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
          <Layers className="size-4 text-sidebar-primary" />
          Cell Properties Inspector
        </span>
        {selectedCellPos && (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-sidebar-border bg-sidebar-accent/50 text-sidebar-primary font-bold"
          >
            Cell ({selectedCellPos.row + 1}, {selectedCellPos.col + 1})
          </Badge>
        )}
      </div>

      {activeImage && selectedCellObj ? (
        <div className="bg-sidebar-accent/30 p-4 rounded-xl border border-sidebar-border flex flex-col gap-4 shadow-2xs">
          {/* PHOTO CELL SUMMARY CARD */}
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-lg overflow-hidden border border-sidebar-border bg-background shrink-0 shadow-2xs relative">
              <img
                src={activeImage.src}
                alt={activeImage.name}
                className="size-full object-cover"
              />
            </div>
            <div className="overflow-hidden flex-1 flex flex-col gap-1">
              <p className="font-semibold text-xs truncate text-sidebar-foreground">
                {activeImage.name}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-mono">
                Fit:{" "}
                {(selectedCellObj.fit || activeImage.fit) === "contain"
                  ? "Fit"
                  : (selectedCellObj.fit || activeImage.fit) === "fill"
                  ? "Stretch"
                  : (selectedCellObj.fit || activeImage.fit) === "original"
                  ? "Original"
                  : "Fill"}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <Label className="text-[10px] text-muted-foreground">
                  Global Count:
                </Label>
                <input
                  type="number"
                  min="0"
                  value={activeImage.count || 1}
                  onChange={(e) =>
                    updateImageCount(
                      activeImage.id,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-14 h-6 px-2 text-[11px] font-mono font-bold bg-background border border-sidebar-border rounded-md text-sidebar-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive shrink-0 rounded-lg"
              onClick={() => {
                if (selectedCellPos) {
                  assignImageToCell(selectedCellPos.row, selectedCellPos.col, "");
                }
              }}
              title="Clear photo from this cell"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Per-Cell Fitting Mode Switcher */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Maximize className="size-3.5 text-sidebar-primary" />
                Fitting Mode (This Cell Only)
              </Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "cover", label: "Fill", icon: Maximize2 },
                { id: "contain", label: "Fit", icon: Minimize2 },
                { id: "fill", label: "Stretch", icon: StretchHorizontal },
                { id: "original", label: "Original", icon: Square },
              ].map((item) => {
                const ModeIcon = item.icon;
                const isSelected =
                  (selectedCellObj?.fit || activeImage.fit || "cover") === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      updateCell(selectedCellObj.id, {
                        fit: item.id as ImageFitOption,
                      });
                    }}
                    className={cn(
                      "py-1.5 px-1.5 text-[10px] font-semibold capitalize rounded-lg border transition-all flex items-center justify-center gap-1.5",
                      isSelected
                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-2xs font-bold"
                        : "bg-background hover:bg-sidebar-accent border-sidebar-border text-muted-foreground"
                    )}
                  >
                    <ModeIcon className="size-3 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-Cell Orientation Selector */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <RotateCw className="size-3.5 text-sidebar-primary" />
              Cell Orientation
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "auto", label: "Auto", icon: Compass },
                { id: "portrait", label: "Portrait", icon: RectangleVertical },
                { id: "landscape", label: "Landscape", icon: RectangleHorizontal },
              ].map((o) => {
                const OIcon = o.icon;
                const currentOrientation =
                  selectedCellObj?.orientation ||
                  activeImage?.orientation ||
                  "auto";
                const isSelected = currentOrientation === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      updateCell(selectedCellObj.id, {
                        orientation: o.id as ImageOrientation,
                      });
                    }}
                    className={cn(
                      "py-1.5 px-1.5 text-[10px] font-semibold capitalize rounded-lg border transition-all flex items-center justify-center gap-1.5",
                      isSelected
                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-2xs font-bold"
                        : "bg-background hover:bg-sidebar-accent border-sidebar-border text-muted-foreground"
                    )}
                  >
                    <OIcon className="size-3 shrink-0" />
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swap Photo for this cell */}
          <div className="flex flex-col gap-2 pt-2 border-t border-sidebar-border/60">
            <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-sidebar-primary" />
              Swap Cell Photo
            </Label>
            {collageState.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 rounded-lg border border-sidebar-border bg-background">
                {collageState.images.map((img) => {
                  const isCurrent = img.id === activeImage.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => {
                        if (selectedCellPos) {
                          assignImageToCell(
                            selectedCellPos.row,
                            selectedCellPos.col,
                            img.id
                          );
                        }
                      }}
                      className={cn(
                        "aspect-square rounded-md overflow-hidden border transition-all relative group",
                        isCurrent
                          ? "ring-2 ring-sidebar-primary border-sidebar-primary"
                          : "border-sidebar-border hover:border-sidebar-primary/60"
                      )}
                      title={img.name}
                    >
                      <img
                        src={img.src}
                        alt={img.name}
                        className="size-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                No other images available in media pool.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent/20 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground shrink-0">
              <Layers className="size-5" />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-sidebar-foreground">
                Cell ({selectedCellPos ? selectedCellPos.row + 1 : 1},{" "}
                {selectedCellPos ? selectedCellPos.col + 1 : 1}) is Empty
              </p>
              <p className="text-[11px] text-muted-foreground">
                Assign a photo to fill this canvas cell.
              </p>
            </div>
          </div>

          <SidebarSeparator />

          {collageState.images.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-sidebar-foreground">
                Select Photo to Assign
              </Label>
              <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {collageState.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      if (selectedCellPos) {
                        assignImageToCell(
                          selectedCellPos.row,
                          selectedCellPos.col,
                          img.id
                        );
                      }
                    }}
                    className="group relative rounded-xl overflow-hidden border border-sidebar-border bg-background aspect-square hover:border-sidebar-primary hover:shadow-2xs transition-all flex flex-col"
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-sidebar-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold bg-sidebar-primary text-sidebar-primary-foreground px-2 py-0.5 rounded-full shadow-2xs">
                        Assign
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 flex flex-col items-center gap-2">
              <ImageIcon className="size-8 text-muted-foreground/60" />
              <p className="text-xs font-semibold text-sidebar-foreground">
                Media pool is empty
              </p>
              <p className="text-[11px] text-muted-foreground">
                Upload photos in the Media Pool tab first to populate your layout.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onSwitchToMediaTab}
                className="mt-1 text-xs gap-1.5"
              >
                <Plus className="size-3.5" />
                Upload Media
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
