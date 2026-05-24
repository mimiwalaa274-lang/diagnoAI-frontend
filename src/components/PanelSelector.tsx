import { Activity, CircleDot, Droplets, HeartPulse, PanelsTopLeft, TestTube2 } from "lucide-react";
import type { PanelName } from "@/types/api";
import { cn } from "@/lib/utils";

const panelMeta: Record<PanelName, { icon: typeof Activity; description: string }> = {
  CBC: { icon: Droplets, description: "Blood count patterns" },
  Diabetes: { icon: HeartPulse, description: "Glucose and metabolic risk" },
  Kidney: { icon: CircleDot, description: "Renal function markers" },
  Liver: { icon: TestTube2, description: "Liver enzyme profile" },
  Thyroid: { icon: PanelsTopLeft, description: "TSH, T3, and T4" },
};

export const supportedPanels = Object.keys(panelMeta) as PanelName[];

export function PanelSelector({ selected, onSelect }: { selected: PanelName; onSelect: (panel: PanelName) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {supportedPanels.map((panel) => {
        const Icon = panelMeta[panel].icon;
        const active = selected === panel;
        return (
          <button
            key={panel}
            type="button"
            onClick={() => onSelect(panel)}
            className={cn(
              "rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft",
              active && "border-primary bg-cyan-50 ring-2 ring-primary/20",
            )}
          >
            <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-slate-500")} />
            <p className="mt-3 font-semibold text-slate-950">{panel}</p>
            <p className="mt-1 text-sm text-muted-foreground">{panelMeta[panel].description}</p>
          </button>
        );
      })}
    </div>
  );
}
