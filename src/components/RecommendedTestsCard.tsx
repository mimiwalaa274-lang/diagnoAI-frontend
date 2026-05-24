import { FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { humanize } from "@/lib/utils";

export function RecommendedTestsCard({ tests }: { tests: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended confirmatory tests</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {tests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No confirmatory tests were returned for this result.</p>
        ) : (
          tests.map((test) => (
            <div key={test} className="flex items-center gap-3 rounded-lg border bg-white p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-50 text-primary">
                <FlaskConical className="h-5 w-5" />
              </span>
              <span className="font-medium text-slate-800">{humanize(test)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
