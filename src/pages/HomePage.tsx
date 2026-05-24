import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ClipboardCheck, FlaskConical, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/medical-ai-hero.png";
import { DisclaimerCard } from "@/components/DisclaimerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const panels = ["CBC", "Diabetes", "Kidney", "Liver", "Thyroid"];
const features = [
  { icon: BrainCircuit, title: "AI lab analysis", text: "Machine learning reviews submitted lab values for possible patterns." },
  { icon: ClipboardCheck, title: "Explainable reasoning", text: "Ontology evidence shows which findings support each possible condition." },
  { icon: FlaskConical, title: "Recommended tests", text: "The system suggests confirmatory tests when evidence supports follow-up." },
  { icon: Stethoscope, title: "Specialist suggestion", text: "Results may include a relevant specialist for clinical review." },
  { icon: ShieldCheck, title: "Clinical safety", text: "Every page keeps wording cautious and avoids final diagnosis language." },
];

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/25" />
        <div className="container relative grid min-h-[620px] items-center py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <HeartPulse className="h-4 w-4" />
              Clinical decision support demo
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-normal md:text-6xl">Hybrid Medical AI Lab Decision Support</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50">
              A patient-friendly lab analysis platform combining machine learning, finding detection, ontology reasoning, and safe explanation formatting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/analyze">
                <Button size="lg">
                  Start Lab Analysis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="secondary">See Pipeline</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-shell space-y-10">
        <DisclaimerCard />
        <div>
          <h2 className="section-title">Supported lab panels</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {panels.map((panel) => (
              <Card key={panel} className="shadow-none">
                <CardContent className="p-5">
                  <p className="text-lg font-semibold text-slate-950">{panel}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Dynamic inputs with range-aware finding detection.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">Built for explainable review</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-none">
                <CardContent className="p-5">
                  <feature.icon className="h-7 w-7 text-primary" />
                  <p className="mt-4 font-semibold text-slate-950">{feature.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
