import { useState } from "react";
import { SavedProject } from "@/types/library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  ExternalLink,
  Copy,
  Download,
  Trash2,
  Edit2,
  Calendar,
  FileText,
  Grid,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: SavedProject;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onExport: (project: SavedProject) => void;
}

export function ProjectCard({
  project,
  onDuplicate,
  onDelete,
  onRename,
  onExport,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(project.title);

  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const imageCount = project.state?.images?.length || 0;
  const gridLabel = project.layout?.name || `${project.state?.rows || 2}×${project.state?.columns || 2} Grid`;
  const paperLabel = project.pageSize?.name || "A4 Paper";

  const handleOpen = () => {
    navigate(`/editor?project=${project.id}`);
  };

  const handleSaveRename = () => {
    if (renameTitle.trim()) {
      onRename(project.id, renameTitle.trim());
      setRenameOpen(false);
    }
  };

  return (
    <>
      <div className="group relative rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden">
        {/* Card Header Preview Area */}
        <div
          onClick={handleOpen}
          className="cursor-pointer h-40 bg-slate-950 p-4 relative flex items-center justify-center border-b border-border/80 group-hover:bg-slate-900 transition-colors"
        >
          {/* Blueprint grid background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-80" />

          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="max-h-32 max-w-[85%] object-contain rounded shadow-lg transition-transform group-hover:scale-105"
            />
          ) : (
            /* Synthetic Canvas Wireframe Preview */
            <div className="relative z-10 w-28 h-36 bg-white dark:bg-slate-900 border border-slate-700 rounded shadow-lg p-1.5 flex flex-col justify-between group-hover:scale-105 transition-transform">
              <div className="grid grid-cols-2 gap-1 h-full w-full">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-500/10 border border-indigo-500/30 rounded-xs flex items-center justify-center"
                  >
                    <ImageIcon className="h-3 w-3 text-indigo-400/50" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Open Hover Badge */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex items-center justify-center transition-opacity">
            <Button size="sm" className="font-semibold gap-1.5 shadow-md">
              <ExternalLink className="h-3.5 w-3.5" />
              Open Studio
            </Button>
          </div>
        </div>

        {/* Card Content Footer */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                onClick={handleOpen}
                className="font-bold text-base text-foreground line-clamp-1 hover:text-primary cursor-pointer transition-colors"
              >
                {project.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                <Calendar className="h-3 w-3" />
                <span>Saved {formattedDate}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground inline-flex items-center justify-center hover:bg-accent transition-colors">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleOpen} className="gap-2 cursor-pointer">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Open in Studio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenameOpen(true)} className="gap-2 cursor-pointer">
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  Rename Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(project.id)} className="gap-2 cursor-pointer">
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(project)} className="gap-2 cursor-pointer">
                  <Download className="h-4 w-4 text-emerald-500" />
                  Export .layoutcraft
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(project.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges Strip */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border bg-muted/40 font-semibold text-foreground gap-1">
              <FileText className="h-3 w-3 text-primary" />
              {paperLabel}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border bg-muted/40 text-muted-foreground gap-1">
              <Grid className="h-3 w-3" />
              {gridLabel}
            </Badge>
            {imageCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 text-foreground gap-1 font-sans">
                <ImageIcon className="h-3 w-3 text-emerald-500" />
                {imageCount} {imageCount === 1 ? "Image" : "Images"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Rename Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-input" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Title
            </Label>
            <Input
              id="rename-input"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="bg-background border-border text-foreground"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveRename}>
              Save Title
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
