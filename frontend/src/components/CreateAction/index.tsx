"use client";

import React, { useId, useState} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // assumes a className merge util; replace with your own if needed
import { ChevronDown, Loader2 } from "lucide-react";

// If you're using shadcn/ui wrappers, keep these imports. Otherwise, swap for Radix primitives directly.
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import type { SelectionConfig } from "@/lib/types/config";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────────*/

export interface CreateItemData {
  key?: string;
  label?: string;
  description?: string;
  category?: string;
  data?: {
    files?: FileList;
    [k: string]: unknown;
  };
}

/** Common visual + behavior props shared by all action modes */
interface CreateActionBaseProps {
  label?: string; // Text on the trigger
  ariaLabel?: string; // Accessible label override
  icon?: React.ComponentType<{ className?: string }>; // Left icon
  rightIcon?: React.ComponentType<{ className?: string }>; // Right icon, e.g., chevron
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode; // Custom trigger content; if provided we render it asChild
}

/* Action modes (mutually exclusive) */
interface ButtonMode {
  mode: "button";
  onAction: () => void;
}

interface LinkMode {
  mode: "link";
  href: string;
  prefetch?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
}

interface PopoverMode {
  mode: "popover";
  config: SelectionConfig; // expects { categories: string[]; items: Array<CreateItemData & { key: string; category: string }>; }
  onSelect: (item: CreateItemData) => void;
  align?: "start" | "center" | "end";
}

interface ModalMode {
  mode: "modal";
  title?: string;
  description?: string;
  /**
   * Modal content. If a function, you receive a `close` callback so your content can close the dialog.
   */
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  open?: boolean; // Controlled
  onOpenChange?: (open: boolean) => void; // Controlled
}

interface UploadMode {
  mode: "upload";
  accept?: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
}

export type CreateActionProps = CreateActionBaseProps & (ButtonMode | LinkMode | PopoverMode | ModalMode | UploadMode);

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────────────────────────*/

export const CreateAction = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, CreateActionProps>(
  (props, ref) => {
    const {
      label = "Create",
      ariaLabel,
      icon: LeftIcon,
      rightIcon: RightIcon,
      isLoading = false,
      disabled = false,
      className,
      children,
      ...rest
    } = props as CreateActionProps & Record<string, unknown>;

    const isInteractiveDisabled = disabled || isLoading;

    const btnClasses = "flex items-center justify-center cursor-pointer hover:bg-neutral-200 px-2.5 py-1.5 rounded-lg gap-1";

    const renderTriggerContent = (withChevron = false) => (
      <span className="inline-flex items-center gap-2">
        {LeftIcon ? <LeftIcon className="h-4 w-4" /> : null}
        <span>{isLoading ? "Working…" : label}</span>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : withChevron ? (
          RightIcon ? <RightIcon className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        ) : RightIcon ? (
          <RightIcon className="h-4 w-4" />
        ) : null}
      </span>
    );

    /*
     * MODE: LINK
     */
    if (rest.mode === "link") {
      const { href, prefetch, target, rel } = rest as LinkMode;
      return (
        <Link
          href={href}
          prefetch={prefetch}
          target={target}
          rel={rel}
          aria-label={ariaLabel || label}
          className={cn(btnClasses, className)}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {children ?? renderTriggerContent(false)}
        </Link>
      );
    }

    /*
     * MODE: UPLOAD
     */
    if (rest.mode === "upload") {
      const { accept, multiple, onFiles } = rest as UploadMode;
      const inputId = useId();
      return (
        <label htmlFor={inputId} className={cn(btnClasses, "cursor-pointer", className)} aria-label={ariaLabel || label}>
          {children ?? renderTriggerContent(false)}
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            disabled={isInteractiveDisabled}
            onChange={(e) => e.target.files && onFiles(e.target.files)}
          />
        </label>
      );
    }

    /*
     * MODE: POPOVER
     */
    if (rest.mode === "popover") {
      const { config, onSelect, align = "start" } = rest as PopoverMode;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={ariaLabel || label}
              disabled={isInteractiveDisabled}
              className={cn(btnClasses, className)}
              ref={ref as React.Ref<HTMLButtonElement>}
            >
              {children ?? renderTriggerContent(true)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align={align}>
            <div className="max-h-96 overflow-y-auto">
              {config.categories.map((category) => (
                <div key={category} className="p-3 border-b border-gray-100 last:border-b-0">
                  <h3 className="text-sm font-medium text-neutral-500 mb-2 px-3">{category}</h3>
                  <div className="space-y-1">
                    {config.items
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <button
                          key={item.key}
                          onClick={() => onSelect(item)}
                          disabled={isInteractiveDisabled}
                          className="cursor-pointer w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium text-[0.97rem] text-black">{item.label}</div>
                          {item.description ? (
                            <div className="text-xs font-normal text-neutral-500">{item.description}</div>
                          ) : null}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    /*
     * MODE: MODAL
     */
    if (rest.mode === "modal") {
      const { title, description, content, open, onOpenChange } = rest as ModalMode;
      const [internalOpen, setInternalOpen] = useState<boolean>(false);
      const isControlled = typeof open === "boolean";
      const actualOpen = isControlled ? open : internalOpen;
      const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInternalOpen(v));

      const body = typeof content === "function" ? (content as (close: () => void) => React.ReactNode)(() => setOpen(false)) : content;

      return (
        <Dialog open={actualOpen} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={ariaLabel || label}
              disabled={isInteractiveDisabled}
              className={cn(btnClasses, className)}
              ref={ref as React.Ref<HTMLButtonElement>}
            >
              {children ?? renderTriggerContent(true)}
            </button>
          </DialogTrigger>
          <DialogContent>
            {(title || description) && (
              <DialogHeader>
                {title ? <DialogTitle>{title}</DialogTitle> : null}
                {description ? <DialogDescription>{description}</DialogDescription> : null}
              </DialogHeader>
            )}
            {body}
          </DialogContent>
        </Dialog>
      );
    }

    /*
     * MODE: BUTTON (default)
     */
    const { onAction } = rest as ButtonMode;
    return (
      <button
        type="button"
        aria-label={ariaLabel || label}
        disabled={isInteractiveDisabled}
        className={cn(btnClasses, className)}
        onClick={onAction}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {children ?? renderTriggerContent(false)}
      </button>
    );
  }
);
CreateAction.displayName = "CreateAction";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────────*/

function getButtonClasses({
  size,
  tone,
  disabled,
}: {
  size: CreateActionBaseProps["size"]; 
  tone: CreateActionBaseProps["tone"]; 
  disabled: boolean;
}) {
  const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-8 gap-1 px-2",
    md: "h-9 gap-2 px-3",
    lg: "h-11 gap-2 px-4 text-base",
  } as const;
  const tones = {
    primary: disabled
      ? "bg-blue-500/50 text-white"
      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600",
    neutral: disabled
      ? "bg-neutral-200 text-neutral-700"
      : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-400",
    danger: disabled
      ? "bg-red-500/50 text-white"
      : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  } as const;

  return cn(base, sizes[size || "md"], tones[tone || "primary"]);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Usage examples (remove in production)
 * ────────────────────────────────────────────────────────────────────────────*/

// 1) Simple button
// <CreateAction mode="button" label="Create" onAction={() => console.log("create")} />

// 2) Internal link
// <CreateAction mode="link" label="Go to templates" href="/templates" />

// 3) Upload
// <CreateAction mode="upload" label="Upload" accept="image/*" multiple onFiles={(files) => console.log(files)} />

// 4) Popover selection
// <CreateAction mode="popover" label="New…" config={config} onSelect={(item) => console.log(item)} />

// 5) Modal
// <CreateAction mode="modal" label="Open modal" title="Create new" content={(close) => (<div>Body <button onClick={close}>Done</button></div>)} />
