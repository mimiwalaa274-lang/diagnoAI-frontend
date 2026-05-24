import { CheckCircle2 } from "lucide-react";
import { cn, humanize } from "@/lib/utils";

export function FindingChip({ finding, highlighted = false }: { finding: string; highlighted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
        highlighted ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-700",
      )}
    >
      {highlighted && <CheckCircle2 className="h-4 w-4" />}
      {humanize(finding)}
    </span>
  );
}
