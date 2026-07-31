import { MeasurementUnit, PageSize } from "@/types/collage";
import { UnitConverter } from "./unit-converter";

export interface PieceOption {
  pieces: number;
  label: string;
  columns: number;
  rows: number;
  badge?: string;
}

export const COMMON_PIECE_OPTIONS: PieceOption[] = [
  { pieces: 2, label: "2 Pieces (1×2)", columns: 1, rows: 2 },
  { pieces: 4, label: "4 Pieces (2×2)", columns: 2, rows: 2, badge: "Square of 2" },
  { pieces: 6, label: "6 Pieces (2×3)", columns: 2, rows: 3 },
  { pieces: 8, label: "8 Pieces (2×4)", columns: 2, rows: 4 },
  { pieces: 9, label: "9 Pieces (3×3)", columns: 3, rows: 3 },
  { pieces: 12, label: "12 Pieces (3×4)", columns: 3, rows: 4 },
  { pieces: 16, label: "16 Pieces (4×4)", columns: 4, rows: 4, badge: "Square of 2" },
  { pieces: 20, label: "20 Pieces (4×5)", columns: 4, rows: 5 },
  { pieces: 24, label: "24 Pieces (4×6)", columns: 4, rows: 6 },
  { pieces: 32, label: "32 Pieces (4×8)", columns: 4, rows: 8 },
];

export interface EqualDivisionParams {
  pageSize: PageSize;
  columns: number;
  rows: number;
  margin?: number; // in mm
  rowGap?: number; // in mm
  columnGap?: number; // in mm
}

export interface EqualDivisionResult {
  columns: number;
  rows: number;
  totalPieces: number;
  cellWidth: number; // in mm
  cellHeight: number; // in mm
  usableWidth: number; // in mm
  usableHeight: number; // in mm
  margin: number; // in mm
  rowGap: number; // in mm
  columnGap: number; // in mm
  formattedCellWidth: string;
  formattedCellHeight: string;
  formattedCellSizeLabel: string;
}

/**
 * Finds the optimal column and row count for a given total number of pieces
 * aiming to match paper aspect ratio or form square-ish grid cells.
 */
export function getGridForPieces(pieces: number, paperWidth: number, paperHeight: number): { columns: number; rows: number } {
  const match = COMMON_PIECE_OPTIONS.find((opt) => opt.pieces === pieces);
  if (match) {
    // If portrait paper (height >= width), maintain portrait grid (e.g. 2x4), else swap if landscape paper
    if (paperWidth > paperHeight && match.rows > match.columns) {
      return { columns: match.rows, rows: match.columns };
    }
    return { columns: match.columns, rows: match.rows };
  }

  // Fallback for custom arbitrary piece numbers
  let bestCols = 1;
  let bestRows = pieces;
  let minAspectDiff = Infinity;
  const paperAspect = paperWidth / paperHeight;

  for (let c = 1; c <= pieces; c++) {
    if (pieces % c === 0) {
      const r = pieces / c;
      const cellAspect = (paperWidth / c) / (paperHeight / r);
      const diff = Math.abs(cellAspect - paperAspect);
      if (diff < minAspectDiff) {
        minAspectDiff = diff;
        bestCols = c;
        bestRows = r;
      }
    }
  }

  return { columns: bestCols, rows: bestRows };
}

/**
 * Calculates exact cell width and cell height (in mm) for equal page division.
 */
export function calculateEqualDivision(
  params: EqualDivisionParams,
  unit: MeasurementUnit = "mm"
): EqualDivisionResult {
  const { pageSize, columns, rows } = params;
  const margin = params.margin !== undefined ? params.margin : pageSize.margin;
  const rowGap = params.rowGap !== undefined ? params.rowGap : 2;
  const columnGap = params.columnGap !== undefined ? params.columnGap : 2;

  const usableWidth = Math.max(0, pageSize.width - margin * 2);
  const usableHeight = Math.max(0, pageSize.height - margin * 2);

  const totalColGaps = Math.max(0, columns - 1) * columnGap;
  const totalRowGaps = Math.max(0, rows - 1) * rowGap;

  const totalAvailableWidth = Math.max(0, usableWidth - totalColGaps);
  const totalAvailableHeight = Math.max(0, usableHeight - totalRowGaps);

  const cellWidth = Math.max(0.1, totalAvailableWidth / Math.max(1, columns));
  const cellHeight = Math.max(0.1, totalAvailableHeight / Math.max(1, rows));

  // Floor to 1 decimal place to guarantee rounding never causes cell overflow past margins
  let roundedCellWidth = Math.floor(cellWidth * 10) / 10;
  let roundedCellHeight = Math.floor(cellHeight * 10) / 10;

  // Double-check strict boundaries
  while (columns > 0 && (columns * roundedCellWidth + totalColGaps) > usableWidth + 0.001) {
    roundedCellWidth = Math.max(0.1, Math.round((roundedCellWidth - 0.1) * 10) / 10);
  }
  while (rows > 0 && (rows * roundedCellHeight + totalRowGaps) > usableHeight + 0.001) {
    roundedCellHeight = Math.max(0.1, Math.round((roundedCellHeight - 0.1) * 10) / 10);
  }

  const formattedCellWidth = UnitConverter.formatDimension(roundedCellWidth, unit, 1);
  const formattedCellHeight = UnitConverter.formatDimension(roundedCellHeight, unit, 1);
  const formattedCellSizeLabel = `${formattedCellWidth} × ${formattedCellHeight}`;

  return {
    columns,
    rows,
    totalPieces: columns * rows,
    cellWidth: roundedCellWidth,
    cellHeight: roundedCellHeight,
    usableWidth,
    usableHeight,
    margin,
    rowGap,
    columnGap,
    formattedCellWidth,
    formattedCellHeight,
    formattedCellSizeLabel,
  };
}
