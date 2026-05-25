import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global utility for correct WIB timezone date (UTC+7)
export function getTodayWIB(): string {
  // Use sv-SE for YYYY-MM-DD format guaranteed
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })
}
