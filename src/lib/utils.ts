import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → -
    .replace(/[^a-z0-9-]/g, "") // remove non-alphanumeric
    .replace(/-+/g, "-"); // collapse multiple -
