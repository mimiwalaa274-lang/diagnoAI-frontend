import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, FileText, Printer, Stethoscope } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CandidateChart } from "@/components/CandidateChart";
import { ConfidenceGauge } from "@/components/ConfidenceGauge";

import { FindingChip } from "@/components/FindingChip";
import { RecommendedTestsCard } from "@/components/RecommendedTestsCard";
import { ResultSummaryCard } from "@/components/ResultSummaryCard";
import { PatientStorytellingDashboard } from "@/components/PatientStorytellingDashboard";
import { WarningPanel } from "@/components/WarningPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { humanize, urgencyTone } from "@/lib/utils";
import type { PredictResponse } from "@/types/api";

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: PredictResponse } | null)?.result;

  if (!result) {
    return (
      <div className="page-shell">
        <Card>
          <CardContent className="grid gap-4 p-6">
            <h1 className="section-title">No report loaded</h1>
            <p className="text-muted-foreground">Start a new lab analysis to generate a decision-support report.</p>
            <Link to="/analyze">
              <Button>
                <ArrowLeft className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ontology = result.ontology_explanation;
  const disease = ontology?.disease ?? result.predictions[0]?.disease ?? "No clear possible condition returned";
  const supporting = new Set(ontology?.supporting_findings ?? []);

  return (
    <div className="page-shell space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="section-title">Decision-support report</h1>
          <p className="mt-2 text-muted-foreground">Cautious, explainable summary of the returned backend result.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/analyze")}>
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Export/Print Report
          </Button>
        </div>
      </motion.div>

      <ResultSummaryCard result={result} />

      <div className="grid gap-4 md:grid-cols-3">
        <ConfidenceGauge label="Final confidence" value={result.final_confidence} />
        <ConfidenceGauge label="ML confidence" value={result.ml_confidence} />
        <ConfidenceGauge label="Ontology confidence" value={result.ontology_confidence} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Main possible condition</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-3xl font-semibold text-slate-950">{humanize(disease)}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This is presented as a possible condition for clinical decision support, not a final diagnosis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge className={urgencyTone(ontology?.urgency)}>{humanize(ontology?.urgency ?? "Urgency not specified")}</Badge>
            <Badge className="border-cyan-200 bg-cyan-50 text-cyan-800">{humanize(ontology?.recommended_action)}</Badge>
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
              <Stethoscope className="mr-1 h-3.5 w-3.5" />
              {humanize(ontology?.specialist)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Detected findings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.findings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No abnormal findings were returned.</p>
            ) : (
              result.findings.map((finding) => <FindingChip key={finding} finding={finding} highlighted={supporting.has(finding)} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence matching</CardTitle>
          </CardHeader>
          <CardContent>
            {ontology ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {ontology.matched_findings_count} / {ontology.total_required_findings} findings matched
                  </span>
                  <span className="font-semibold text-primary">{Math.round(ontology.matching_ratio * 100)}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ontology.matching_ratio * 100)}%` }} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Weighted score: {ontology.weighted_score}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Ontology evidence was not available for this result.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Candidate comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateChart candidates={ontology?.candidate_scores} predictions={result.predictions} />
          </CardContent>
        </Card>
        <RecommendedTestsCard tests={ontology?.recommended_tests ?? []} />
      </div>

      <WarningPanel warnings={result.warnings} />

      {result.missing_features_filled.length > 0 && (
        <Card className="shadow-none">
          <CardContent className="flex gap-3 p-4 text-sm text-slate-700">
            <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
            Missing features filled by backend: {result.missing_features_filled.map(humanize).join(", ")}
          </CardContent>
        </Card>
      )}

      <PatientStorytellingDashboard result={result} />

      <Card className="shadow-none">
        <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
          <FileText className="mt-0.5 h-5 w-5" />
          Please review these results with a qualified clinician who can consider symptoms, history, medication, and repeat testing.
        </CardContent>
      </Card>
    </div>
  );
}
