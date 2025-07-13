/* --------------------------------------------------------------
   TextEditor.tsx
   A lightweight, fully-controlled content-editable text editor
   with automatic height that *shrinks and grows* with its content.
   -------------------------------------------------------------- */
"use client";

import {
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  type TextAlignment
} from "../lib/constants";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */
interface TextEditorProps {
  /** The source of truth for the text shown in the editor */
  content: string;
  /** Font-size in px (default: 36) */
  fontSize?: number;
  /** Font-family for the text (default: Inter) */
  fontFamily?: string;
  /** Letter spacing in em units */
  letterSpacing?: number;
  /** Line height relative to font size */
  lineHeight?: number;
  /** Whether the surrounding element is currently selected */
  /** Propagates content changes to the parent */
  onChange: (content: string) => void;
  /** Sends the actual pixel height of the node to the parent */
  onHeightChange?: (height: number) => void;
  textAlign?: TextAlignment;
  /** Text formatting options */
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  isStrikethrough?: boolean;
  /** Text color */
  textColor?: string;
  /** Whether the editor is in editable mode */
  isEditable: boolean;
  /** Notifies the parent when editing should end */
  onEditingEnd?: () => void;
}

/* ------------------------------------------------------------------
   Component
   ------------------------------------------------------------------ */
export function TextEditor({
  content,
  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = "Inter",
  letterSpacing = 0,
  lineHeight = 1.2,
  onChange,
  onHeightChange,
  textAlign = DEFAULT_TEXT_ALIGN,
  isBold = false,
  isItalic = false,
  isUnderlined = false,
  isStrikethrough = false,
  textColor = "#000000",
  isEditable = false,
  onEditingEnd,
}: TextEditorProps) {
  /* ----------------------------------------------------------------
     Local state & refs
     ---------------------------------------------------------------- */
  const [localContent, setLocalContent] = useState<string>(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const hasInitialFocus = useRef<boolean>(false);
  
  // Debounced callbacks for performance
  const debouncedOnChange = useRef<NodeJS.Timeout | null>(null);
  const debouncedHeightChange = useRef<NodeJS.Timeout | null>(null);

  /* ----------------------------------------------------------------
     Preload font when fontFamily changes
     ---------------------------------------------------------------- */
  useEffect(() => {
    const preloadFont = async () => {
      if (fontFamily && fontFamily !== "Inter" && fontFamily !== "Arial") {
        try {
          const { fontsAPI } = await import('@/lib/api/index');
          const allFonts = await fontsAPI.getUserFonts();
          
          const font = allFonts.find((f: { family: string }) => f.family === fontFamily);
          if (font) {
            await fontsAPI.loadFont(font);
            console.log(`Preloaded font in TextEditor: ${fontFamily}`);
          }
        } catch (error) {
          console.warn(`Failed to preload font ${fontFamily}:`, error);
        }
      }
    };

    preloadFont();
  }, [fontFamily]);

  /* ----------------------------------------------------------------
     Sync incoming `content` prop → local state when not editing
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditable) {
      setLocalContent(content);
    }
  }, [content, isEditable]);

  // Remove commented out code
  
  /* ----------------------------------------------------------------
     Debounced functions for performance
     ---------------------------------------------------------------- */
  const updateContentDebounced = useCallback((newValue: string) => {
    if (debouncedOnChange.current) {
      clearTimeout(debouncedOnChange.current);
    }
    debouncedOnChange.current = setTimeout(() => {
      onChange(newValue);
    }, 150);
  }, [onChange]);

  const updateHeightDebounced = useCallback(() => {
    if (!onHeightChange) return;
    
    if (debouncedHeightChange.current) {
      clearTimeout(debouncedHeightChange.current);
    }
    debouncedHeightChange.current = setTimeout(() => {
      if (!editorRef.current) return;
      const newHeight = editorRef.current.scrollHeight;
      onHeightChange(newHeight);
    }, 100);
  }, [onHeightChange]);

  /* ----------------------------------------------------------------
     Handle user typing inside the contentEditable div
     ---------------------------------------------------------------- */
  const handleInput: React.FormEventHandler<HTMLDivElement> = useCallback(() => {
    if (!editorRef.current) return;

    // Update local content immediately for responsive UI
    const newValue = editorRef.current.innerText;
    setLocalContent(newValue);
    
    // Debounce the expensive operations
    updateContentDebounced(newValue);
    updateHeightDebounced();
  }, [updateContentDebounced, updateHeightDebounced]);

  /* ----------------------------------------------------------------
     Focus the editor when switching to edit mode
     ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditable || !editorRef.current) {
      hasInitialFocus.current = false;
      return;
    }

    // Only select all text on the initial focus, not on content updates
    if (!hasInitialFocus.current) {
      // Push the latest localContent into the DOM (once) before focus
      editorRef.current.innerText = localContent;
      editorRef.current.focus();

      // Select all text only on the very first focus event
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      
      hasInitialFocus.current = true;
    }
  }, [isEditable, localContent]);

  /* ----------------------------------------------------------------
     Recalculate and report height on style changes (not during editing)
     ---------------------------------------------------------------- */
  useLayoutEffect(() => {
    // Skip height calculation during editing to avoid performance issues
    if (isEditable || !editorRef.current || !onHeightChange) return;
    
    const newHeight = editorRef.current.scrollHeight;
    onHeightChange(newHeight);
  }, [fontSize, fontFamily, textAlign, isBold, isItalic, isUnderlined, isStrikethrough, textColor, isEditable, onHeightChange]);

  /* ----------------------------------------------------------------
     Common style object shared by read-only and edit states
     ---------------------------------------------------------------- */
  const baseStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    whiteSpace: "normal",
    lineHeight: lineHeight, // Use dynamic line height
    letterSpacing: `${letterSpacing}em`, // Use dynamic letter spacing
    overflow: "hidden",
    minHeight: "1em",
    padding: 0, // Keep consistent - no padding in base
    boxSizing: "border-box",
    direction: "ltr",
    textAlign: textAlign,
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: `${isUnderlined ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none",
    color: textColor,
    // Add text wrapping properties for non-editing mode
    wordBreak: "break-word",
    overflowWrap: "break-word",
    width: "100%",
    height: "100%",
  };

  // Styles for the editor - keep consistent with baseStyle
  const editorStyles = {
    width: "100%",
    height: "100%",
    outline: "none",
    lineHeight: lineHeight, // Use dynamic line height
    letterSpacing: `${letterSpacing}em`, // Use dynamic letter spacing
    fontSize: `${fontSize}px`,
    fontFamily,
    fontWeight: isBold ? "bold" : "normal",
    fontStyle: isItalic ? "italic" : "normal",
    textDecoration: `${isUnderlined ? "underline" : ""} ${isStrikethrough ? "line-through" : ""}`.trim() || "none",
    textAlign,
    color: textColor,
    padding: 0, // Match baseStyle - no padding
    margin: 0, // Ensure no margin
    border: "none", // Remove any border
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    position: "relative",
    zIndex: 0,
    // Constrain selection highlight within bounds
    overflow: "hidden", // Hide any overflow from selection
    display: "block", // Ensure block display
  } as const;

  /* ----------------------------------------------------------------
     Handle ending edit mode
     ---------------------------------------------------------------- */
  const handleBlur = useCallback(() => {
    if (onEditingEnd) {
      onEditingEnd();
    }
  }, [onEditingEnd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape" && onEditingEnd) {
      e.preventDefault();
      onEditingEnd();
    }
  }, [onEditingEnd]);

  /* ----------------------------------------------------------------
     Cleanup timeouts on unmount
     ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (debouncedOnChange.current) {
        clearTimeout(debouncedOnChange.current);
      }
      if (debouncedHeightChange.current) {
        clearTimeout(debouncedHeightChange.current);
      }
    };
  }, []);

  /* ----------------------------------------------------------------
     Render
     ---------------------------------------------------------------- */
  return (
    <div className="flex items-center justify-center">
      {isEditable ? (
        <div
          ref={editorRef}
          className="outline-none"
          style={editorStyles}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div
          className="select-none outline-none"
          style={baseStyle}
        >
          {localContent}
        </div>
      )}
    </div>
  );
}
