import { RefObject, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCollage } from "@/context/CollageContext";
import { ImageUploader } from "./ImageUploader";
import { LayoutSelector } from "./LayoutSelector";
import { PageSizeSelector } from "./PageSizeSelector";
import { GapControls } from "./GapControls";
import { ExportPanel } from "./ExportPanel";
import { EqualDivisionModal } from "./EqualDivisionModal";
import { pageSizes } from "@/data/page-sizes";
import { MeasurementUnit, ImageFitOption, CollageCell, ImageOrientation } from "@/types/collage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ImageIcon,
  Grid,
  FileText,
  Layers,
  Download,
  Layout,
  Sparkles,
  RotateCw,
  Scissors,
  Link2,
  Link2Off,
  Trash2,
  CheckCircle2,
  Plus,
  Maximize,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  Square,
  Compass,
  RectangleVertical,
  RectangleHorizontal,
  X,
} from "lucide-react";

export type SidebarTab = "media" | "grid" | "paper" | "cell" | "export";

interface CollageSidebarProps {
  collageRef: RefObject<HTMLDivElement>;
  selectedCellId?: string | null;
  activeTab?: SidebarTab;
  onTabChange?: (tab: SidebarTab) => void;
}

export function CollageSidebar({
  collageRef,
  selectedCellId,
  activeTab: externalTab,
  onTabChange,
}: CollageSidebarProps) {
  const {
    collageState,
    updatePageSize,
    setGapsLinked,
    setUnit,
    setRowGap,
    setColumnGap,
    toggleCuttingMarkers,
    updateImageCount,
    updateCell,
    assignImageToCell,
  } = useCollage();

  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [internalTab, setInternalTab] = useState<SidebarTab>("paper");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const activeTab = externalTab ?? internalTab;

  const setActiveTab = (tab: SidebarTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
    if (isCollapsed) {
      setOpen(true);
    }
  };

  const [showEqualDivModal, setShowEqualDivModal] = useState(false);

  // Auto-switch to cell tab if user selects a cell
  useEffect(() => {
    if (selectedCellId) {
      setActiveTab("cell");
      setIsMobileDrawerOpen(true);
    }
  }, [selectedCellId]);

  // Find selected cell by id or default to cell (0, 0)
  let selectedCellObj: CollageCell | null = null;
  let selectedCellPos: { row: number; col: number } | null = null;

  if (selectedCellId) {
    for (let r = 0; r < collageState.cells.length; r++) {
      for (let c = 0; c < collageState.cells[r].length; c++) {
        const cell = collageState.cells[r][c];
        if (cell.id === selectedCellId) {
          selectedCellObj = cell;
          selectedCellPos = { row: r, col: c };
          break;
        }
      }
      if (selectedCellObj) break;
    }
  }

  if (!selectedCellObj && collageState.cells.length > 0 && collageState.cells[0]?.length > 0) {
    selectedCellObj = collageState.cells[0][0];
    selectedCellPos = { row: 0, col: 0 };
  }

  // Active selected image for the targeted cell
  const activeImage = selectedCellObj?.imageId
    ? collageState.images.find((img) => img.id === selectedCellObj.imageId)
    : null;

  const currentUnit = collageState.selectedUnit || "mm";
  const photoCount = collageState.images?.length || 0;

  const tabItems: {
    id: SidebarTab;
    label: string;
    icon: typeof ImageIcon;
    badge?: number | string;
  }[] = [
    {
      id: "paper",
      label: "Paper Canvas",
      icon: FileText,
      badge: collageState.pageSize?.name,
    },
    {
      id: "media",
      label: "Media Pool",
      icon: ImageIcon,
      badge: photoCount > 0 ? photoCount : undefined,
    },
    { id: "grid", label: "Grid & Spacing", icon: Grid },
    { id: "cell", label: "Cell", icon: Layers },
    { id: "export", label: "Print & Export", icon: Download },
  ];

  const activeTabObj = tabItems.find((t) => t.id === activeTab) || tabItems[0];
  const ActiveIcon = activeTabObj.icon;

  const renderPanelContent = (tab: SidebarTab) => {
    switch (tab) {
      case "media":
        return (
          <div className="flex flex-col gap-4">
            <ImageUploader />
          </div>
        );

      case "grid":
        return (
          <div className="flex flex-col gap-5">
            {/* Equal Division Calculator Callout Card */}
            <div className="p-4 rounded-xl border border-sidebar-primary/20 bg-sidebar-primary/5 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-sidebar-primary" />
                  Equal Page Calculator
                </span>
                <Badge
                  variant="secondary"
                  className="text-[9px] uppercase font-mono tracking-wider font-bold"
                >
                  Auto-Fit
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automatically partition your canvas into uniform grid pieces with precise margin and gap math.
              </p>
              <Button
                size="sm"
                onClick={() => setShowEqualDivModal(true)}
                className="w-full h-8 text-xs font-semibold rounded-lg gap-2 shadow-2xs"
              >
                <Sparkles className="size-3.5" />
                Open Calculator
              </Button>
            </div>

            <SidebarSeparator />

            {/* Layout Templates */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
                  <Grid className="size-4 text-sidebar-primary" />
                  Layout Templates & Ratios
                </span>
              </div>
              <LayoutSelector />
            </div>

            <SidebarSeparator />

            {/* Spacing & Gaps */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-sidebar-foreground">
                  Gap Spacing ({currentUnit})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-sidebar-foreground rounded-lg"
                  onClick={() => setGapsLinked(!collageState.gapsLinked)}
                  title={
                    collageState.gapsLinked
                      ? "Unlink row and column gaps"
                      : "Link row and column gaps"
                  }
                >
                  {collageState.gapsLinked ? (
                    <Link2 className="size-4 text-sidebar-primary" />
                  ) : (
                    <Link2Off className="size-4" />
                  )}
                </Button>
              </div>

              <GapControls
                rowGap={collageState.rowGap}
                columnGap={collageState.columnGap}
                gapsLinked={collageState.gapsLinked}
                onRowGapChange={setRowGap}
                onColumnGapChange={setColumnGap}
                onLinkedChange={setGapsLinked}
                unit={collageState.selectedUnit}
              />
            </div>
          </div>
        );

      case "paper":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
                  <FileText className="size-4 text-sidebar-primary" />
                  Standard Canvas Presets
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-sidebar-border bg-sidebar-accent/30"
                >
                  {collageState.pageSize.width} × {collageState.pageSize.height} mm
                </Badge>
              </div>

              {/* Preset Buttons Grid */}
              <div className="grid grid-cols-2 gap-2">
                {pageSizes.slice(0, 8).map((ps) => {
                  const isSelected = collageState.pageSize.name === ps.name;
                  return (
                    <button
                      key={ps.name}
                      onClick={() => updatePageSize(ps)}
                      className={cn(
                        "p-3 rounded-xl text-left border transition-all flex flex-col gap-0.5",
                        isSelected
                          ? "bg-sidebar-primary/10 border-sidebar-primary text-sidebar-primary font-bold shadow-2xs"
                          : "bg-sidebar-accent/30 hover:bg-sidebar-accent border-sidebar-border text-muted-foreground hover:text-sidebar-foreground"
                      )}
                    >
                      <div className="font-semibold text-xs truncate flex items-center justify-between">
                        <span>{ps.name}</span>
                        {isSelected && (
                          <CheckCircle2 className="size-3 text-sidebar-primary shrink-0 ml-1" />
                        )}
                      </div>
                      <div className="text-[10px] opacity-75 font-mono">
                        {ps.width}×{ps.height} mm
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <SidebarSeparator />

            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-xs text-sidebar-foreground">
                Custom Dimension Selector
              </span>
              <PageSizeSelector />
            </div>
          </div>
        );

      case "cell":
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
                      Fit: {
                        (selectedCellObj.fit || activeImage.fit) === "contain"
                          ? "Fit"
                          : (selectedCellObj.fit || activeImage.fit) === "fill"
                          ? "Stretch"
                          : (selectedCellObj.fit || activeImage.fit) === "original"
                          ? "Original"
                          : "Fill"
                      }
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
                            updateCell(selectedCellObj.id, { fit: item.id as ImageFitOption });
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
                      onClick={() => setActiveTab("media")}
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

      case "export":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-sidebar-foreground flex items-center gap-2">
                  <Download className="size-4 text-sidebar-primary" />
                  Print & Export Options
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/80"
                >
                  300 DPI READY
                </Badge>
              </div>

              <div className="flex items-center justify-between bg-sidebar-accent/30 p-3.5 rounded-xl border border-sidebar-border">
                <span className="text-xs font-medium text-sidebar-foreground flex items-center gap-2">
                  <Scissors className="size-4 text-sidebar-primary" />
                  Print Cutting Guidelines
                </span>
                <input
                  type="checkbox"
                  checked={collageState.showCuttingMarkers}
                  onChange={(e) => toggleCuttingMarkers(e.target.checked)}
                  className="size-4 accent-primary rounded cursor-pointer"
                />
              </div>
            </div>

            <SidebarSeparator />

            <ExportPanel collageRef={collageRef} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md screens and larger) */}
      <Sidebar
        collapsible="none"
        className={cn(
          "hidden md:flex h-screen border-r border-sidebar-border shrink-0 select-none z-20 transition-[width] duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "w-17" : "w-95"
        )}
        style={{ "--sidebar-width": isCollapsed ? "68px" : "380px" } as Record<string, string>}
      >
        <div className="flex h-full w-full overflow-hidden bg-sidebar text-sidebar-foreground">
          {/* LEFT VERTICAL TAB ICON RAIL */}
          <div className="w-17 border-r border-sidebar-border bg-sidebar/80 flex flex-col items-center py-3 gap-3 shrink-0 h-full overflow-hidden">
            {/* HOME BRAND LINK */}
            <Link
              to="/"
              className="size-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-2xs hover:opacity-90 transition-all active:scale-95 shrink-0"
              title="Layout Crafter Home"
            >
              <Layout className="size-5" />
            </Link>

            <SidebarSeparator className="w-8 mx-0 bg-sidebar-border/80 shrink-0" />

            {/* TAB RAIL BUTTONS */}
            <div className="flex-1 flex flex-col gap-1.5 w-full px-2 overflow-y-auto min-h-0 scrollbar-none">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full py-2.5 rounded-xl transition-all group shrink-0",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-2xs border border-sidebar-border"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                    title={tab.label}
                  >
                    <Icon
                      className={cn(
                        "size-5 transition-transform group-hover:scale-105",
                        isActive && "text-sidebar-primary"
                      )}
                    />
                    <span className="text-[10px] mt-1 font-medium leading-none tracking-tight">
                      {tab.label.split(" ")[0]}
                    </span>
                    {tab.badge !== undefined && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-sidebar-primary/15 text-sidebar-primary text-[9px] font-mono font-bold leading-none">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* UNIT SELECTOR PILLS */}
            <div className="flex flex-col items-center p-1 rounded-lg bg-sidebar-accent/60 border border-sidebar-border text-[10px] font-semibold gap-1 shrink-0">
              {(["mm", "cm", "in"] as MeasurementUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={cn(
                    "w-7 py-0.5 rounded transition-all text-center uppercase font-mono text-[10px]",
                    currentUnit === u
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-2xs font-bold"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL CONTENT AREA */}
          <div
            className={cn(
              "flex-1 flex flex-col h-full overflow-hidden bg-sidebar transition-opacity duration-200 min-w-78",
              isCollapsed && "hidden opacity-0 pointer-events-none"
            )}
          >
            {/* PANEL HEADER */}
            <SidebarHeader className="h-14 px-4 border-b border-sidebar-border flex flex-row items-center justify-between bg-sidebar/50 backdrop-blur-xs shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-sidebar-primary/10 flex items-center justify-center">
                  <ActiveIcon className="size-4 text-sidebar-primary" />
                </div>
                <h2 className="text-sm font-semibold text-sidebar-foreground tracking-tight">
                  {activeTabObj.label}
                </h2>
              </div>

              <Badge
                variant="outline"
                className="text-[10px] font-mono py-0.5 px-2.5 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground/75 uppercase tracking-wider"
              >
                {currentUnit} mode
              </Badge>
            </SidebarHeader>

            {/* SCROLLABLE PANEL CONTENT */}
            <SidebarContent className="p-4 gap-5 overflow-y-auto min-h-0 flex-1">
              {renderPanelContent(activeTab)}
            </SidebarContent>
          </div>
        </div>

        <SidebarRail />
      </Sidebar>

      {/* MOBILE BOTTOM NAVIGATION DOCK & DRAWER SHEET (Visible on screens smaller than md) */}
      <div className="block md:hidden">
        {/* MOBILE BACKDROP OVERLAY */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* MOBILE DRAWER SHEET */}
        {isMobileDrawerOpen && (
          <div className="fixed bottom-16 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ease-out text-sidebar-foreground">
            {/* DRAWER HANDLE & HEADER */}
            <div className="pt-2 px-4 pb-3 border-b border-sidebar-border bg-sidebar/90 backdrop-blur-md flex flex-col gap-2 shrink-0">
              <div
                className="w-10 h-1 rounded-full bg-sidebar-border/80 mx-auto mb-1 cursor-pointer"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-sidebar-primary/10 flex items-center justify-center">
                    <ActiveIcon className="size-4 text-sidebar-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-sidebar-foreground tracking-tight">
                    {activeTabObj.label}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Unit selector pills for mobile */}
                  <div className="flex items-center p-0.5 rounded-lg bg-sidebar-accent/60 border border-sidebar-border text-[10px] font-semibold">
                    {(["mm", "cm", "in"] as MeasurementUnit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={cn(
                          "px-2 py-0.5 rounded transition-all text-center uppercase font-mono text-[10px]",
                          currentUnit === u
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-2xs font-bold"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-sidebar-foreground rounded-lg"
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* DRAWER CONTENT */}
            <div className="p-4 overflow-y-auto min-h-0 flex-1 flex flex-col gap-4 pb-8">
              {renderPanelContent(activeTab)}
            </div>
          </div>
        )}

        {/* MOBILE BOTTOM NAVIGATION BAR DOCK */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border h-16 px-1 flex items-center justify-around text-sidebar-foreground shadow-lg pb-safe select-none">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDrawerOpenForThisTab = isMobileDrawerOpen && isActive;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isMobileDrawerOpen && activeTab === tab.id) {
                    setIsMobileDrawerOpen(false);
                  } else {
                    setActiveTab(tab.id);
                    setIsMobileDrawerOpen(true);
                  }
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 group",
                  isDrawerOpenForThisTab
                    ? "text-sidebar-primary font-bold bg-sidebar-primary/10"
                    : isActive
                    ? "text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("size-5 transition-transform group-hover:scale-105", isActive && "text-sidebar-primary")} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-[8px] font-mono font-bold leading-none shadow-2xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium leading-none tracking-tight">
                  {tab.label.split(" ")[0]}
                </span>
                {isDrawerOpenForThisTab && (
                  <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-sidebar-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modal */}
      <EqualDivisionModal
        open={showEqualDivModal}
        onClose={() => setShowEqualDivModal(false)}
        onApply={() => setShowEqualDivModal(false)}
      />
    </>
  );
}


