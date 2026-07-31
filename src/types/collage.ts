export interface PageSize {
  id?: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  label: string;
  margin: number; // in mm
}

export interface LayoutPreset {
  id: string;
  name: string;
  cellWidth: number; // in mm
  cellHeight: number; // in mm
  label: string;
}

export interface ImageTransform {
  x: number;          // Horizontal offset in cell space
  y: number;          // Vertical offset in cell space
  scaleX: number;     // Scaling factor on X axis
  scaleY: number;     // Scaling factor on Y axis
  rotation: number;   // Rotation angle in degrees (e.g., 0, 90, 180, 270)
  cropX: number;      // Source image crop start X (px)
  cropY: number;      // Source image crop start Y (px)
  cropWidth: number;  // Source image crop width (px)
  cropHeight: number; // Source image crop height (px)
}

export interface CollageImage {
  id: string;
  src: string;
  name: string;
  count?: number;
  fit?: ImageFitOption;
  orientation?: ImageOrientation;
  transform?: ImageTransform;
}

export type ImageFitOption = "cover" | "contain" | "fill" | "original";
export type ImageOrientation = "auto" | "portrait" | "landscape";
export type SpaceOptimization = "loose" | "tight";
export type MeasurementUnit = "mm" | "cm" | "in";

export interface CollageCell {
  id: string;
  imageId: string | null;
  orientation?: ImageOrientation;
  transform?: ImageTransform;
}

export interface CollageState {
  pageSize: PageSize;
  layout: LayoutPreset;
  images: CollageImage[];
  cells: CollageCell[][];
  rows: number;
  columns: number;
  spaceOptimization: SpaceOptimization;
  showCuttingMarkers: boolean;
  markerColor: string;
  selectedUnit: MeasurementUnit;
  rowGap: number; // in mm, default: 2
  columnGap: number; // in mm, default: 2
  gapsLinked: boolean; // default: true
}

export type ExportFormat = "png" | "pdf" | "print";

export interface LayoutCalculation {
  rows: number;
  columns: number;
  orientation: ImageOrientation;
  totalCells: number;
}
