import { Element as CanvasElement } from "../../../lib/types/canvas";
import { memo } from "react";

interface ImageElementProps {
  element: CanvasElement;
}

export const ImageElement = memo(({ element }: ImageElementProps) => {
  if (element.kind !== "image") return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={element.src}
      alt={element.alt || "Canvas image"}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: element.opacity || 1,
        pointerEvents: "none", // Prevent image from capturing events
        userSelect: "none",
        display: "block"
      }}
      draggable={false}
      onError={(e) => {
        console.error("Failed to load image:", element.src);
        // Optionally set a fallback image or display error state
        e.currentTarget.style.backgroundColor = "#f3f4f6";
        e.currentTarget.style.border = "1px dashed #d1d5db";
        e.currentTarget.alt = "Failed to load image";
      }}
    />
  );
});

ImageElement.displayName = 'ImageElement';
