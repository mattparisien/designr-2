import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Format date to readable string
export function formatDateAsString(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const differenceInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))

  if (differenceInDays === 0) {
    return "Today, " + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (differenceInDays === 1) {
    return "Yesterday, " + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (differenceInDays < 7) {
    return `${differenceInDays} days ago`
  } else {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    })
  }
}

export function getRelativeTime(date: Date | string): string {
  const inputDate = date instanceof Date ? date : new Date(date);
  const now = new Date();

  // Reset time part for accurate day comparison
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

  const differenceInTime = todayDate.getTime() - inputDateOnly.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

  if (differenceInDays === 0) {
    return "today";
  } else if (differenceInDays === 1) {
    return "yesterday";
  } else if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  } else if (differenceInDays < 30) {
    const weeks = Math.floor(differenceInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (differenceInDays < 365) {
    const months = Math.floor(differenceInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(differenceInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

export function mergeRefs<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined | null>
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export function addToRefArray<T>(item: T, refArray: T[]): void {
  if (!refArray.includes(item)) {
    refArray.push(item);
  }
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function formatBytes(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

export function addToRefArrayOfObjects<T extends Record<string, any>>(
  item: { id: string; node: HTMLElement } & T,
  refArray: Array<{ id: string; node: HTMLElement } & T>
): void {
  const existingIndex = refArray.findIndex(obj => obj.id === item.id);
  if (existingIndex === -1) {
    refArray.push(item);
  } else {
    refArray[existingIndex] = item; // Update existing item
  }
}