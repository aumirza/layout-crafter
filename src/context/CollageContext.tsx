import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { pageSizes, createCustomPageSize } from "@/data/page-sizes";
import { layoutPresets, createCustomLayout } from "@/data/layout-presets";
import {
  CollageState,
  CollageImage,
  CollageCell,
  ImageOrientation,
  SpaceOptimization,
  MeasurementUnit,
  LayoutCalculation,
  LayoutPreset,
  PageSize,
} from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { calculateEqualDivision } from "@/lib/equal-division";

interface CollageContextType {
  collageState: CollageState;
  updatePageSize: (pageSize: PageSize) => void;
  updateLayout: (layout: LayoutPreset) => void;
  handleImagesAdded: (newImages: CollageImage[]) => void;
  assignImageToCell: (
    rowIndex: number,
    colIndex: number,
    imageId: string
  ) => void;
  removeImage: (imageId: string) => void;
  updateImageCount: (imageId: string, count: number) => void;
  updateImageSettings: (
    imageId: string,
    updates: Partial<CollageImage>
  ) => void;
  updateCell: (cellId: string, updates: Partial<CollageCell>) => void;
  rearrangeCollage: () => void;
  distributeEqually: () => void;
  setSpaceOptimization: (value: SpaceOptimization) => void;
  toggleCuttingMarkers: (show: boolean) => void;
  setMarkerColor: (color: string) => void;
  resetCanvas: () => void;
  clearAll: () => void;
  setUnit: (unit: MeasurementUnit) => void;
  createCustomPageSize: (width: number, height: number, margin: number) => void;
  createCustomLayout: (cellWidth: number, cellHeight: number) => void;
  applyEqualDivision: (
    columns: number,
    rows: number,
    customMargin?: number,
    customRowGap?: number,
    customColumnGap?: number
  ) => void;
  // Gap management functions
  setRowGap: (gap: number) => void;
  setColumnGap: (gap: number) => void;
  setGapsLinked: (linked: boolean) => void;
  updateGap: (type: 'row' | 'column', value: number) => void;
  // Feature flag functions
  setUseKonvaCanvas: (enabled: boolean) => void;
  // Add shared app settings
  settings: {
    autoSave: boolean;
    exportQuality: string;
  };
  updateSettings: (key: string, value: string | boolean) => void;
}

const CollageContext = createContext<CollageContextType | undefined>(undefined);

// Helper function to calculate the maximum number of cells that can fit on a page
function calculateGridDimensions(
  pageWidth: number,
  pageHeight: number,
  cellWidth: number,
  cellHeight: number,
  margin: number,
  spaceOptimization: SpaceOptimization,
  rowGap: number = 0,
  columnGap: number = 0
): LayoutCalculation {
  // Calculate usable area by removing margins from all sides
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Calculate portrait orientation (cellWidth x cellHeight)
  // Account for gaps: if we have n columns, we need (n-1) column gaps
  // Similarly for rows: if we have n rows, we need (n-1) row gaps
  let portraitColumns = Math.floor((usableWidth + columnGap) / (cellWidth + columnGap));
  let portraitRows = Math.floor((usableHeight + rowGap) / (cellHeight + rowGap));
  
  // Ensure we don't have negative values
  portraitColumns = Math.max(0, portraitColumns);
  portraitRows = Math.max(0, portraitRows);
  
  const portraitTotal = portraitColumns * portraitRows;

  // For loose fit, we only use one orientation
  if (spaceOptimization === "loose") {
    return {
      rows: portraitRows,
      columns: portraitColumns,
      orientation: "portrait",
      totalCells: portraitTotal,
    };
  }

  // For tight fit, try both orientations to see which gives more cells
  // Calculate landscape orientation (cellHeight x cellWidth) - swapping dimensions
  let landscapeColumns = Math.floor((usableWidth + columnGap) / (cellHeight + columnGap));
  let landscapeRows = Math.floor((usableHeight + rowGap) / (cellWidth + rowGap));
  
  // Ensure we don't have negative values
  landscapeColumns = Math.max(0, landscapeColumns);
  landscapeRows = Math.max(0, landscapeRows);
  
  const landscapeTotal = landscapeColumns * landscapeRows;

  if (landscapeTotal > portraitTotal) {
    return {
      rows: landscapeRows,
      columns: landscapeColumns,
      orientation: "landscape",
      totalCells: landscapeTotal,
    };
  }

  return {
    rows: portraitRows,
    columns: portraitColumns,
    orientation: "portrait",
    totalCells: portraitTotal,
  };
}

export function CollageProvider({ children }: { children: ReactNode }) {
  // Get defaults from localStorage
  const getDefaultUnit = (): MeasurementUnit => {
    return (localStorage.getItem("defaultUnit") as MeasurementUnit) || "mm";
  };

  const getDefaultShowCuttingMarkers = (): boolean => {
    return localStorage.getItem("defaultShowCuttingMarkers") === "true";
  };

  // Calculate initial grid dimensions
  const initialLayout = layoutPresets[0];
  const initialPageSize = pageSizes[0];
  const initialGrid = calculateGridDimensions(
    initialPageSize.width,
    initialPageSize.height,
    initialLayout.cellWidth,
    initialLayout.cellHeight,
    initialPageSize.margin,
    "loose",
    2, // default rowGap
    2  // default columnGap
  );

  const [collageState, setCollageState] = useState<CollageState>({
    pageSize: initialPageSize,
    layout: initialLayout,
    images: [],
    cells: [],
    rows: initialGrid.rows,
    columns: initialGrid.columns,
    spaceOptimization: "loose",
    showCuttingMarkers: getDefaultShowCuttingMarkers(),
    markerColor: "#9ca3af",
    selectedUnit: getDefaultUnit(),
    rowGap: 2, // Default: 2mm
    columnGap: 2, // Default: 2mm
    gapsLinked: true, // Default: linked
    useKonvaCanvas: localStorage.getItem("useKonvaCanvas") !== "false", // Default: true
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    autoSave: localStorage.getItem("autoSave") !== "false",
    exportQuality: localStorage.getItem("exportQuality") || "medium",
  });

  // Update settings function
  const updateSettings = (key: string, value: string | boolean) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value.toString());
  };

  const [settings, setSettings] = useState({
    autoSave: localStorage.getItem("autoSave") === "true",
    exportQuality: localStorage.getItem("exportQuality") || "high",
  });

  const updatePageSize = (newPageSize: PageSize) => {
    setCollageState((prev) => {
      // Recalculate grid dimensions based on new page size
      const layout = calculateGridDimensions(
        newPageSize.width,
        newPageSize.height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        newPageSize.margin,
        prev.spaceOptimization,
        prev.rowGap,
        prev.columnGap
      );

      return {
        ...prev,
        pageSize: newPageSize,
        rows: layout.rows,
        columns: layout.columns,
      };
    });

    // After changing page size, we need to reinitialize the cells
    initializeCells();

    toast({
      title: "Page size updated",
      description: `Changed to ${newPageSize.label}`,
    });
  };

  const createCustomPageSizeImpl = (
    width: number,
    height: number,
    margin: number
  ) => {
    const customSize = createCustomPageSize(width, height, margin);

    setCollageState((prev) => {
      // Recalculate grid dimensions based on custom page size
      const layout = calculateGridDimensions(
        width,
        height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        customSize.margin,
        prev.spaceOptimization,
        prev.rowGap,
        prev.columnGap
      );

      return {
        ...prev,
        pageSize: customSize,
        rows: layout.rows,
        columns: layout.columns,
      };
    });

    // After changing page size, we need to reinitialize the cells
    initializeCells();

    toast({
      title: "Custom page size created",
      description: `Size set to ${width}×${height}mm`,
    });
  };

  const updateLayout = (newLayout: LayoutPreset) => {
    // Get all layouts (built-in + custom)

    if (!newLayout) {
      toast({
        title: "Error",
        description: "Layout not found",
        variant: "destructive",
      });
      return;
    }

    setCollageState((prev) => {
      // Calculate new grid dimensions based on the selected layout
      const layout = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        newLayout.cellWidth,
        newLayout.cellHeight,
        prev.pageSize.margin,
        prev.spaceOptimization,
        prev.rowGap,
        prev.columnGap
      );

      // Create a new cells grid based on the calculated dimensions
      const newCells: CollageCell[][] = Array(layout.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(layout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto",
            }))
        );

      return {
        ...prev,
        layout: newLayout,
        rows: layout.rows,
        columns: layout.columns,
        cells: newCells,
      };
    });

    toast({
      title: "Layout updated",
      description: `Changed to ${newLayout.label}`,
    });
  };

  const createCustomLayoutImpl = (cellWidth: number, cellHeight: number) => {
    const customLayout = createCustomLayout(cellWidth, cellHeight);

    setCollageState((prev) => {
      // Calculate new grid dimensions based on the custom layout
      const layout = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        cellWidth,
        cellHeight,
        prev.pageSize.margin,
        prev.spaceOptimization,
        prev.rowGap,
        prev.columnGap
      );

      // Create a new cells grid based on the calculated dimensions
      const newCells: CollageCell[][] = Array(layout.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(layout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      return {
        ...prev,
        layout: customLayout,
        rows: layout.rows,
        columns: layout.columns,
        cells: newCells,
      };
    });

    toast({
      title: "Custom layout created",
      description: `Photo size set to ${cellWidth}×${cellHeight}mm`,
    });
  };

  const applyEqualDivision = (
    columns: number,
    rows: number,
    customMargin?: number,
    customRowGap?: number,
    customColumnGap?: number
  ) => {
    setCollageState((prev) => {
      const margin = customMargin !== undefined ? customMargin : prev.pageSize.margin;
      const rowGap = customRowGap !== undefined ? customRowGap : prev.rowGap;
      const columnGap = customColumnGap !== undefined ? customColumnGap : prev.columnGap;

      const division = calculateEqualDivision(
        {
          pageSize: { ...prev.pageSize, margin },
          columns,
          rows,
          margin,
          rowGap,
          columnGap,
        },
        prev.selectedUnit
      );

      const customLayout: LayoutPreset = {
        id: `equal_${columns}x${rows}_${Date.now()}`,
        name: `Equal Division (${columns * rows} Pcs)`,
        cellWidth: division.cellWidth,
        cellHeight: division.cellHeight,
        label: `Equal ${columns}x${rows} (${division.cellWidth}×${division.cellHeight}mm)`,
      };

      const newPageSize = {
        ...prev.pageSize,
        margin,
      };

      const totalCells = rows * columns;
      const newCells: CollageCell[][] = Array(rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      // Auto-populate new equal division cells with uploaded images
      if (prev.images.length === 1 && prev.images[0].src) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            newCells[r][c].imageId = prev.images[0].id;
          }
        }
      } else if (prev.images.length > 0) {
        const imagePool: { id: string; orientation: ImageOrientation }[] = [];
        prev.images.forEach((image) => {
          if (image.count && image.count > 0) {
            for (let i = 0; i < Math.min(image.count, totalCells); i++) {
              let orientation: ImageOrientation = image.orientation || "auto";
              if (prev.spaceOptimization === "tight" && orientation === "auto") {
                orientation = i % 2 === 0 ? "portrait" : "landscape";
              }
              imagePool.push({ id: image.id, orientation });
            }
          }
        });

        let poolIndex = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            if (poolIndex < imagePool.length) {
              newCells[r][c].imageId = imagePool[poolIndex].id;
              newCells[r][c].orientation = imagePool[poolIndex].orientation;
              poolIndex++;
            }
          }
        }
      }

      toast({
        title: "Equal Page Division Applied",
        description: `${columns * rows} pieces (${division.cellWidth}×${division.cellHeight}mm per cell)`,
      });

      return {
        ...prev,
        pageSize: newPageSize,
        layout: customLayout,
        rows,
        columns,
        rowGap,
        columnGap,
        cells: newCells,
      };
    });
  };

  const handleImagesAdded = (newImages: CollageImage[]) => {
    setCollageState((prev) => {
      const updatedImages = [
        ...prev.images,
        ...newImages.map((img) => ({
          ...img,
          count: 1, // Initialize count to 1 for each image
        })),
      ];

      // If there's only one image, auto-fill all cells with that image and set count to total cells
      if (prev.images.length === 0 && newImages.length === 1) {
        const totalCells = prev.rows * prev.columns;
        const singleImage = {
          ...newImages[0],
          count: totalCells,
        };
        const updatedCells = prev.cells.map((row) =>
          row.map((cell) => ({
            ...cell,
            imageId: singleImage.id,
            orientation: "auto" as ImageOrientation,
          }))
        );

        return {
          ...prev,
          images: [singleImage],
          cells: updatedCells,
        };
      }

      return {
        ...prev,
        images: updatedImages,
      };
    });

    toast({
      title: "Images added",
      description: `${newImages.length} new image(s) added`,
    });
  };

  const assignImageToCell = (
    rowIndex: number,
    colIndex: number,
    imageId: string
  ) => {
    setCollageState((prev) => {
      const newCells = [...prev.cells];
      // Find the image to get its orientation
      const image = prev.images.find((img) => img.id === imageId);

      if (
        rowIndex >= 0 &&
        rowIndex < newCells.length &&
        colIndex >= 0 &&
        colIndex < newCells[rowIndex].length
      ) {
        newCells[rowIndex][colIndex] = {
          ...newCells[rowIndex][colIndex],
          imageId,
          orientation: image?.orientation || "auto",
        };
      }

      return {
        ...prev,
        cells: newCells,
      };
    });
  };

  const removeImage = (imageId: string) => {
    setCollageState((prev) => {
      // Remove image from images array
      const updatedImages = prev.images.filter((img) => img.id !== imageId);

      // Clear this image from any cells
      const updatedCells = prev.cells.map((row) =>
        row.map((cell) =>
          cell.imageId === imageId
            ? {
                ...cell,
                imageId: null,
                orientation: "auto" as ImageOrientation,
              }
            : cell
        )
      );

      return {
        ...prev,
        images: updatedImages,
        cells: updatedCells,
      };
    });

    toast({
      title: "Image removed",
      description: "Image removed from collage",
    });
  };

  const updateImageCount = (imageId: string, count: number) => {
    setCollageState((prev) => {
      const updatedImages = prev.images.map((img) =>
        img.id === imageId ? { ...img, count: Math.max(0, count) } : img
      );

      const totalCells = prev.rows * prev.columns;
      const imagePool: { id: string; orientation: ImageOrientation }[] = [];
      updatedImages.forEach((image) => {
        if (image.count && image.count > 0) {
          for (let i = 0; i < Math.min(image.count, totalCells); i++) {
            let orientation: ImageOrientation = image.orientation || "auto";
            if (prev.spaceOptimization === "tight" && orientation === "auto") {
              orientation = i % 2 === 0 ? "portrait" : "landscape";
            }
            imagePool.push({
              id: image.id,
              orientation,
            });
          }
        }
      });

      let poolIndex = 0;
      const updatedCells = prev.cells.map((row) =>
        row.map((cell) => {
          if (poolIndex < imagePool.length) {
            const item = imagePool[poolIndex++];
            return {
              ...cell,
              imageId: item.id,
              orientation: item.orientation,
            };
          }
          return {
            ...cell,
            imageId: null,
          };
        })
      );

      return {
        ...prev,
        images: updatedImages,
        cells: updatedCells,
      };
    });
  };

  const updateImageSettings = (
    imageId: string,
    updates: Partial<CollageImage>
  ) => {
    setCollageState((prev) => {
      // Update the image settings in media pool
      const updatedImages = prev.images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      );

      // Apply updates to ALL cells displaying this image
      const updatedCells = prev.cells.map((row) =>
        row.map((cell) => {
          if (cell.imageId !== imageId) return cell;

          const cellUpdates: Partial<CollageCell> = {};
          if (updates.fit !== undefined) cellUpdates.fit = updates.fit;
          if (updates.orientation !== undefined) cellUpdates.orientation = updates.orientation;
          if (updates.transform !== undefined) cellUpdates.transform = updates.transform;

          return {
            ...cell,
            ...cellUpdates,
          };
        })
      );

      return {
        ...prev,
        images: updatedImages,
        cells: updatedCells,
      };
    });
  };

  const updateCell = (cellId: string, updates: Partial<CollageCell>) => {
    setCollageState((prev) => {
      const updatedCells = prev.cells.map((row) =>
        row.map((cell) =>
          cell.id === cellId
            ? {
                ...cell,
                ...updates,
              }
            : cell
        )
      );

      return {
        ...prev,
        cells: updatedCells,
      };
    });
  };

  const setSpaceOptimization = (value: SpaceOptimization) => {
    setCollageState((prev) => {
      // Recalculate grid dimensions using the new optimization setting
      const layout = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        prev.pageSize.margin,
        value,
        prev.rowGap,
        prev.columnGap
      );

      // Create a new cells grid based on the calculated dimensions
      const newCells: CollageCell[][] = Array(layout.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(layout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      return {
        ...prev,
        spaceOptimization: value,
        rows: layout.rows,
        columns: layout.columns,
        cells: newCells,
      };
    });

    toast({
      title: "Layout mode updated",
      description:
        value === "loose"
          ? "Using same orientation for all images"
          : "Mixed orientations for optimal space usage",
    });
  };

  const toggleCuttingMarkers = (show: boolean) => {
    setCollageState((prev) => ({
      ...prev,
      showCuttingMarkers: show,
    }));
  };

  const setMarkerColor = (color: string) => {
    setCollageState((prev) => ({
      ...prev,
      markerColor: color,
    }));
  };

  const resetCanvas = () => {
    setCollageState((prev) => {
      // Keep the images but reset all cells
      const newCells: CollageCell[][] = Array(prev.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(prev.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      // Also reset all image counts to zero
      const resetImages = prev.images.map((img) => ({
        ...img,
        count: 0,
      }));

      return {
        ...prev,
        cells: newCells,
        images: resetImages,
      };
    });

    toast({
      title: "Canvas reset",
      description: "All photos removed from canvas",
    });
  };

  const clearAll = () => {
    setCollageState((prev) => {
      // Reset everything
      const newCells: CollageCell[][] = Array(prev.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(prev.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      return {
        ...prev,
        cells: newCells,
        images: [],
      };
    });

    toast({
      title: "All cleared",
      description: "All photos removed from project",
    });
  };

  const setUnit = (unit: MeasurementUnit) => {
    setCollageState((prev) => ({
      ...prev,
      selectedUnit: unit,
    }));
  };

  // Gap management functions
  const setRowGap = (gap: number) => {
    setCollageState((prev) => ({
      ...prev,
      rowGap: gap,
      // If gaps are linked, also update column gap
      columnGap: prev.gapsLinked ? gap : prev.columnGap,
    }));
  };

  const setColumnGap = (gap: number) => {
    setCollageState((prev) => ({
      ...prev,
      columnGap: gap,
      // If gaps are linked, also update row gap
      rowGap: prev.gapsLinked ? gap : prev.rowGap,
    }));
  };

  const setGapsLinked = (linked: boolean) => {
    setCollageState((prev) => ({
      ...prev,
      gapsLinked: linked,
      // If linking is enabled, sync column gap to row gap
      columnGap: linked ? prev.rowGap : prev.columnGap,
    }));
  };

  const updateGap = (type: 'row' | 'column', value: number) => {
    if (type === 'row') {
      setRowGap(value);
    } else {
      setColumnGap(value);
    }
  };

  const distributeEqually = () => {
    setCollageState((prev) => {
      const totalCells = prev.rows * prev.columns;
      const activeImages = prev.images.filter((img) => img.count !== 0);

      // If no images, do nothing
      if (activeImages.length === 0) {
        toast({
          title: "No images to distribute",
          description: "Add images first",
        });
        return prev;
      }

      // Calculate cells per image
      const cellsPerImage = Math.floor(totalCells / activeImages.length);
      const remainder = totalCells % activeImages.length;

      let activeIdx = 0;
      // Update image counts
      const updatedImages = prev.images.map((img) => {
        if (img.count === 0) return img;
        // Distribute remainder to first few images
        const extraCell = activeIdx < remainder ? 1 : 0;
        activeIdx++;
        return {
          ...img,
          count: cellsPerImage + extraCell,
        };
      });

      // Build updated cell grid based on equalized image counts
      const imagePool: { id: string; orientation: ImageOrientation }[] = [];
      updatedImages.forEach((image) => {
        if (image.count && image.count > 0) {
          for (let i = 0; i < Math.min(image.count, totalCells); i++) {
            let orientation: ImageOrientation = image.orientation || "auto";
            if (prev.spaceOptimization === "tight" && orientation === "auto") {
              orientation = i % 2 === 0 ? "portrait" : "landscape";
            }
            imagePool.push({
              id: image.id,
              orientation,
            });
          }
        }
      });

      let poolIndex = 0;
      const updatedCells = prev.cells.map((row) =>
        row.map((cell) => {
          if (poolIndex < imagePool.length) {
            const item = imagePool[poolIndex++];
            return {
              ...cell,
              imageId: item.id,
              orientation: item.orientation,
            };
          }
          return {
            ...cell,
            imageId: null,
          };
        })
      );

      toast({
        title: "Distributed equally",
        description: `${cellsPerImage} cells per image (${totalCells} total)`,
      });

      return {
        ...prev,
        images: updatedImages,
        cells: updatedCells,
      };
    });
  };

  const rearrangeCollage = () => {
    setCollageState((prev) => {
      const totalCells = prev.rows * prev.columns;

      // Create a new cells grid
      const newCells: CollageCell[][] = Array(prev.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(prev.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation:
                prev.spaceOptimization === "tight" && colIndex % 2 === 0
                  ? "landscape"
                  : "portrait",
            }))
        );

      // Collect all images with their counts
      const imagePool: { id: string; orientation: ImageOrientation }[] = [];
      prev.images.forEach((image) => {
        if (image.count && image.count > 0) {
          // Add image to the pool based on its count
          for (let i = 0; i < Math.min(image.count, totalCells); i++) {
            let orientation: ImageOrientation = image.orientation || "auto";

            // In tight fit mode, optimize space if auto orientation
            if (prev.spaceOptimization === "tight" && orientation === "auto") {
              // Alternate orientations
              orientation = i % 2 === 0 ? "portrait" : "landscape";
            }

            imagePool.push({
              id: image.id,
              orientation,
            });
          }
        }
      });

      // Fill cells with images SEQUENTIALLY (no shuffling)
      let poolIndex = 0;
      for (let rowIndex = 0; rowIndex < prev.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < prev.columns; colIndex++) {
          if (poolIndex < imagePool.length) {
            newCells[rowIndex][colIndex].imageId = imagePool[poolIndex].id;
            newCells[rowIndex][colIndex].orientation =
              imagePool[poolIndex].orientation;
            poolIndex++;
          }
        }
      }

      toast({
        title: "Collage arranged",
        description: `Applied image quantities to the layout (${poolIndex} of ${totalCells} cells filled)`,
      });

      return {
        ...prev,
        cells: newCells,
      };
    });
  };

  const initializeCells = useCallback(() => {
    setCollageState((prev) => {
      // Calculate grid dimensions
      const layout = calculateGridDimensions(
        prev.pageSize.width,
        prev.pageSize.height,
        prev.layout.cellWidth,
        prev.layout.cellHeight,
        prev.pageSize.margin,
        prev.spaceOptimization,
        prev.rowGap,
        prev.columnGap
      );

      // Create a new cells grid
      const newCells: CollageCell[][] = Array(layout.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(layout.columns)
            .fill(null)
            .map((_, colIndex) => ({
              id: `cell-${rowIndex}-${colIndex}`,
              imageId: null,
              orientation: "auto" as ImageOrientation,
            }))
        );

      // If we have exactly one image, fill all cells with it
      if (prev.images.length === 1) {
        return {
          ...prev,
          rows: layout.rows,
          columns: layout.columns,
          cells: newCells.map((row) =>
            row.map((cell) => ({
              ...cell,
              imageId: prev.images[0].id,
              orientation: prev.images[0].orientation || "auto",
            }))
          ),
        };
      }

      return {
        ...prev,
        rows: layout.rows,
        columns: layout.columns,
        cells: newCells,
      };
    });
  }, []);

  const setUseKonvaCanvas = useCallback((enabled: boolean) => {
    setCollageState((prev) => ({
      ...prev,
      useKonvaCanvas: enabled,
    }));
    localStorage.setItem("useKonvaCanvas", enabled.toString());
  }, []);

  return (
    <CollageContext.Provider
      value={{
        collageState,
        updatePageSize,
        handleImagesAdded,
        assignImageToCell,
        removeImage,
        updateImageCount,
        updateImageSettings,
        updateCell,
        rearrangeCollage,
        distributeEqually,
        setSpaceOptimization,
        toggleCuttingMarkers,
        setMarkerColor,
        resetCanvas,
        clearAll,
        setUnit,
        updateLayout,
        createCustomPageSize: createCustomPageSizeImpl,
        createCustomLayout: createCustomLayoutImpl,
        applyEqualDivision,
        setRowGap,
        setColumnGap,
        setGapsLinked,
        updateGap,
        setUseKonvaCanvas,
        settings: appSettings,
        updateSettings,
      }}
    >
      {children}
    </CollageContext.Provider>
  );
}

export const useCollage = () => {
  const context = useContext(CollageContext);
  if (context === undefined) {
    throw new Error("useCollage must be used within a CollageProvider");
  }
  return context;
};
