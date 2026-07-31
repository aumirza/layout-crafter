import { RefObject } from "react";
import { PageSizeSelector } from "./PageSizeSelector";
import { LayoutSelector } from "./LayoutSelector";
import { ImageUploader } from "./ImageUploader";
import { ExportPanel } from "./ExportPanel";
import { GapControls } from "./GapControls";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { UnitSelector } from "./UnitSelector";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "./ui/sidebar";
import { Link } from "react-router-dom";
import { useCollage } from "@/context/CollageContext";
import { Badge } from "./ui/badge";
import {
  FileText,
  LayoutGrid,
  ImageIcon,
  Sliders,
  Download,
  Layout,
} from "lucide-react";

interface CollageSidebarProps {
  collageRef: RefObject<HTMLDivElement>;
}

export function CollageSidebar({ collageRef }: CollageSidebarProps) {
  const {
    collageState,
    setRowGap,
    setColumnGap,
    setGapsLinked,
  } = useCollage();

  const ConnectedGapControls = () => (
    <GapControls
      rowGap={collageState.rowGap}
      columnGap={collageState.columnGap}
      gapsLinked={collageState.gapsLinked}
      onRowGapChange={setRowGap}
      onColumnGapChange={setColumnGap}
      onLinkedChange={setGapsLinked}
      unit={collageState.selectedUnit}
    />
  );

  const photoCount = collageState.images?.length || 0;

  return (
    <Sidebar className="border-r border-border/50 bg-card/95 backdrop-blur-md">
      <SidebarHeader className="p-4 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group text-foreground hover:text-primary transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-sm">
              <Layout className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight">
              Layout<span className="text-primary">Crafter</span>
            </span>
          </Link>

          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold font-mono">
            Studio
          </Badge>
        </div>

        <div className="pt-1">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Unit System
          </label>
          <UnitSelector />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <Accordion type="single" collapsible defaultValue="photos" className="space-y-1">
              <AccordionItem value="page-size" className="border-b-0 rounded-xl px-2">
                <AccordionTrigger className="text-sm font-bold hover:no-underline py-3 hover:text-primary transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span>Canvas Paper Size</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <PageSizeSelector />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="photo-size" className="border-b-0 rounded-xl px-2">
                <AccordionTrigger className="text-sm font-bold hover:no-underline py-3 hover:text-primary transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <span>Grid & Layout Ratios</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <LayoutSelector />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="photos" className="border-b-0 rounded-xl px-2">
                <AccordionTrigger className="text-sm font-bold hover:no-underline py-3 hover:text-primary transition-colors">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <span>Photos & Assets</span>
                    </div>
                    {photoCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0">
                        {photoCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <ImageUploader />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="spacing" className="border-b-0 rounded-xl px-2">
                <AccordionTrigger className="text-sm font-bold hover:no-underline py-3 hover:text-primary transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <span>Spacing & Margins</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <ConnectedGapControls />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="export" className="border-b-0 rounded-xl px-2">
                <AccordionTrigger className="text-sm font-bold hover:no-underline py-3 hover:text-primary transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                      <Download className="h-4 w-4" />
                    </div>
                    <span>Export & Print Options</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  <ExportPanel collageRef={collageRef} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
