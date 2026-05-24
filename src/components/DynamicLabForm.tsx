import { AlertCircle, Loader2, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NormalRange, NormalRangesByPanel, PanelName } from "@/types/api";
import { cn, humanize } from "@/lib/utils";

type DynamicLabFormProps = {
  panel: PanelName;
  ranges: NormalRangesByPanel;
  loading: boolean;
  onSubmit: (values: Record<string, number>) => Promise<void>;
};

export function DynamicLabForm({ panel, ranges, loading, onSubmit }: DynamicLabFormProps) {
  const tests = useMemo(() => Object.entries(ranges[panel] ?? {}) as [string, NormalRange][], [panel, ranges]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function abnormalTone(test: string, range: NormalRange) {
    const raw = values[test];
    if (raw === undefined || raw === "") return "border-input";
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) return "border-rose-300 bg-rose-50";
    if (numeric < range.low || numeric > range.high) return "border-amber-300 bg-amber-50";
    return "border-emerald-200 bg-emerald-50";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const numericValues: Record<string, number> = {};

    tests.forEach(([test]) => {
      const raw = values[test];
      if (raw === undefined || raw.trim() === "") return;
      const numeric = Number(raw);
      if (Number.isNaN(numeric)) {
        nextErrors[test] = "Enter a numeric value";
      } else {
        numericValues[test] = numeric;
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      await onSubmit(numericValues);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{panel} lab values</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {tests.map(([test, range]) => {
              const raw = values[test];
              const numeric = raw === undefined || raw === "" ? null : Number(raw);
              const abnormal = numeric !== null && !Number.isNaN(numeric) && (numeric < range.low || numeric > range.high);
              return (
                <label key={test} className="grid gap-2 rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-medium text-slate-900">{humanize(test)}</span>
                      <p className="text-xs text-muted-foreground">
                        Normal range: {range.low} - {range.high} {range.unit}
                      </p>
                    </div>
                    {abnormal && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        <AlertCircle className="h-3 w-3" />
                        Review
                      </span>
                    )}
                  </div>
                  <input
                    className={cn("h-11 rounded-md border px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30", abnormalTone(test, range))}
                    inputMode="decimal"
                    placeholder={`Enter ${humanize(test)} (${range.unit})`}
                    value={values[test] ?? ""}
                    onChange={(event) => setValues((current) => ({ ...current, [test]: event.target.value }))}
                  />
                  {errors[test] ? (
                    <p className="text-xs text-rose-600">{errors[test]}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Abnormal values are highlighted before analysis.</p>
                  )}
                </label>
              );
            })}
          </div>
          <Button type="submit" size="lg" disabled={loading || tests.length === 0} className="justify-self-start">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Analyze Results
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
