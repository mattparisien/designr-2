"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; // replace with your class merge util

/*
  A lightweight, CreateAction-compatible Dialog system.
  - Exposes composable parts (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose)
  - Supports controlled/uncontrolled usage via `open` & `onOpenChange`
  - Good defaults for focus management, a11y, and animations
*/

export interface DialogProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {}
export const Dialog = RadixDialog.Root;

export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

/* ────────────────────────────────────────────────────────────────────────────
 * Content
 * ────────────────────────────────────────────────────────────────────────────*/

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /**
   * Visual size of the modal sheet
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * If true, renders an X button in the top-right corner
   */
  showClose?: boolean;
}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  DialogContentProps
>(({ className, children, size = "md", showClose = true, ...props }, ref) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out data-[state=open]:fade-in"
      )} />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl bg-white p-6 shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-90 data-[state=closed]:fade-out-90",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showClose && (
          <RadixDialog.Close
            className={cn(
              "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center",
              "rounded-md text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </RadixDialog.Close>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
DialogContent.displayName = "DialogContent";

const sizeClasses: Record<NonNullable<DialogContentProps["size"]>, string> = {
  sm: "max-w-sm p-5",
  md: "max-w-lg p-6",
  lg: "max-w-2xl p-8",
  xl: "max-w-4xl p-10",
};

/* ────────────────────────────────────────────────────────────────────────────
 * Header / Title / Description / Footer
 * ────────────────────────────────────────────────────────────────────────────*/

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div className={cn("mb-4 space-y-1", className)} {...props} />
);

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Title> {}
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Description> {}
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={cn("text-sm text-neutral-600", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
  <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);

/* ────────────────────────────────────────────────────────────────────────────
 * Convenience wrapper for CreateAction (optional)
 * ────────────────────────────────────────────────────────────────────────────*/

/**
 * A high-level modal wrapper that accepts content as ReactNode or a render function.
 * Mirrors the API used by CreateAction's `mode="modal"`.
 */
export interface ModalShellProps extends Omit<DialogProps, "children"> {
  title?: string;
  description?: string;
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  size?: DialogContentProps["size"];
  showClose?: boolean;
}

export function ModalShell({ title, description, content, open, onOpenChange, size, showClose, ...rest }: ModalShellProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof open === "boolean";
  const actualOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInternalOpen(v));

  const body = typeof content === "function" ? content(() => setOpen(false)) : content;

  return (
    <Dialog open={actualOpen} onOpenChange={setOpen} {...rest}>
      <DialogContent size={size} showClose={showClose}>
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

/* ────────────────────────────────────────────────────────────────────────────
 * Usage examples (remove in production)
 * ────────────────────────────────────────────────────────────────────────────*/

// Uncontrolled
// <Dialog>
//   <DialogTrigger className="px-4 py-2 bg-blue-600 text-white rounded">Open Dialog</DialogTrigger>
//   <DialogContent size="md">
//     <DialogHeader>
//       <DialogTitle>Hello</DialogTitle>
//       <DialogDescription>This is a Radix-based dialog.</DialogDescription>
//     </DialogHeader>
//     <p>Body content…</p>
//     <DialogFooter>
//       <DialogClose className="rounded bg-neutral-200 px-3 py-1">Close</DialogClose>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>

// Controlled, CreateAction-style
// <ModalShell title="Create new" description="Pick options" content={(close) => (<div>Body <button onClick={close}>Done</button></div>)} />
