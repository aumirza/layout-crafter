import { useMemo, useRef, useState } from "react";
import { Plus, X, Image, Shuffle, DivideSquare } from "lucide-react";
import { CollageImage } from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageSettings } from "./ImageSettings";
import { useCollage } from "@/context/CollageContext";
import { cn } from "@/lib/utils";

export function ImageUploader() {
  const {
    collageState,
    handleImagesAdded,
    removeImage,
    updateImageCount,
    rearrangeCollage,
    distributeEqually,
  } = useCollage();

  const { images } = collageState;
  const maxCells = useMemo(
    () => collageState.rows * collageState.columns,
    [collageState.rows, collageState.columns]
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Process only image files
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select image files only",
        variant: "destructive",
      });
      return;
    }

    const newImages: CollageImage[] = [];
    let processed = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        newImages.push({
          id: `image-${Date.now()}-${processed}`,
          src,
          name: file.name,
          count: 1,
          fit: "cover", // Default fit
          orientation: "auto", // Default orientation
        });

        processed++;
        if (processed === imageFiles.length) {
          handleImagesAdded(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleCountChange = (id: string, value: string) => {
    const count = parseInt(value);
    // Allow zero or positive numbers
    if (!isNaN(count) && count >= 0) {
      updateImageCount(id, count);
    }
  };

  // Calculate total quantity of all images
  const totalQuantity = images.reduce((sum, img) => sum + (img.count || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-sidebar-foreground">Media Assets</h2>
        {images.length > 0 && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {totalQuantity} / {maxCells} cells
          </span>
        )}
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
          isDragging
            ? "border-sidebar-primary bg-sidebar-primary/10"
            : "border-sidebar-border bg-sidebar-accent/20 hover:bg-sidebar-accent/40 hover:border-sidebar-border/80"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />

        <div className="size-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary">
          <Plus className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold text-sidebar-foreground">
            Click or drag photos here
          </p>
          <p className="text-[10px] text-muted-foreground">
            Supports PNG, JPG, WEBP, GIF
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sidebar-foreground">
              Uploaded Collection ({images.length})
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2 font-medium rounded-lg gap-1 border-sidebar-border"
                onClick={distributeEqually}
                disabled={images.length === 0}
              >
                <DivideSquare className="size-3" />
                Equalize
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] px-2 font-medium rounded-lg gap-1 border-sidebar-border"
                onClick={rearrangeCollage}
                disabled={images.length === 0}
              >
                <Shuffle className="size-3" />
                Shuffle
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
            {images.map((image) => (
              <div
                key={image.id}
                className="flex flex-col bg-sidebar-accent/30 p-2.5 rounded-xl border border-sidebar-border group relative gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-background rounded-lg overflow-hidden shrink-0 border border-sidebar-border">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden flex-1 flex flex-col gap-1">
                    <p className="text-xs font-medium truncate text-sidebar-foreground">
                      {image.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-muted-foreground">
                        Count:
                      </label>
                      <Input
                        type="number"
                        value={image.count || 1}
                        onChange={(e) =>
                          handleCountChange(image.id, e.target.value)
                        }
                        className="h-6 w-14 text-[11px] font-mono font-bold bg-background border-sidebar-border px-1.5"
                        min="0"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive shrink-0 rounded-lg"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                <div className="pt-1 border-t border-sidebar-border/50">
                  <ImageSettings image={image} />
                </div>
              </div>
            ))}
          </div>

          {totalQuantity > maxCells && (
            <p className="text-[11px] text-destructive font-medium bg-destructive/10 p-2 rounded-lg border border-destructive/20">
              Total photo count ({totalQuantity}) exceeds total grid cells ({maxCells}). Some photos will be omitted.
            </p>
          )}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center p-6 border border-dashed border-sidebar-border rounded-xl bg-sidebar-accent/10 flex flex-col items-center gap-2">
          <div className="size-10 rounded-full bg-sidebar-accent/40 flex items-center justify-center text-muted-foreground">
            <Image className="size-5" />
          </div>
          <p className="text-xs font-semibold text-sidebar-foreground">No Media Uploaded</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Upload your images above to start populating your layout grid cells.
          </p>
        </div>
      )}
    </div>
  );
}
