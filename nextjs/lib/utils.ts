import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeDifference(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`
  } else if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    return "Today"
  }

}