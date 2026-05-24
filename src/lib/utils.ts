import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function humanize(value?: string | null) {
  if (!value) return "Not specified";
  return value.replace(/_/g, " ");
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return `${Math.round(value * 10) / 10}%`;
}

export function urgencyTone(urgency?: string | null) {
  const normalized = (urgency ?? "").toLowerCase();
  if (normalized.includes("urgent")) return "border-rose-200 bg-rose-50 text-rose-700";
  if (normalized.includes("soon")) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
