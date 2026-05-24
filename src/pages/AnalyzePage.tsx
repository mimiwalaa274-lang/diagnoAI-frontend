import { motion } from "framer-motion";
import { AlertTriangle, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DisclaimerCard } from "@/components/DisclaimerCard";
import { DynamicLabForm } from "@/components/DynamicLabForm";
import { PanelSelector, supportedPanels } from "@/components/PanelSelector";
import { Card, CardContent } from "@/components/ui/card";
import { fallbackRanges } from "@/data/fallbackRanges";
import { getPanels, predictLabResults } from "@/services/api";
import type { NormalRangesByPanel, PanelName } from "@/types/api";

export function AnalyzePage() {
  const [selectedPanel, setSelectedPanel] = useState<PanelName>("CBC");
  const [ranges, setRanges] = useState<NormalRangesByPanel>(fallbackRanges);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPanels()
      .then((data) => {
        setRanges(data.normal_ranges ?? fallbackRanges);
        setNotice(null);
      })
      .catch(() => {
        setRanges(fallbackRanges);
        setNotice("Backend panel metadata is unavailable, so local normal ranges are being used.");
      });
  }, []);

  async function handleSubmit(values: Record<string, number>) {
    setLoading(true);
    try {
      const result = await predictLabResults({ panel: selectedPanel, values });
      navigate("/results", { state: { result } });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Prediction request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Lab analysis</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Select a panel, enter available numeric lab values, and review possible decision-support evidence.
        </p>
      </motion.div>

      {notice && (
        <Card className="border-amber-200 bg-amber-50 shadow-none">
          <CardContent className="flex gap-3 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {notice}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-none">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Wifi className="h-4 w-4 text-primary" />
          API base URL: {import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}
        </CardContent>
      </Card>

      <PanelSelector selected={selectedPanel} onSelect={setSelectedPanel} />
      <DynamicLabForm panel={selectedPanel} ranges={ranges} loading={loading} onSubmit={handleSubmit} />
      <DisclaimerCard />
      <p className="text-xs text-muted-foreground">Available panels: {supportedPanels.join(", ")}</p>
    </div>
  );
}
