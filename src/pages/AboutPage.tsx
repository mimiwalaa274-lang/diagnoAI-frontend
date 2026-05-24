import { Eye, Lock, Scale, ShieldCheck, Stethoscope, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const topics = [
  { icon: ShieldCheck, title: "Clinical safety first", text: "The interface avoids diagnostic certainty and frames output as decision support." },
  { icon: Stethoscope, title: "Not a final diagnosis", text: "Only a qualified clinician can interpret results with full patient context." },
  { icon: Eye, title: "Explainable AI", text: "Findings, match ratios, confidence, and ontology evidence are shown clearly." },
  { icon: Lock, title: "Privacy note", text: "The demo sends entered lab values only to the configured backend API." },
  { icon: TriangleAlert, title: "Limitations", text: "Models may be uncertain, incomplete inputs may affect output, and ranges vary by lab." },
  { icon: Scale, title: "Responsible use", text: "Use the report to guide conversation, confirmatory tests, and clinician review." },
];

export function AboutPage() {
  return (
    <div className="page-shell space-y-8">
      <div>
        <h1 className="section-title">About & ethics</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          This graduation project demo is designed to be transparent, cautious, and useful for learning clinical decision-support workflows.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.title} className="shadow-none">
            <CardContent className="p-5">
              <topic.icon className="h-7 w-7 text-primary" />
              <p className="mt-4 font-semibold text-slate-950">{topic.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
