// Example of how to use the shared types package

// Import from the shared package using relative path
import { DesignElement, DesignCanvas } from '../../../shared/dist/types/design';

// Example function that uses the shared types
export function createNewCanvas(name: string): DesignCanvas {
  return {
    id: `canvas-${Date.now()}`,
    name,
    elements: []
  };
}

// Example function that creates a new element  
export function createTextElement(content: string): DesignElement {
  return {
    type: 'text',
    content,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 50 },
    fontSize: 16,
    color: '#000000',
    placeholder: 'Enter text here'
  };
}

// Function that works with canvas elements
export function addElementToCanvas(canvas: DesignCanvas, element: DesignElement): DesignCanvas {
  return {
    ...canvas,
    elements: [...canvas.elements, element]
  };
}
