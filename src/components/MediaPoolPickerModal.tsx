import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllMedia } from "@/lib/db";
import { MediaItem } from "@/types/library";
import { CollageImage } from "@/types/collage";
import { HardDrive, Check, Image as ImageIcon, Plus } from "lucide-react";

interface MediaPoolPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMedia: (images: CollageImage[]) => void;
}

export function MediaPoolPickerModal({
  open,
  onOpenChange,
  onSelectMedia,
}: MediaPoolPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getAllMedia()
        .then((items) => {
          setMediaList(items);
          setSelectedIds(new Set());
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === mediaList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mediaList.map((m) => m.id)));
    }
  };

  const handleAddSelected = () => {
    const chosenMedia = mediaList.filter((m) => selectedIds.has(m.id));
    const collageImages: CollageImage[] = chosenMedia.map((item, idx) => ({
      id: `image-${Date.now()}-${idx}`,
      src: item.dataUrl,
      name: item.name,
      count: 1,
      fit: "cover",
      orientation: "auto",
    }));

    onSelectMedia(collageImages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <HardDrive className="h-4 w-4" />
            Media Pool
          </div>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Select Photos from Pool
            </DialogTitle>
            {mediaList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {selectedIds.size === mediaList.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Pick saved photos from your local Media Pool to populate your editor canvas grid.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 animate-pulse">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="aspect-square rounded-lg bg-muted/40" />
              ))}
            </div>
          ) : mediaList.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {mediaList.map((media) => {
                const isSelected = selectedIds.has(media.id);
                return (
                  <div
                    key={media.id}
                    onClick={() => toggleSelect(media.id)}
                    className={`group relative aspect-square rounded-lg border cursor-pointer overflow-hidden transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-background"
                    }`}
                  >
                    <img
                      src={media.dataUrl}
                      alt={media.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Selection Check Circle */}
                    <div
                      className={`absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-slate-950/60 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 text-[10px] text-slate-200 truncate px-1.5">
                      {media.name}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center space-y-3">
              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Media Pool is Empty</p>
                <p className="text-xs text-muted-foreground">
                  Upload photos in the Library Hub or upload files directly in the editor sidebar.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
            className="font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add {selectedIds.size} {selectedIds.size === 1 ? "Photo" : "Photos"} to Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
