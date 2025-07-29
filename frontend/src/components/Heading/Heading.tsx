// components/Heading.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  /** The semantic HTML element to use (defaults to h1) */
  as?: HeadingLevel;

  /** The visual style level (e.g., styled like h1, h2, etc.) */
  styleLevel?: HeadingLevel;

  children: React.ReactNode;
  className?: string;
}

const Heading: React.FC<HeadingProps> = ({
  as = 1,
  styleLevel = as,
  children,
  className,
}) => {
  const Tag = `h${as}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={cn(
        'font-medium',
        {
          'text-4xl': styleLevel === 1,
          'text-3xl': styleLevel === 2,
          'text-2xl': styleLevel === 3,
          'text-xl': styleLevel === 4,
          'text-lg': styleLevel === 5,
          'text-base': styleLevel === 6,
        },
        className
      )}
    >
      {children}
    </Tag>
  );
};

export default Heading;
