import { CollageState } from "@/types/collage";
import { CanvasRenderer, loadImage } from "@/lib/canvas-renderer";

/**
 * Generates a very low-resolution data URL thumbnail (e.g. max 160px) of the collage state.
 * Extremely lightweight (~3KB - 8KB) for fast loading in the project library grid.
 */
export async function generateLowResThumbnail(
  state: CollageState,
  targetWidth: number = 160
): Promise<string> {
  const { pageSize, layout, cells, rows, columns, rowGap, columnGap } = state;
  const aspectRatio = pageSize.height / (pageSize.width || 1);
  const targetHeight = Math.max(80, Math.round(targetWidth * aspectRatio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  // Draw paper background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw paper subtle inner border
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, targetWidth, targetHeight);

  // Calculate scale from mm to thumbnail pixels
  const scaleX = targetWidth / pageSize.width;
  const scaleY = targetHeight / pageSize.height;

  const marginPxX = pageSize.margin * scaleX;
  const marginPxY = pageSize.margin * scaleY;
  const cellWidthPx = layout.cellWidth * scaleX;
  const cellHeightPx = layout.cellHeight * scaleY;
  const rowGapPx = rowGap * scaleY;
  const colGapPx = columnGap * scaleX;

  // Render grid cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = cells[r]?.[c];
      const x = marginPxX + c * (cellWidthPx + colGapPx);
      const y = marginPxY + r * (cellHeightPx + rowGapPx);

      // Draw cell background container
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(x, y, cellWidthPx, cellHeightPx);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellWidthPx, cellHeightPx);

      // If cell has assigned image, draw thumbnail image inside cell bounds
      if (cell && cell.imageId) {
        const collageImg = state.images.find((img) => img.id === cell.imageId);
        if (collageImg && collageImg.src) {
          try {
            const imgEl = await loadImage(collageImg.src);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, cellWidthPx, cellHeightPx);
            ctx.clip();

            // Cover math for thumbnail cell
            const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight;
            const cellAspect = cellWidthPx / cellHeightPx;
            let drawW = cellWidthPx;
            let drawH = cellHeightPx;
            let drawX = x;
            let drawY = y;

            if (imgAspect > cellAspect) {
              drawW = cellHeightPx * imgAspect;
              drawX = x - (drawW - cellWidthPx) / 2;
            } else {
              drawH = cellWidthPx / imgAspect;
              drawY = y - (drawH - cellHeightPx) / 2;
            }

            ctx.drawImage(imgEl, drawX, drawY, drawW, drawH);
            ctx.restore();
          } catch {
            // Draw placeholder tint on image load failure
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(x, y, cellWidthPx, cellHeightPx);
          }
        }
      }
    }
  }

  // Export as low-quality JPEG (~0.5 quality for tiny payload size)
  return canvas.toDataURL("image/jpeg", 0.5);
}
