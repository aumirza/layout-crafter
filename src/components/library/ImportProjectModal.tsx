import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, CheckCircle2, AlertCircle } from "lucide-react";
import { importProjectJson } from "@/lib/db";
import { SavedProject } from "@/types/library";

interface ImportProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (project: SavedProject) => void;
}

export function ImportProjectModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportProjectModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".layoutcraft") && !file.name.endsWith(".json")) {
      setError("Please select a valid .layoutcraft or .json project file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const project = await importProjectJson(text);
      onImportSuccess(project);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse project file.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Upload className="h-4 w-4" />
            Import Project
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Restore Project File
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select a saved <code className="text-primary font-mono text-xs">.layoutcraft</code> or project JSON file from your computer to import it into your local library.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-background/50"
            }`}
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <FileCode className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {loading ? "Reading project file..." : "Drop your project file here"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports <span className="font-mono text-foreground font-medium">.layoutcraft</span> format
              </p>
            </div>

            <label htmlFor="import-file-input">
              <Button variant="outline" size="sm" type="button" disabled={loading} className="mt-2 pointer-events-none">
                Browse File
              </Button>
              <input
                id="import-file-input"
                type="file"
                accept=".layoutcraft,.json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
