import { formatPercent } from "@/lib/utils";

type ConfidenceGaugeProps = {
  label: string;
  value?: number | null;
};

export function ConfidenceGauge({ label, value }: ConfidenceGaugeProps) {
  const safeValue = value ?? 0;
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-primary">{formatPercent(value)}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${Math.min(100, safeValue)}%` }} />
      </div>
    </div>
  );
}
