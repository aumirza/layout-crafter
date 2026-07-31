import { forwardRef, useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Group,
  Image as KonvaImage,
  Text,
  Line,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { CollageState, CollageCell, CollageImage } from "@/types/collage";
import { UnitConverter } from "@/lib/unit-converter";
import { CanvasRenderer, loadImage } from "@/lib/canvas-renderer";
import { calculateImageTransform } from "@/lib/matrix-transform";

interface KonvaCollageCanvasProps {
  collageState: CollageState;
  selectedCellId?: string | null;
  onAssignImage: (rowIndex: number, colIndex: number, cellId: string) => void;
  onUpdateCellTransform?: (cellId: string, transform: any) => void;
}

function CellImageNode({
  cell,
  imageObj,
  cellWidth,
  cellHeight,
  isSelected,
  onSelect,
  onTransformChange,
  setTransformerTarget,
}: {
  cell: CollageCell;
  imageObj: CollageImage;
  cellWidth: number;
  cellHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onTransformChange?: (cellId: string, transform: any) => void;
  setTransformerTarget: (node: Konva.Image | null) => void;
}) {
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadImage(imageObj.src)
      .then((img) => {
        if (isMounted) setLoadedImg(img);
      })
      .catch((err) => {
        console.warn(`Failed to load image for cell ${cell.id}`, err);
      });
    return () => {
      isMounted = false;
    };
  }, [imageObj.src, cell.id]);

  useEffect(() => {
    if (isSelected && imageRef.current) {
      setTransformerTarget(imageRef.current);
    }
  }, [isSelected, loadedImg, setTransformerTarget]);

  if (!loadedImg) return null;

  const fit = cell.fit || imageObj.fit || "cover";
  const orientation = cell.orientation || imageObj.orientation || "auto";

  const baseTransform = calculateImageTransform(
    loadedImg.naturalWidth,
    loadedImg.naturalHeight,
    cellWidth,
    cellHeight,
    fit,
    orientation
  );

  const activeTransform = cell.transform
    ? { ...baseTransform, ...cell.transform }
    : imageObj.transform
    ? { ...baseTransform, ...imageObj.transform }
    : baseTransform;

  const drawWidth = activeTransform.cropWidth;
  const drawHeight = activeTransform.cropHeight;
  const initialX = cellWidth / 2 + activeTransform.x;
  const initialY = cellHeight / 2 + activeTransform.y;

  return (
    <KonvaImage
      ref={imageRef}
      image={loadedImg}
      x={initialX}
      y={initialY}
      width={drawWidth}
      height={drawHeight}
      offsetX={drawWidth / 2}
      offsetY={drawHeight / 2}
      scaleX={activeTransform.scaleX}
      scaleY={activeTransform.scaleY}
      rotation={activeTransform.rotation}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const node = e.target;
        const newOffsetX = node.x() - cellWidth / 2;
        const newOffsetY = node.y() - cellHeight / 2;
        if (onTransformChange) {
          onTransformChange(cell.id, {
            ...activeTransform,
            x: newOffsetX,
            y: newOffsetY,
          });
        }
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const newOffsetX = node.x() - cellWidth / 2;
        const newOffsetY = node.y() - cellHeight / 2;
        if (onTransformChange) {
          onTransformChange(cell.id, {
            ...activeTransform,
            x: newOffsetX,
            y: newOffsetY,
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }
      }}
    />
  );
}

export function exportKonvaStageToCanvas(
  stage: Konva.Stage,
  targetDpi: number = 300
): HTMLCanvasElement {
  if (!stage) return document.createElement("canvas");

  // Hide active selection Transformer nodes before rendering export canvas
  const transformers = stage.find("Transformer");
  transformers.forEach((t) => t.hide());

  const screenDpi = window.devicePixelRatio * 96;
  const pixelRatio = targetDpi / screenDpi;

  // Render direct GPU-cached high-DPI canvas from Konva Stage
  const canvas = stage.toCanvas({
    pixelRatio,
  });

  // Restore selection handles
  transformers.forEach((t) => t.show());
  const layer = stage.getLayers()?.[0];
  if (layer) {
    layer.batchDraw();
  }

  return canvas;
}

export const KonvaCollageCanvas = forwardRef<HTMLDivElement, KonvaCollageCanvasProps>(
  ({ collageState, selectedCellId, onAssignImage, onUpdateCellTransform }, ref) => {
    const {
      pageSize,
      layout,
      cells,
      images,
      rows,
      columns,
      selectedUnit,
      showCuttingMarkers,
      markerColor,
      rowGap,
      columnGap,
    } = collageState;

    const [transformerTarget, setTransformerTarget] = useState<Konva.Image | null>(null);
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const stageRef = useRef<Konva.Stage | null>(null);

    const dpi = window.devicePixelRatio * 96;
    const canvasDimensions = CanvasRenderer.getCanvasDimensions(pageSize, dpi);
    const cellDimensions = CanvasRenderer.getCellDimensions(layout, pageSize.margin, dpi);

    useEffect(() => {
      if (transformerRef.current && transformerTarget) {
        transformerRef.current.nodes([transformerTarget]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }, [transformerTarget, selectedCellId]);

    const formatDimension = (value: number): string => {
      return UnitConverter.formatDimension(value, selectedUnit, 1);
    };

    const imageMap = new Map<string, CollageImage>();
    images.forEach((img) => imageMap.set(img.id, img));

    return (
      <div className="flex flex-col items-center">
        <div
          className="mb-4 relative shadow-md bg-white"
          ref={(el) => {
            if (el) {
              (el as any).__konvaStage = stageRef.current;
            }
            if (ref) {
              if (typeof ref === "function") ref(el);
              else ref.current = el;
            }
          }}
        >
          <Stage
            ref={stageRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setTransformerTarget(null);
              }
            }}
          >
            <Layer>
              {/* Paper background */}
              <Rect
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                fill="#ffffff"
              />

              {/* Cells */}
              {cells.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellPos = CanvasRenderer.getCellPosition(
                    rowIndex,
                    colIndex,
                    cellDimensions,
                    rowGap,
                    columnGap,
                    dpi
                  );
                  const isSelected = selectedCellId === cell.id;
                  const imageObj = cell.imageId ? imageMap.get(cell.imageId) : null;

                  return (
                    <Group key={cell.id} x={cellPos.left} y={cellPos.top}>
                      {/* Cell Clipping Mask Group */}
                      <Group
                        clipX={0}
                        clipY={0}
                        clipWidth={cellPos.width}
                        clipHeight={cellPos.height}
                      >
                        {/* Cell Background Frame */}
                        <Rect
                          width={cellPos.width}
                          height={cellPos.height}
                          fill={imageObj ? "transparent" : "#f8fafc"}
                          stroke={isSelected ? "#3b82f6" : "#e2e8f0"}
                          strokeWidth={isSelected ? 2 : 1}
                          onClick={() => onAssignImage(rowIndex, colIndex, cell.id)}
                          onTap={() => onAssignImage(rowIndex, colIndex, cell.id)}
                        />

                        {/* Image inside Cell */}
                        {imageObj && (
                          <CellImageNode
                            cell={cell}
                            imageObj={imageObj}
                            cellWidth={cellPos.width}
                            cellHeight={cellPos.height}
                            isSelected={isSelected}
                            onSelect={() => onAssignImage(rowIndex, colIndex, cell.id)}
                            onTransformChange={onUpdateCellTransform}
                            setTransformerTarget={setTransformerTarget}
                          />
                        )}

                        {/* Empty cell placeholder text */}
                        {!imageObj && (
                          <Text
                            text="+ Empty Cell"
                            x={0}
                            y={cellPos.height / 2 - 6}
                            width={cellPos.width}
                            align="center"
                            fontSize={11}
                            fill="#94a3b8"
                            fontStyle="500"
                            onClick={() => onAssignImage(rowIndex, colIndex, cell.id)}
                            onTap={() => onAssignImage(rowIndex, colIndex, cell.id)}
                          />
                        )}
                      </Group>

                      {/* Cutting Markers per Cell */}
                      {showCuttingMarkers && (
                        <>
                          {/* Top Left */}
                          <Line
                            points={[0, 8, 0, 0, 8, 0]}
                            stroke={markerColor || "#9ca3af"}
                            strokeWidth={1}
                          />
                          {/* Top Right */}
                          <Line
                            points={[cellPos.width - 8, 0, cellPos.width, 0, cellPos.width, 8]}
                            stroke={markerColor || "#9ca3af"}
                            strokeWidth={1}
                          />
                          {/* Bottom Left */}
                          <Line
                            points={[0, cellPos.height - 8, 0, cellPos.height, 8, cellPos.height]}
                            stroke={markerColor || "#9ca3af"}
                            strokeWidth={1}
                          />
                          {/* Bottom Right */}
                          <Line
                            points={[
                              cellPos.width - 8,
                              cellPos.height,
                              cellPos.width,
                              cellPos.height,
                              cellPos.width,
                              cellPos.height - 8,
                            ]}
                            stroke={markerColor || "#9ca3af"}
                            strokeWidth={1}
                          />
                        </>
                      )}
                    </Group>
                  );
                })
              )}

              {/* Transformer overlay for selected active image */}
              {selectedCellId && transformerTarget && (
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={true}
                  keepRatio={false}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                    "top-center",
                    "bottom-center",
                  ]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-2 select-none">
          <p>
            {pageSize.label} - {formatDimension(pageSize.width)}×
            {formatDimension(pageSize.height)}(
            {cells.flat().filter((cell) => cell.imageId !== null).length} of{" "}
            {rows * columns} cells filled)
          </p>
          <p className="text-xs mt-1">
            Photo size: {formatDimension(layout.cellWidth)}×
            {formatDimension(layout.cellHeight)}
          </p>
        </div>
      </div>
    );
  }
);

KonvaCollageCanvas.displayName = "KonvaCollageCanvas";
