import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { pageSizes } from "@/data/page-sizes";
import { layoutPresets } from "@/data/layout-presets";
import { PageSize, LayoutPreset } from "@/types/collage";
import { useCollage } from "@/context/CollageContext";
import { useNavigate } from "react-router-dom";
import { Layout, FileText, Sparkles, ArrowRight, Check } from "lucide-react";

interface PresetPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PresetPickerModal({ open, onOpenChange }: PresetPickerModalProps) {
  const navigate = useNavigate();
  const { createNewProject } = useCollage();

  const [title, setTitle] = useState("Untitled Project");
  const [selectedPageSize, setSelectedPageSize] = useState<PageSize>(pageSizes[0]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutPreset>(layoutPresets[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const projectId = await createNewProject(
        selectedPageSize,
        selectedLayout,
        title.trim() || "Untitled Project"
      );
      onOpenChange(false);
      navigate(`/editor?project=${projectId}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-card border-border shadow-2xl p-6 sm:p-8">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="h-4 w-4" />
            New Studio Project
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Configure Your Canvas & Layout
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose paper dimensions and initial grid structure. You can fine-tune margins and gaps in the editor anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Title Input */}
          <div className="space-y-2">
            <Label htmlFor="project-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Name
            </Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Vacation Grid"
              className="bg-background border-border text-foreground text-sm font-medium focus-visible:ring-primary"
            />
          </div>

          {/* Paper Size Picker */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Paper Dimension</span>
              <span className="text-primary font-mono text-[11px] lowercase">
                {selectedPageSize.width} × {selectedPageSize.height} mm
              </span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {pageSizes.map((size) => {
                const isSelected = selectedPageSize.name === size.name;
                return (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedPageSize(size)}
                    className={`relative p-3 rounded-lg border text-left transition-all ${isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-xs ring-1 ring-primary"
                        : "border-border/80 bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        {size.name}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{size.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout Division Preset Picker */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Grid Preset
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {layoutPresets.map((preset) => {
                const isSelected = selectedLayout.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedLayout(preset)}
                    className={`relative p-3 rounded-lg border text-left transition-all ${isSelected
                        ? "border-primary bg-primary/10 text-foreground shadow-xs ring-1 ring-primary"
                        : "border-border/80 bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                        <Layout className="h-3.5 w-3.5 text-primary" />
                        {preset.name}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{preset.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate} disabled={isSubmitting} className="font-semibold gap-1.5 px-5">
            {isSubmitting ? "Creating..." : "Create & Launch Editor"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
