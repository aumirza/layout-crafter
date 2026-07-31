import { ImageTransform, ImageFitOption, ImageOrientation } from "@/types/collage";

export interface CellBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Calculates explicit ImageTransform matrix parameters based on original source image dimensions
 * and the cell container size + fit & orientation settings.
 */
export function calculateImageTransform(
  imgWidth: number,
  imgHeight: number,
  cellWidth: number,
  cellHeight: number,
  fit: ImageFitOption = "cover",
  orientation: ImageOrientation = "auto"
): ImageTransform {
  // Determine effective rotation angle (in degrees) based on orientation
  let rotation = 0;
  if (orientation === "landscape") {
    rotation = 90;
  }

  // Swap effective cell dimensions if rotated by 90/270 degrees
  const isRotated = rotation % 180 !== 0;
  const targetWidth = isRotated ? cellHeight : cellWidth;
  const targetHeight = isRotated ? cellWidth : cellHeight;

  // Crop rectangle defaults to entire original source image
  const cropX = 0;
  const cropY = 0;
  const cropWidth = imgWidth;
  const cropHeight = imgHeight;

  let scaleX = 1;
  let scaleY = 1;
  const x = 0;
  const y = 0;

  if (fit === "fill") {
    // Stretch image to fill cell box exactly
    scaleX = targetWidth / imgWidth;
    scaleY = targetHeight / imgHeight;
  } else if (fit === "contain") {
    // Scale uniformly so entire image fits inside cell
    const scale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
    scaleX = scale;
    scaleY = scale;
  } else if (fit === "original") {
    // 1:1 scale (unscaled)
    scaleX = 1;
    scaleY = 1;
  } else {
    // "cover" (default): scale uniformly so image fills cell completely
    const scale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
    scaleX = scale;
    scaleY = scale;
  }

  return {
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  };
}

/**
 * Renders an HTMLImageElement or HTMLCanvasElement onto a CanvasRenderingContext2D
 * using the Canvas transformation matrix stack.
 *
 * Sequence: save() -> clip cell rect -> translate to cell center + offset -> rotate -> scale -> drawImage -> restore()
 */
export function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  cell: CellBounds,
  transform: ImageTransform
): void {
  ctx.save();

  // Clip rendering to the cell boundaries
  ctx.beginPath();
  ctx.rect(cell.left, cell.top, cell.width, cell.height);
  ctx.clip();

  // Move origin to cell center + transformation translation (x, y)
  const centerX = cell.left + cell.width / 2 + transform.x;
  const centerY = cell.top + cell.height / 2 + transform.y;
  ctx.translate(centerX, centerY);

  // Apply rotation (in radians)
  if (transform.rotation !== 0) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }

  // Apply scale
  ctx.scale(transform.scaleX, transform.scaleY);

  // Draw image centered on origin from crop rectangle
  const drawWidth = transform.cropWidth;
  const drawHeight = transform.cropHeight;
  const drawX = -drawWidth / 2;
  const drawY = -drawHeight / 2;

  ctx.drawImage(
    img,
    transform.cropX,
    transform.cropY,
    transform.cropWidth,
    transform.cropHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}
