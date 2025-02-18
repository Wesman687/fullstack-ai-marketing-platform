import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeDifference(dateString: string): string {
  const date = new Date(dateString);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Not a valid date string" // Or handle it differently, e.g., return an empty string
  }

  // If it's a valid date, proceed with the calculation
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return `${months} month${months > 1? "s": ""} ago`;
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1? "s": ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1? "s": ""} ago`;
  } else {
    return "Today";
  }
}
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}