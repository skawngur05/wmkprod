import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Table structure update cache bust: 1760342267892
export const CACHE_BUST = 1760342267892;
