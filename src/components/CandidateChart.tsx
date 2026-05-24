import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CandidateScore, PredictionItem } from "@/types/api";
import { humanize } from "@/lib/utils";

type CandidateChartProps = {
  candidates?: CandidateScore[];
  predictions?: PredictionItem[];
};

export function CandidateChart({ candidates = [], predictions = [] }: CandidateChartProps) {
  const data =
    candidates.length > 0
      ? candidates.map((item) => ({ name: humanize(item.disease), score: item.weighted_score, ratio: Math.round(item.matching_ratio * 100) }))
      : predictions.map((item) => ({ name: humanize(item.disease), score: item.confidence ?? 0, ratio: item.confidence ?? 0 }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No comparison data returned by the backend.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={76} tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" name="Weighted score / confidence" radius={[6, 6, 0, 0]} fill="#0f9f9a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
