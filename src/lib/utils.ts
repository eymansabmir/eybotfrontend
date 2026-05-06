import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, fallback: string): string {
    const candidate = error as any;
    return candidate?.response?.data?.message || candidate?.message || fallback;
}
