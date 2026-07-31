import { RefObject, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCollage } from "@/context/CollageContext";
import { PaperTabPanel } from "./sidebar/PaperTabPanel";
import { MediaTabPanel } from "./sidebar/MediaTabPanel";
import { GridTabPanel } from "./sidebar/GridTabPanel";
import { CellTabPanel } from "./sidebar/CellTabPanel";
import { ExportTabPanel } from "./sidebar/ExportTabPanel";
import { EqualDivisionModal } from "./EqualDivisionModal";
import { MeasurementUnit, CollageCell } from "@/types/collage";
import { Button } from "@/components/ui/button";
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
  const { collageState, setUnit } = useCollage();
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
      { id: "grid", label: "Grid & Spacing", icon: Grid },
      {
        id: "media",
        label: "Media Pool",
        icon: ImageIcon,
        badge: photoCount > 0 ? photoCount : undefined,
      },
      { id: "cell", label: "Cell", icon: Layers },
      { id: "export", label: "Print & Export", icon: Download },
    ];

  const activeTabObj = tabItems.find((t) => t.id === activeTab) || tabItems[0];
  const ActiveIcon = activeTabObj.icon;

  const renderPanelContent = (tab: SidebarTab) => {
    switch (tab) {
      case "media":
        return <MediaTabPanel />;

      case "grid":
        return (
          <GridTabPanel
            onOpenEqualDivModal={() => setShowEqualDivModal(true)}
          />
        );

      case "paper":
        return <PaperTabPanel />;

      case "cell":
        return (
          <CellTabPanel
            selectedCellObj={selectedCellObj}
            selectedCellPos={selectedCellPos}
            onSwitchToMediaTab={() => setActiveTab("media")}
          />
        );

      case "export":
        return <ExportTabPanel collageRef={collageRef} />;

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
