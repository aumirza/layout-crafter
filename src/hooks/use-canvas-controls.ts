import { useState, useEffect, useCallback, useRef } from "react";

interface CanvasControlsState {
  zoom: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  isSpacePressed: boolean;
}

interface UseCanvasControlsProps {
  pageSize: { width: number; height: number };
}

export function useCanvasControls({ pageSize }: UseCanvasControlsProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Calculate fit-to-container zoom level
  const calculateFitZoom = useCallback(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return 100;

    const containerRect = containerEl.getBoundingClientRect();
    if (containerRect.width <= 0 || containerRect.height <= 0) return 100;

    // Calculate actual screen DPI (default to 96 DPI if not available)
    const dpi = (window.devicePixelRatio || 1) * 96;

    // Convert mm to pixels using screen DPI (1 inch = 25.4mm)
    const mmToPixels = (mm: number) => (mm / 25.4) * dpi;

    // Get actual paper dimensions in pixels at 100% zoom
    const paperWidthPx = mmToPixels(pageSize.width);
    const paperHeightPx = mmToPixels(pageSize.height);

    // Padding around paper for viewing comfort (accounting for rulers & floating controls toolbar)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const paddingX = isMobile ? 32 : 96;
    const paddingY = isMobile ? 80 : 120;

    const availableWidth = Math.max(40, containerRect.width - paddingX);
    const availableHeight = Math.max(40, containerRect.height - paddingY);

    // Calculate zoom levels needed to fit width and height
    const zoomForWidth = (availableWidth / paperWidthPx) * 100;
    const zoomForHeight = (availableHeight / paperHeightPx) * 100;

    // Use the smaller zoom to ensure both dimensions fit without overflowing
    const fitZoom = Math.min(zoomForWidth, zoomForHeight);

    // Constrain between 5% and 200% zoom to support small mobile screens & large paper formats
    return Math.max(5, Math.min(200, fitZoom));
  }, [pageSize.width, pageSize.height]);

  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Drag start position ref for smooth, un-throttled desktop mouse panning
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch state ref for 1-finger pan & 2-finger pinch zoom
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    lastTouchX: number;
    lastTouchY: number;
    isPinching: boolean;
  } | null>(null);

  // Set initial zoom to fit paper when container or page size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const fitZoom = calculateFitZoom();
      setZoom(fitZoom);
      setDragOffset({ x: 0, y: 0 });
    }, 10);
    return () => clearTimeout(timer);
  }, [calculateFitZoom, pageSize.width, pageSize.height]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev < 20 ? prev + 5 : prev + 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(5, prev <= 20 ? prev - 5 : prev - 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFitToContainer = () => {
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setDragOffset({ x: 0, y: 0 });
  };

  const calculateConstraints = useCallback(() => {
    const containerEl = canvasContainerRef.current;
    if (!containerEl) return null;

    const containerRect = containerEl.getBoundingClientRect();
    const dpi = (window.devicePixelRatio || 1) * 96;
    const mmToPixels = (mm: number) => (mm / 25.4) * dpi;

    const actualCanvasWidth = mmToPixels(pageSize.width) * (zoom / 100);
    const actualCanvasHeight = mmToPixels(pageSize.height) * (zoom / 100);

    const minVisibleArea = Math.min(80, Math.min(containerRect.width, containerRect.height) * 0.3);

    const halfContainerW = containerRect.width / 2;
    const halfContainerH = containerRect.height / 2;
    const halfCanvasW = actualCanvasWidth / 2;
    const halfCanvasH = actualCanvasHeight / 2;

    const maxOffsetX = Math.max(0, halfCanvasW - minVisibleArea + halfContainerW);
    const maxOffsetY = Math.max(0, halfCanvasH - minVisibleArea + halfContainerH);
    const minOffsetX = -maxOffsetX;
    const minOffsetY = -maxOffsetY;

    return { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY };
  }, [zoom, pageSize.width, pageSize.height]);

  // Constrain drag offset when zoom changes to prevent canvas from going out of bounds
  useEffect(() => {
    const constraints = calculateConstraints();
    if (!constraints) return;

    const { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY } = constraints;
    setDragOffset((prev) => ({
      x: Math.max(minOffsetX, Math.min(maxOffsetX, prev.x)),
      y: Math.max(minOffsetY, Math.min(maxOffsetY, prev.y)),
    }));
  }, [zoom, calculateConstraints]);

  // Mouse Down handler for desktop canvas dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Left-click (0), Middle-click (1), Right-click (2) with modifiers, or Space key + click
    if (
      e.button === 0 ||
      e.button === 1 ||
      (e.button === 2 && (e.ctrlKey || e.shiftKey)) ||
      isSpacePressed
    ) {
      if (e.button === 1 || (e.button === 2 && (e.ctrlKey || e.shiftKey)) || isSpacePressed) {
        e.preventDefault();
      }
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Stable Mouse Move handler using dragStartRef to avoid event unbinding during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      setDragOffset((prev) => {
        const constraints = calculateConstraints();
        if (!constraints) return prev;

        const { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY } = constraints;
        return {
          x: Math.max(minOffsetX, Math.min(maxOffsetX, prev.x + deltaX)),
          y: Math.max(minOffsetY, Math.min(maxOffsetY, prev.y + deltaY)),
        };
      });
    },
    [isDragging, calculateConstraints]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch controls for mobile (1-finger pan & 2-finger pinch zoom)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        touchStateRef.current = {
          initialDist: 0,
          initialZoom: zoom,
          lastTouchX: touch.clientX,
          lastTouchY: touch.clientY,
          isPinching: false,
        };
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        setIsDragging(true);
        touchStateRef.current = {
          initialDist: dist,
          initialZoom: zoom,
          lastTouchX: (t1.clientX + t2.clientX) / 2,
          lastTouchY: (t1.clientY + t2.clientY) / 2,
          isPinching: true,
        };
      }
    },
    [zoom]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStateRef.current) return;

      if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStateRef.current.lastTouchX;
        const deltaY = touch.clientY - touchStateRef.current.lastTouchY;
        touchStateRef.current.lastTouchX = touch.clientX;
        touchStateRef.current.lastTouchY = touch.clientY;

        setDragOffset((prev) => {
          const constraints = calculateConstraints();
          if (!constraints) return prev;
          const { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY } = constraints;
          return {
            x: Math.max(minOffsetX, Math.min(maxOffsetX, prev.x + deltaX)),
            y: Math.max(minOffsetY, Math.min(maxOffsetY, prev.y + deltaY)),
          };
        });
      } else if (e.touches.length === 2 && touchStateRef.current.isPinching) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

        if (touchStateRef.current.initialDist > 0) {
          const scale = currentDist / touchStateRef.current.initialDist;
          const targetZoom = Math.max(
            5,
            Math.min(200, Math.round(touchStateRef.current.initialZoom * scale))
          );
          setZoom(targetZoom);
        }

        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;
        const deltaX = centerX - touchStateRef.current.lastTouchX;
        const deltaY = centerY - touchStateRef.current.lastTouchY;
        touchStateRef.current.lastTouchX = centerX;
        touchStateRef.current.lastTouchY = centerY;

        setDragOffset((prev) => {
          const constraints = calculateConstraints();
          if (!constraints) return prev;
          const { maxOffsetX, maxOffsetY, minOffsetX, minOffsetY } = constraints;
          return {
            x: Math.max(minOffsetX, Math.min(maxOffsetX, prev.x + deltaX)),
            y: Math.max(minOffsetY, Math.min(maxOffsetY, prev.y + deltaY)),
          };
        });
      }
    },
    [calculateConstraints]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStateRef.current = null;
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      setZoom((prev) => Math.max(5, Math.min(200, prev + delta)));
    }
  }, []);

  const handleContextMenuNative = useCallback((e: Event) => {
    const mouseEvent = e as MouseEvent;
    if (mouseEvent.ctrlKey || mouseEvent.shiftKey) {
      e.preventDefault();
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const isEditingText =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    if (isEditingText) return;

    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      setIsSpacePressed(true);
    }
  }, []);

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isEditingText) return;

      if (e.code === "Space") {
        setIsSpacePressed(false);
        if (isDragging) {
          setIsDragging(false);
        }
      }
    },
    [isDragging]
  );

  // Global mousemove & mouseup listeners attached while dragging desktop mouse
  useEffect(() => {
    if (isDragging) {
      const onGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const onGlobalMouseUp = () => handleMouseUp();

      window.addEventListener("mousemove", onGlobalMouseMove);
      window.addEventListener("mouseup", onGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", onGlobalMouseMove);
        window.removeEventListener("mouseup", onGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Wheel & touch scroll prevention
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (canvasContainer) {
      canvasContainer.addEventListener("wheel", handleWheel, { passive: false });
      canvasContainer.addEventListener("contextmenu", handleContextMenuNative);

      const preventTouchScroll = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          if (e.cancelable) e.preventDefault();
        }
      };

      canvasContainer.addEventListener("touchmove", preventTouchScroll, { passive: false });

      return () => {
        canvasContainer.removeEventListener("wheel", handleWheel);
        canvasContainer.removeEventListener("contextmenu", handleContextMenuNative);
        canvasContainer.removeEventListener("touchmove", preventTouchScroll);
      };
    }
  }, [handleWheel, handleContextMenuNative]);

  // Keyboard listeners for space-drag
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    canvasContainerRef,
    zoom,
    isDragging,
    dragOffset,
    isSpacePressed,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleFitToContainer,
    handleMouseDown,
    handleMouseMove: handleMouseMove as unknown as (e: React.MouseEvent) => void,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  };
}
