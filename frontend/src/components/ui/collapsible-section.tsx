"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Section } from './section';

interface CollapsibleSectionProps {
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  heading?: React.ReactNode;
  headingClassName?: string;
  children?: React.ReactNode;
  toggleButtonClassName?: string;
}

export function CollapsibleSection({
  defaultOpen = true,
  className,
  contentClassName,
  heading,
  headingClassName,
  children,
  toggleButtonClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('mb-10', className)}>
      {heading && (
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          className={cn('flex w-full items-center justify-between gap-2 text-left', headingClassName, toggleButtonClassName)}
        >
          <div className="flex-1">{heading}</div>
          <span
            className={cn(
              'inline-block transition-transform text-sm text-neutral-500',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
          >
            ▼
          </span>
        </button>
      )}
      {isOpen && (
        <Section className="mt-4" contentClassName={contentClassName}>
          {children}
        </Section>
      )}
    </div>
  );
}
