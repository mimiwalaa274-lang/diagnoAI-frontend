import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DisclaimerCard({ text }: { text?: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50/80 shadow-none">
      <CardContent className="flex gap-3 p-4 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{text ?? "This system supports clinical decision-making and does not provide a final diagnosis."}</p>
      </CardContent>
    </Card>
  );
}
