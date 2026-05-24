import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WarningPanel({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-none">
      <CardContent className="space-y-2 p-4">
        {warnings.map((warning) => (
          <div key={warning} className="flex items-start gap-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{warning}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
