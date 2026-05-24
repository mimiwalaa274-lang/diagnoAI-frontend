import { BrainCircuit, Gauge, Layers3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import type { PredictResponse } from "@/types/api";
import { formatPercent, humanize } from "@/lib/utils";

export function ResultSummaryCard({ result }: { result: PredictResponse }) {
  return (
    <Card className="bg-gradient-to-br from-white to-cyan-50">
      <CardHeader>
        <CardTitle>Analysis summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Layers3} label="Panel" value={result.panel} helper="Selected lab group" />
        <MetricCard icon={Gauge} label="Final confidence" value={formatPercent(result.final_confidence)} helper={humanize(result.reasoning_mode)} />
        <MetricCard icon={BrainCircuit} label="ML status" value={humanize(result.ml_status)} helper="Model evidence strength" />
      </CardContent>
    </Card>
  );
}
