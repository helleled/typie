import { token } from '@typie/styled-system/tokens';

export type Ghost = {
  element: HTMLElement;
  offsetX: number;
  offsetY: number;
};

const createGhost = (sourceElement: HTMLElement, x: number, y: number): Ghost => {
  const rect = sourceElement.getBoundingClientRect();
  const ghostElement = document.createElement('div');

  const cloned = sourceElement.cloneNode(true) as HTMLElement;
  (cloned as unknown as { inert: boolean }).inert = true;
  cloned.setAttribute('aria-hidden', 'true');
  cloned.style.pointerEvents = 'none';
  ghostElement.append(cloned);

  ghostElement.style.position = 'fixed';
  ghostElement.style.width = `${rect.width}px`;
  ghostElement.style.height = `${rect.height}px`;
  ghostElement.style.opacity = '0.8';
  ghostElement.style.pointerEvents = 'none';
  ghostElement.style.zIndex = token('zIndex.ghost');
  ghostElement.style.left = `${rect.left}px`;
  ghostElement.style.top = `${rect.top}px`;

  document.body.append(ghostElement);

  return {
    element: ghostElement,
    offsetX: x - rect.left,
    offsetY: y - rect.top,
  };
};

const updateGhost = (ghost: Ghost, x: number, y: number) => {
  ghost.element.style.left = `${x - ghost.offsetX}px`;
  ghost.element.style.top = `${y - ghost.offsetY}px`;
};

const removeGhost = (ghost: Ghost) => {
  ghost.element.remove();
};

export type DndHandlerOptions = {
  threshold?: number;

  getDragTarget?: (e: PointerEvent) => HTMLElement | null;

  canStartDrag?: (e: PointerEvent, target: HTMLElement) => boolean;

  onDragStart?: (e: PointerEvent, target: HTMLElement) => void;

  onDragMove?: (e: PointerEvent) => void;

  onDragEnd?: (e: PointerEvent) => void;

  onDragCancel?: () => void;

  showGhost?: boolean;

  excludeSelectors?: string[];

  dragHandleSelector?: string;
};

export type DndHandlerState = {
  isDragging: boolean;
  ghost: Ghost | null;
};

export const createDndHandler = (node: HTMLElement, options: DndHandlerOptions) => {
  const {
    threshold = 10,
    getDragTarget,
    canStartDrag,
    onDragStart,
    onDragMove,
    onDragEnd,
    onDragCancel,
    showGhost = true,
    excludeSelectors = ['button', '[role="button"]', 'a[href]', 'input', 'textarea', 'select'],
    dragHandleSelector,
  } = options;

  let dragging = false;
  let isDragActive = false;
  let dragStartEvent: PointerEvent | null = null;
  let dragTarget: HTMLElement | null = null;
  let ghost: Ghost | null = null;
  let capturedPointerId: number | null = null;
  let animationFrameId: number | null = null;
  let hoveredTarget: HTMLElement | null = null;

  const updateCursor = (e: PointerEvent | null) => {
    if (dragging) {
      document.body.style.cursor = 'grabbing';
      return;
    }

    document.body.style.cursor = '';

    if (getDragTarget) {
      const target = e ? getDragTarget(e) : null;

      if (hoveredTarget && hoveredTarget !== target && hoveredTarget.isConnected) {
        hoveredTarget.style.cursor = '';
      }
      if (target?.isConnected) {
        target.style.cursor = 'grab';
      }
      hoveredTarget = target;
    } else {
      node.style.cursor = 'grab';
    }
  };

  const cleanup = () => {
    if (ghost) {
      removeGhost(ghost);
      ghost = null;
    }
    if (capturedPointerId !== null && node.isConnected) {
      try {
        node.releasePointerCapture(capturedPointerId);
      } catch {
        // Ignore errors if pointer capture release fails
      }
      capturedPointerId = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (hoveredTarget) {
      if (hoveredTarget.isConnected) {
        hoveredTarget.style.cursor = '';
      }
      hoveredTarget = null;
    }
    dragging = false;
    isDragActive = false;
    dragTarget = null;
    updateCursor(null);
  };

  const handlePointerCancel = () => {
    if (dragging) {
      cleanup();
      onDragCancel?.();
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !e.isPrimary) return;

    const target = e.target as HTMLElement;

    if (dragHandleSelector && !target.closest(dragHandleSelector)) {
      return;
    }

    if (excludeSelectors.some((selector) => target.closest(selector))) {
      return;
    }

    const extractedTarget = getDragTarget ? getDragTarget(e) : node;
    if (!extractedTarget) return;

    if (canStartDrag && !canStartDrag(e, extractedTarget)) {
      return;
    }

    dragging = true;
    dragStartEvent = e;
    dragTarget = extractedTarget;

    try {
      node.setPointerCapture(e.pointerId);
      capturedPointerId = e.pointerId;
    } catch {
      // Ignore errors if pointer capture fails
    }

    updateCursor(e);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(() => {
      if (!dragging) {
        updateCursor(e);
        animationFrameId = null;
        return;
      }

      if (!dragStartEvent || !dragTarget) return;

      const distance = Math.sqrt(Math.pow(e.clientX - dragStartEvent.clientX, 2) + Math.pow(e.clientY - dragStartEvent.clientY, 2));

      if (distance > threshold && !isDragActive) {
        isDragActive = true;
        if (showGhost) {
          ghost = createGhost(dragTarget, dragStartEvent.clientX, dragStartEvent.clientY);
        }
        onDragStart?.(dragStartEvent, dragTarget);
      }

      if (ghost) {
        updateGhost(ghost, e.clientX, e.clientY);
      }

      if (isDragActive) {
        onDragMove?.(e);
      }

      animationFrameId = null;
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (dragging) {
      const wasDragActive = isDragActive;
      cleanup();
      if (wasDragActive) {
        onDragEnd?.(e);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && dragging) {
      cleanup();
      onDragCancel?.();
    }
  };

  node.addEventListener('pointercancel', handlePointerCancel);
  node.addEventListener('pointerdown', handlePointerDown);
  node.addEventListener('pointermove', handlePointerMove);
  node.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('keydown', handleKeyDown);

  updateCursor(null);

  return {
    state: (): DndHandlerState => ({
      isDragging: dragging && isDragActive,
      ghost,
    }),
    destroy: () => {
      cleanup();
      node.removeEventListener('pointercancel', handlePointerCancel);
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
    },
  };
};
