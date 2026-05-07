import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as any).response?.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null && "message" in data) return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
