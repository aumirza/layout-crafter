import { useCollage } from "@/context/CollageContext";
import { PageSizeSelector } from "../PageSizeSelector";
import { pageSizes } from "@/data/page-sizes";
import { Badge } from "@/components/ui/badge";
import { SidebarSeparator } from "@/components/ui/sidebar";
import { FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaperTabPanel() {
  const { collageState, updatePageSize } = useCollage();

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
}
