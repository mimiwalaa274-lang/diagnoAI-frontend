export type PanelName = "CBC" | "Diabetes" | "Kidney" | "Liver" | "Thyroid";

export type NormalRange = {
  low: number;
  high: number;
  unit: string;
  finding_low: string;
  finding_high: string;
};

export type NormalRangesByPanel = Record<string, Record<string, NormalRange>>;

export type HealthResponse = {
  status: string;
  models?: {
    loaded_panels?: Record<string, boolean>;
    errors?: Record<string, string>;
  };
  ontology_loaded?: boolean;
  ontology_error?: string | null;
  normal_ranges_loaded?: boolean;
};

export type PanelsResponse = {
  supported_panels: PanelName[];
  normal_ranges: NormalRangesByPanel;
  model_artifacts?: unknown;
};

export type PredictRequest = {
  panel: PanelName;
  values: Record<string, number>;
};

export type PredictionItem = {
  disease: string;
  confidence: number | null;
};

export type CandidateScore = {
  disease: string;
  supporting_findings: string[];
  matched_findings_count: number;
  total_required_findings: number;
  matching_ratio: number;
  weighted_score: number;
  strong_support: boolean;
};

export type OntologyExplanation = {
  disease: string;
  supporting_findings: string[];
  matched_findings_count: number;
  total_required_findings: number;
  matching_ratio: number;
  weighted_score: number;
  recommended_tests: string[];
  specialist: string | null;
  urgency: string | null;
  recommended_action: string | null;
  candidate_scores: CandidateScore[];
};

export type PredictResponse = {
  panel: string;
  ml_status: string;
  reasoning_mode: string;
  ml_confidence: number | null;
  ontology_confidence: number | null;
  final_confidence: number | null;
  predictions: PredictionItem[];
  findings: string[];
  ontology_explanation: OntologyExplanation | null;
  warnings: string[];
  missing_features_filled: string[];
  disclaimer: string;
  llm_explanation: string;
};
