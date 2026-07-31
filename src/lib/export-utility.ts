import { jsPDF } from "jspdf";
import { ExportFormat, CollageState } from "@/types/collage";
import { toast } from "@/hooks/use-toast";
import { CanvasRenderer } from "@/lib/canvas-renderer";
import { exportKonvaStageToCanvas } from "@/components/KonvaCollageCanvas";

// Color conversion utility for oklch to hex
export const oklchToHex = (oklchString: string): string => {
  const oklchColorMap: Record<string, string> = {
    "oklch(1 0 0)": "#ffffff",
    "oklch(0.129 0.042 264.695)": "#020817",
    "oklch(0.208 0.042 265.755)": "#0f172a",
    "oklch(0.984 0.003 247.858)": "#f8fafc",
    "oklch(0.968 0.007 247.896)": "#f1f5f9",
    "oklch(0.554 0.046 257.417)": "#64748b",
    "oklch(0.577 0.245 27.325)": "#ef4444",
    "oklch(0.929 0.013 255.508)": "#e2e8f0",
    "oklch(0.704 0.04 256.788)": "#94a3b8",
    "oklch(0.646 0.222 41.116)": "#f97316",
    "oklch(0.6 0.118 184.704)": "#06b6d4",
    "oklch(0.398 0.07 227.392)": "#3b82f6",
    "oklch(0.828 0.189 84.429)": "#eab308",
    "oklch(0.769 0.188 70.08)": "#f59e0b",
    "oklch(0.279 0.041 260.031)": "#1e293b",
    "oklch(0.704 0.191 22.216)": "#dc2626",
    "oklch(1 0 0 / 10%)": "rgba(255, 255, 255, 0.1)",
    "oklch(1 0 0 / 15%)": "rgba(255, 255, 255, 0.15)",
    "oklch(0.551 0.027 264.364)": "#475569",
    "oklch(0.488 0.243 264.376)": "#3b82f6",
    "oklch(0.696 0.17 162.48)": "#10b981",
    "oklch(0.627 0.265 303.9)": "#8b5cf6",
    "oklch(0.645 0.246 16.439)": "#ef4444",
  };

  return oklchColorMap[oklchString] || oklchString;
};

// Convert CSS text to replace oklch functions
export const convertOklchInCSS = (cssText: string): string => {
  const oklchRegex = /oklch\([^)]+\)/g;
  return cssText.replace(oklchRegex, (match) => oklchToHex(match));
};

// Function to convert oklch colors in computed styles of an element
export const convertElementOklchColors = (element: HTMLElement): void => {
  const computedStyle = window.getComputedStyle(element);

  const colorProperties = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "boxShadow",
    "textShadow",
    "fill",
    "stroke",
  ];

  colorProperties.forEach((prop) => {
    const value = computedStyle.getPropertyValue(prop);
    if (value && (value.includes("oklch") || value.includes("var("))) {
      let convertedValue = value;

      if (value.includes("oklch")) {
        convertedValue = convertOklchInCSS(value);
      }

      if (value.includes("var(")) {
        convertedValue = convertedValue
          .replace(/var\(--background\)/g, "#ffffff")
          .replace(/var\(--foreground\)/g, "#020817")
          .replace(/var\(--muted\)/g, "#f1f5f9")
          .replace(/var\(--muted-foreground\)/g, "#64748b")
          .replace(/var\(--border\)/g, "#e2e8f0")
          .replace(/var\(--card\)/g, "#ffffff")
          .replace(/var\(--card-foreground\)/g, "#020817");
      }

      element.style.setProperty(prop, convertedValue, "important");
    }
  });

  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      convertElementOklchColors(child);
    }
  });
};

// Function to create canvas with proper DPI metadata
export const createHighDPICanvas = (
  sourceCanvas: HTMLCanvasElement,
  targetDPI: number
): HTMLCanvasElement => {
  const scaleFactor = targetDPI / 96;
  const newCanvas = document.createElement("canvas");
  const ctx = newCanvas.getContext("2d")!;

  newCanvas.width = sourceCanvas.width * scaleFactor;
  newCanvas.height = sourceCanvas.height * scaleFactor;

  ctx.scale(scaleFactor, scaleFactor);
  ctx.drawImage(sourceCanvas, 0, 0);

  return newCanvas;
};

// Function to create PNG with proper DPI metadata
export const createPNGWithDPI = async (
  canvas: HTMLCanvasElement,
  dpi: number
): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve(new Blob());
          return;
        }

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const ihdrEnd = 33;
          const pixelsPerMeter = Math.round(dpi * 39.3701);

          const pHYsLength = 9;
          const pHYsChunk = new Uint8Array(12 + pHYsLength);

          const lengthBytes = new Uint32Array([pHYsLength]);
          const lengthView = new DataView(lengthBytes.buffer);
          pHYsChunk[0] = lengthView.getUint8(3);
          pHYsChunk[1] = lengthView.getUint8(2);
          pHYsChunk[2] = lengthView.getUint8(1);
          pHYsChunk[3] = lengthView.getUint8(0);

          pHYsChunk[4] = 0x70; // 'p'
          pHYsChunk[5] = 0x48; // 'H'
          pHYsChunk[6] = 0x59; // 'Y'
          pHYsChunk[7] = 0x73; // 's'

          const pixelsView = new DataView(new ArrayBuffer(4));
          pixelsView.setUint32(0, pixelsPerMeter, false);

          pHYsChunk[8] = pixelsView.getUint8(0);
          pHYsChunk[9] = pixelsView.getUint8(1);
          pHYsChunk[10] = pixelsView.getUint8(2);
          pHYsChunk[11] = pixelsView.getUint8(3);

          pHYsChunk[12] = pixelsView.getUint8(0);
          pHYsChunk[13] = pixelsView.getUint8(1);
          pHYsChunk[14] = pixelsView.getUint8(2);
          pHYsChunk[15] = pixelsView.getUint8(3);

          pHYsChunk[16] = 0x01;

          pHYsChunk[17] = 0x00;
          pHYsChunk[18] = 0x00;
          pHYsChunk[19] = 0x00;
          pHYsChunk[20] = 0x00;

          const newPNG = new Uint8Array(uint8Array.length + pHYsChunk.length);
          newPNG.set(uint8Array.slice(0, ihdrEnd), 0);
          newPNG.set(pHYsChunk, ihdrEnd);
          newPNG.set(uint8Array.slice(ihdrEnd), ihdrEnd + pHYsChunk.length);

          const modifiedBlob = new Blob([newPNG], { type: "image/png" });
          resolve(modifiedBlob);
        } catch (error) {
          console.warn("Failed to inject DPI metadata, using original PNG:", error);
          resolve(blob);
        }
      },
      "image/png",
      1.0
    );
  });
};

export const canvasToHighDPIBlob = (
  canvas: HTMLCanvasElement,
  dpi: number
): Promise<Blob> => {
  return createPNGWithDPI(canvas, dpi);
};

export interface ExportOptions {
  collageState: CollageState;
  collageRef: React.RefObject<HTMLDivElement>;
  exportFormat: ExportFormat;
  customDpi: number;
  exportScale: number;
}

export async function exportCollage({
  collageState,
  collageRef,
  exportFormat,
  customDpi,
  exportScale,
}: ExportOptions): Promise<void> {
  const targetDpi = Math.round(customDpi * exportScale);
  const konvaStage = (collageRef.current as any)?.__konvaStage;

  let canvas: HTMLCanvasElement;
  if (collageState.useKonvaCanvas !== false && konvaStage) {
    canvas = exportKonvaStageToCanvas(konvaStage, targetDpi);
  } else {
    canvas = await CanvasRenderer.renderToCanvas(collageState, {
      dpi: targetDpi,
    });
  }

  if (exportFormat === "png") {
    const pngBlob = await createPNGWithDPI(canvas, customDpi);
    const url = URL.createObjectURL(pngBlob);

    const link = document.createElement("a");
    link.download = `collage-${Date.now()}.png`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `Your collage has been exported as PNG with ${customDpi} DPI metadata (${
        canvas.width
      }×${canvas.height}px at ${((customDpi / 96) * exportScale).toFixed(1)}x scale)`,
    });
  } else if (exportFormat === "pdf") {
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation:
        collageState.pageSize.width > collageState.pageSize.height
          ? "landscape"
          : "portrait",
      unit: "mm",
      format: [collageState.pageSize.width, collageState.pageSize.height],
    });

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      collageState.pageSize.width,
      collageState.pageSize.height
    );
    pdf.save(`collage-${Date.now()}.pdf`);

    toast({
      title: "Export complete",
      description: `Your collage has been exported as PDF at ${customDpi} DPI (${(
        (customDpi / 96) *
        exportScale
      ).toFixed(1)}x scale)`,
    });
  } else if (exportFormat === "print") {
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Collage</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
          }
          @media print {
            @page {
              size: ${
                collageState.pageSize.width > collageState.pageSize.height
                  ? "landscape"
                  : "portrait"
              };
              margin: 0;
            }
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" />
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(windowContent);
      printWindow.document.close();
    } else {
      toast({
        title: "Print error",
        description:
          "Unable to open print window. Please check your popup blocker settings.",
        variant: "destructive",
      });
    }

    toast({
      title: "Print prepared",
      description: "Print dialog should open shortly",
    });
  }
}
