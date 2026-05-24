import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ClipboardCheck, FlaskConical, MessageSquareText, Microscope, Waypoints } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: FlaskConical, title: "Lab values input", text: "The user enters numeric values for a selected panel." },
  { icon: BrainCircuit, title: "ML prediction", text: "A panel-specific model estimates possible patterns and confidence." },
  { icon: Microscope, title: "Finding detection", text: "Values are compared with normal ranges to detect abnormal findings." },
  { icon: Waypoints, title: "Ontology reasoning", text: "Findings are matched with ontology evidence and candidate rules." },
  { icon: ClipboardCheck, title: "Recommendations", text: "The backend returns tests, urgency, action, and specialist suggestions." },
  { icon: MessageSquareText, title: "Safe explanation", text: "The explanation is formatted cautiously and does not diagnose." },
];

export function HowItWorksPage() {
  return (
    <div className="page-shell space-y-8">
      <div>
        <h1 className="section-title">How it works</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          The platform combines statistical prediction with rule-based clinical context to produce explainable decision-support output.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div key={step.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card className="h-full shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-primary">
                    <step.icon className="h-5 w-5" />
                  </span>
                  {index < steps.length - 1 && <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />}
                </div>
                <p className="mt-5 font-semibold text-slate-950">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
