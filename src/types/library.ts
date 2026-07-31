import { CollageState, PageSize, LayoutPreset } from "./collage";

export interface SavedProject {
  id: string;
  title: string;
  updatedAt: number; // Unix timestamp in ms
  createdAt: number; // Unix timestamp in ms
  thumbnail?: string; // Data URL thumbnail preview
  pageSize: PageSize;
  layout: LayoutPreset;
  state: CollageState;
}

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string; // Base64 / Blob data URL
  type: string;
  size: number; // bytes
  width?: number;
  height?: number;
  addedAt: number;
}

export interface ProjectExportData {
  version: "1.0";
  exportedAt: number;
  project: SavedProject;
}

export type SortOption = "updatedAt-desc" | "updatedAt-asc" | "title-asc" | "title-desc";
