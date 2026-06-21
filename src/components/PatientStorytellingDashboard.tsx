import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  HeartPulse,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  BookOpen,
  Apple,
  Ban,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { BiologicalVisualizer } from "@/components/BiologicalVisualizer";
import { cn, humanize } from "@/lib/utils";
import type { PredictResponse } from "@/types/api";

/* ═══════════════════════════════════════════════════════
   HELPERS — pure functions, no backend changes needed
   ═══════════════════════════════════════════════════════ */

/** Panel → friendly body-system metaphor */
const PANEL_META: Record<string, { icon: typeof Heart; title: string; metaphor: string; healthyDesc: string; affectedDesc: string }> = {
  Diabetes: {
    icon: Zap,
    title: "Your Body's Energy Engine",
    metaphor: "Think of your blood sugar like fuel in a tank. Your pancreas is the valve that controls how much fuel your cells receive.",
    healthyDesc: "Your fuel valve works smoothly — sugar enters your cells at a steady, balanced rate. Energy flows like a calm river.",
    affectedDesc: "Your fuel tank is overfilled or the valve is struggling — sugar builds up in your bloodstream instead of powering your cells efficiently.",
  },
  CBC: {
    icon: HeartPulse,
    title: "Your Blood's Transport Network",
    metaphor: "Your blood is like a delivery fleet. Red cells carry oxygen, white cells guard against invaders, and platelets patch up any damage.",
    healthyDesc: "Your fleet is fully staffed — oxygen deliveries are on time and defenses are well-balanced.",
    affectedDesc: "Some trucks in your fleet are missing or overloaded — deliveries may be delayed and defenses shifted.",
  },
  Kidney: {
    icon: Activity,
    title: "Your Body's Filtration Plant",
    metaphor: "Your kidneys act like a water treatment plant — filtering waste while keeping the nutrients your body needs.",
    healthyDesc: "Your filters are clean and efficient — waste leaves smoothly while essential minerals stay in balance.",
    affectedDesc: "Your filters are strained — some waste may not clear properly, and mineral levels could shift.",
  },
  Liver: {
    icon: ShieldCheck,
    title: "Your Internal Processing Factory",
    metaphor: "Your liver is the body's chemical factory — it breaks down toxins, processes nutrients, and produces vital proteins.",
    healthyDesc: "Your factory runs at full capacity — toxins are cleared, proteins are produced, and everything is in balance.",
    affectedDesc: "Your factory is working overtime or under strain — some processing pathways may be backed up.",
  },
  Thyroid: {
    icon: Sparkles,
    title: "Your Metabolic Thermostat",
    metaphor: "Your thyroid sets the pace for your entire body — like a thermostat that controls how fast or slow your metabolism runs.",
    healthyDesc: "Your thermostat is set just right — energy production, heart rate, and body temperature are all balanced.",
    affectedDesc: "Your thermostat is set too high or too low — your body's pace may feel rushed or sluggish.",
  },
};

const DEFAULT_META = {
  icon: Heart,
  title: "Your Body's Internal System",
  metaphor: "Your body works like a finely-tuned machine where every component plays a vital role.",
  healthyDesc: "All systems are operating within their normal ranges.",
  affectedDesc: "Some values have shifted outside the normal range and may need attention.",
};

function isHighFinding(f: string) { return /high|elevated|hyper|excess/i.test(f); }
function isLowFinding(f: string)  { return /low|deficiency|hypo|reduced|anemia/i.test(f); }

/** Map raw finding strings to simple patient-friendly descriptions */
function friendlyFinding(finding: string): { label: string; simple: string; direction: "up" | "down" | "neutral" } {
  const fl = finding.toLowerCase();

  // Diabetes findings
  if (fl.includes("hba1c") && isHighFinding(fl))
    return { label: finding, simple: "Your long-term blood sugar average is higher than normal", direction: "up" };
  if (fl.includes("glucose") && isHighFinding(fl))
    return { label: finding, simple: "Your blood sugar level is elevated right now", direction: "up" };
  if (fl.includes("hypoglycemia") || (fl.includes("glucose") && isLowFinding(fl)))
    return { label: finding, simple: "Your blood sugar dropped below the safe range", direction: "down" };

  // CBC findings
  if (fl.includes("hemoglobin") && isLowFinding(fl))
    return { label: finding, simple: "The oxygen-carrying part of your blood is lower than expected", direction: "down" };
  if (fl.includes("wbc") && isHighFinding(fl))
    return { label: finding, simple: "Your white blood cell count is elevated, which may signal your body fighting something", direction: "up" };
  if (fl.includes("platelet") && isLowFinding(fl))
    return { label: finding, simple: "Your blood clotting cells are lower than normal", direction: "down" };

  // Kidney findings
  if (fl.includes("creatinine") && isHighFinding(fl))
    return { label: finding, simple: "A waste product in your blood is higher than normal, suggesting your kidneys may be working harder", direction: "up" };
  if (fl.includes("bun") && isHighFinding(fl))
    return { label: finding, simple: "Blood urea nitrogen is elevated, which may indicate kidney stress", direction: "up" };

  // Liver findings
  if ((fl.includes("alt") || fl.includes("ast")) && isHighFinding(fl))
    return { label: finding, simple: "Liver enzyme levels are elevated, suggesting your liver may be under strain", direction: "up" };
  if (fl.includes("bilirubin") && isHighFinding(fl))
    return { label: finding, simple: "Bilirubin is elevated, which may indicate your liver is processing more than usual", direction: "up" };

  // Thyroid findings
  if (fl.includes("tsh") && isHighFinding(fl))
    return { label: finding, simple: "Your thyroid-stimulating hormone is high, which may suggest an underactive thyroid", direction: "up" };
  if (fl.includes("tsh") && isLowFinding(fl))
    return { label: finding, simple: "Your thyroid-stimulating hormone is low, which may suggest an overactive thyroid", direction: "down" };

  // Generic fallback
  if (isHighFinding(fl)) return { label: finding, simple: `${humanize(finding)} is above the normal range`, direction: "up" };
  if (isLowFinding(fl))  return { label: finding, simple: `${humanize(finding)} is below the normal range`, direction: "down" };
  return { label: finding, simple: humanize(finding), direction: "neutral" };
}

/** Build a cause → process → effect chain from findings + panel */
function buildCauseEffect(panel: string, findings: string[], condition: string) {
  const steps: { icon: typeof Eye; title: string; text: string; color: string }[] = [];
  const p = panel.toLowerCase();

  if (findings.length === 0) {
    steps.push(
      { icon: Eye, title: "Detection", text: "No significant abnormalities detected in your lab results.", color: "emerald" },
      { icon: Activity, title: "Body Response", text: "Your body's systems appear to be functioning within normal parameters.", color: "emerald" },
      { icon: Heart, title: "How You May Feel", text: "You should feel normal — keep up your healthy habits!", color: "emerald" },
    );
    return steps;
  }

  // Step 1 — Detection
  const findingsSummary = findings.map(f => humanize(f)).join(", ");
  steps.push({
    icon: Eye,
    title: "What Was Detected",
    text: `Your lab results show: ${findingsSummary}.`,
    color: "amber",
  });

  // Step 2 — Biological process
  if (p === "diabetes") {
    const hasHighSugar = findings.some(f => /hba1c|glucose|hyperglycemia/i.test(f) && isHighFinding(f));
    const hasLowSugar  = findings.some(f => /hypoglycemia/i.test(f) || (isLowFinding(f) && /glucose/i.test(f)));
    if (hasHighSugar && hasLowSugar)
      steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your blood sugar swings between highs and lows — your pancreas may struggle to maintain a steady fuel supply, causing unpredictable energy spikes and crashes.", color: "orange" });
    else if (hasHighSugar)
      steps.push({ icon: Activity, title: "What This Means Biologically", text: "Sugar is accumulating in your bloodstream because your body's insulin system isn't clearing it efficiently — like a fuel line that's partially blocked.", color: "orange" });
    else if (hasLowSugar)
      steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your blood sugar dropped too low — your body's fuel reserves ran short, which can make you feel weak or shaky.", color: "orange" });
    else
      steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your metabolic indicators suggest your blood sugar management system may need attention.", color: "orange" });
  } else if (p === "cbc") {
    steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your blood cell counts have shifted — this can affect how well oxygen travels through your body and how effectively your immune system responds.", color: "orange" });
  } else if (p === "kidney") {
    steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your kidney's filtration efficiency may be affected — waste products could be building up instead of being cleared normally.", color: "orange" });
  } else if (p === "liver") {
    steps.push({ icon: Activity, title: "What This Means Biologically", text: "Your liver's processing pathways show signs of strain — enzymes leaking into your bloodstream suggest the chemical factory is working under extra load.", color: "orange" });
  } else if (p === "thyroid") {
    const isHyper = findings.some(f => /hyper|high/i.test(f));
    steps.push({ icon: Activity, title: "What This Means Biologically", text: isHyper
      ? "Your thyroid is producing more hormones than needed — your body's metabolic thermostat is turned up too high."
      : "Your thyroid may not be producing enough hormones — your body's metabolic thermostat is set too low.", color: "orange" });
  } else {
    steps.push({ icon: Activity, title: "What This Means Biologically", text: "Some of your body's internal processes show changes that may need professional evaluation.", color: "orange" });
  }

  // Step 3 — Patient-level effect
  const isHealthy = /healthy/i.test(condition);
  steps.push({
    icon: Heart,
    title: "What This Could Mean For You",
    text: isHealthy
      ? "Despite some lab value changes, your overall picture looks reassuring. Continue regular check-ups and maintain healthy habits."
      : "These changes may affect your day-to-day wellbeing. A healthcare professional can help you understand what steps, if any, are appropriate.",
    color: isHealthy ? "emerald" : "rose",
  });

  return steps;
}

type Recommendation = {
  diet: string[];
  avoid: string[];
  lifestyle: string[];
  followUp: string[];
};

const DISEASE_RECOMMENDATIONS: Record<string, Recommendation> = {
  diabetes: {
    diet: [
      "Focus on high-fiber foods such as leafy greens, broccoli, oats, and quinoa.",
      "Include clean proteins like skinless poultry, fresh fish, tofu, and legumes.",
      "Incorporate healthy fats in moderation, such as avocados, raw nuts, and extra virgin olive oil."
    ],
    avoid: [
      "Sugary beverages including sodas, sweetened teas, energy drinks, and fruit juices.",
      "Refined carbohydrates such as white bread, white rice, pastries, and sugary cereals.",
      "Processed meats and deep-fried foods containing unhealthy trans-fats."
    ],
    lifestyle: [
      "Aim for at least 30 minutes of moderate aerobic exercise (e.g., brisk walking) 5 days a week.",
      "Monitor blood glucose levels regularly at home and keep a log for your doctor.",
      "Maintain a consistent meal schedule to help stabilize blood sugar levels throughout the day."
    ],
    followUp: [
      "Schedule a follow-up HbA1c blood test in 3 months to monitor long-term control.",
      "Have an annual diabetic eye exam and kidney function check (e.g., microalbuminuria).",
      "Regularly examine your feet daily for any cuts, blisters, or signs of irritation."
    ]
  },
  anemia: {
    diet: [
      "Eat iron-rich foods such as lean red meat, poultry, seafood, lentils, and beans.",
      "Consume dark leafy greens like spinach, Swiss chard, and kale.",
      "Pair iron-rich foods with Vitamin C (citrus fruits, bell peppers) to boost absorption."
    ],
    avoid: [
      "Drinking tea or coffee with meals, as tannins can block iron absorption.",
      "Consuming calcium-rich foods or dairy at the exact same time as your iron-rich meals."
    ],
    lifestyle: [
      "Ensure you get adequate rest and aim for 7-9 hours of quality sleep nightly.",
      "Pace your physical activities to avoid sudden fatigue or shortness of breath.",
      "Avoid standing up too quickly if you are feeling lightheaded or dizzy."
    ],
    followUp: [
      "Re-check complete blood count (CBC) and ferritin levels in 4-6 weeks to track progress.",
      "Consult your doctor regarding iron or Vitamin B12/folate supplementation dosage."
    ]
  },
  infection: {
    diet: [
      "Stay well-hydrated by drinking plenty of water, clear broths, and decaffeinated herbal teas.",
      "Consume immune-supporting foods rich in Vitamin C, Vitamin D, and zinc.",
      "Focus on easily digestible, nutrient-dense meals like soups and stews."
    ],
    avoid: [
      "High-sugar foods and drinks, which can promote systemic inflammation.",
      "Alcohol and excessive caffeine, as they can lead to dehydration and slow recovery."
    ],
    lifestyle: [
      "Prioritize strict bed rest to conserve energy for your body's immune defense.",
      "Practice meticulous hygiene, including frequent handwashing, to prevent reinfection.",
      "Track your temperature and pulse rate twice daily during acute symptoms."
    ],
    followUp: [
      "Repeat white blood cell (WBC) count check if symptoms persist beyond 5-7 days.",
      "Seek immediate medical attention if you develop high fever, breathing difficulties, or severe fatigue."
    ]
  },
  kidney: {
    diet: [
      "Follow a kidney-friendly diet with controlled, high-quality protein portions.",
      "Choose fresh, unprocessed ingredients to naturally limit sodium intake.",
      "Opt for lower-potassium fruits and vegetables (apples, berries, cabbage)."
    ],
    avoid: [
      "High-sodium items such as table salt, canned soups, processed meats, and soy sauce.",
      "High-potassium foods (bananas, potatoes) and high-phosphorus foods (cola, dairy) as advised."
    ],
    lifestyle: [
      "Maintain strict control over blood pressure and blood sugar levels.",
      "Drink an adequate amount of water daily (unless fluid-restricted by a nephrologist).",
      "Avoid over-the-counter NSAID pain relievers (like ibuprofen) which can place stress on kidneys."
    ],
    followUp: [
      "Schedule regular kidney function checkups (eGFR and Creatinine) as recommended.",
      "Review all prescription and over-the-counter medications with a physician."
    ]
  },
  liver: {
    diet: [
      "Eat a balanced diet rich in vegetables, fruits, and high-fiber whole foods.",
      "Incorporate healthy fats such as extra virgin olive oil, walnuts, and seeds.",
      "Eat cruciferous vegetables (broccoli, Brussels sprouts) to support liver detoxification."
    ],
    avoid: [
      "Alcohol in any amount, as it directly stresses liver tissues and slows regeneration.",
      "Highly processed foods, refined sugars, high-fructose corn syrup, and saturated fats."
    ],
    lifestyle: [
      "Maintain a healthy weight through active living and portion control.",
      "Engage in regular, moderate aerobic exercise to reduce liver fat accumulation.",
      "Avoid self-medicating with unnecessary pills or unverified herbal supplements."
    ],
    followUp: [
      "Repeat liver function tests (ALT, AST, Bilirubin) in 2-4 weeks to monitor enzyme trends.",
      "Consider an abdominal ultrasound if liver enzymes remain persistently elevated."
    ]
  },
  thyroid_hypo: {
    diet: [
      "Ensure sufficient intake of iodine (seafood, dairy) and selenium (Brazil nuts, eggs).",
      "Eat a fiber-rich diet to help support digestion, which can slow down in hypothyroidism."
    ],
    avoid: [
      "Soy products and raw goitrogenic vegetables (like cabbage or kale) close to medication times.",
      "Excessive gluten if you have autoimmune thyroid issues (consult your doctor)."
    ],
    lifestyle: [
      "Take thyroid hormone replacement medication on an empty stomach, 30-60 mins before breakfast.",
      "Incorporate gentle daily exercise to boost metabolic rate and energy levels."
    ],
    followUp: [
      "Re-evaluate TSH and Free T4 levels in 6-8 weeks to check medication dosage efficacy.",
      "Keep a log of symptoms like fatigue, weight changes, and cold sensitivity."
    ]
  },
  thyroid_hyper: {
    diet: [
      "Eat calorie-dense, nutritious foods if experiencing rapid weight loss.",
      "Include calcium and Vitamin D-rich foods to protect bone health.",
      "Eat cruciferous vegetables, which can naturally help reduce thyroid hormone production."
    ],
    avoid: [
      "Excessive iodine (kelp, seaweed, iodized salt) which can exacerbate hyperthyroidism.",
      "Caffeine and stimulants that can worsen heart palpitations and anxiety."
    ],
    lifestyle: [
      "Practice stress-management techniques (meditation, deep breathing) to calm the nervous system.",
      "Monitor your heart rate regularly and avoid strenuous exercise during active flare-ups."
    ],
    followUp: [
      "Schedule frequent thyroid panel checkups (TSH, T3, T4) to track response to treatment.",
      "Consult an endocrinologist for specialized medical therapy options."
    ]
  },
  thyroid_general: {
    diet: [
      "Eat a balanced diet high in antioxidants, lean proteins, and fiber.",
      "Incorporate healthy fats such as seeds, nuts, and olive oil."
    ],
    avoid: [
      "Processed foods, excessive sugars, and trans-fats which promote cellular inflammation."
    ],
    lifestyle: [
      "Establish a consistent sleep schedule to support hormonal balance.",
      "Maintain regular physical checkups to monitor endocrine health."
    ],
    followUp: [
      "Repeat thyroid screening annually or as advised by your healthcare provider."
    ]
  },
  default: {
    diet: [
      "Maintain a balanced diet rich in whole foods, vegetables, fruits, and lean proteins.",
      "Stay hydrated by drinking at least 8 glasses of water daily."
    ],
    avoid: [
      "Highly processed foods, excessive sugars, and foods high in trans-fats."
    ],
    lifestyle: [
      "Aim for 150 minutes of moderate exercise weekly (e.g., walking, cycling).",
      "Get 7-8 hours of quality sleep each night and practice stress reduction."
    ],
    followUp: [
      "Share these lab results with your primary care physician for a full evaluation.",
      "Schedule routine annual checkups to track your key health markers."
    ]
  },
  healthy_diabetes: {
    diet: [
      "Focus on whole grains, fresh vegetables, and lean proteins to support stable blood sugar.",
      "Incorporate healthy fibers like legumes, seeds, and nuts."
    ],
    avoid: [
      "Excessive intake of sugar-sweetened drinks, processed snacks, and trans-fats."
    ],
    lifestyle: [
      "Stay active with regular physical exercise (150 minutes per week).",
      "Manage stress levels and prioritize adequate nightly rest."
    ],
    followUp: [
      "Schedule routine annual wellness exams and fasting blood glucose screenings."
    ]
  },
  healthy_cbc: {
    diet: [
      "Eat a well-balanced diet rich in iron, folate, and Vitamin B12 (leafy greens, eggs, lean meats).",
      "Consume fruits rich in Vitamin C to support optimal iron absorption."
    ],
    avoid: [
      "Highly processed foods lacking essential micronutrients and vitamins."
    ],
    lifestyle: [
      "Ensure adequate sleep (7-9 hours) to maintain body energy levels.",
      "Engage in regular physical activity to support blood circulation and vitality."
    ],
    followUp: [
      "Incorporate checking a complete blood count (CBC) into your yearly physical checkup."
    ]
  },
  healthy_kidney: {
    diet: [
      "Maintain a balanced, lower-sodium diet using fresh, whole foods.",
      "Drink adequate fluids (mostly water) to support natural waste filtration."
    ],
    avoid: [
      "Overconsumption of sodium (salt), heavily processed foods, and excessive protein powders."
    ],
    lifestyle: [
      "Keep blood pressure and blood sugar in a healthy range.",
      "Stay properly hydrated and avoid unnecessary use of NSAID pain relievers."
    ],
    followUp: [
      "Monitor kidney markers (Creatinine, eGFR) during standard annual physical exams."
    ]
  },
  healthy_liver: {
    diet: [
      "Incorporate antioxidant-rich foods like leafy greens, berries, garlic, and green tea.",
      "Use healthy fats such as extra virgin olive oil in moderation."
    ],
    avoid: [
      "Excessive alcohol intake, which directly stresses liver cells.",
      "Highly processed foods containing high-fructose corn syrup and saturated fats."
    ],
    lifestyle: [
      "Maintain a healthy weight and engage in regular physical activity.",
      "Limit exposure to toxins and avoid taking self-prescribed medications."
    ],
    followUp: [
      "Include standard liver function markers (ALT, AST) in routine annual blood work."
    ]
  },
  healthy_thyroid: {
    diet: [
      "Focus on a balanced diet containing trace minerals like selenium, zinc, and dietary iodine.",
      "Incorporate seafood, lean proteins, and organic dairy products."
    ],
    avoid: [
      "Unusually high doses of iodine supplements unless explicitly recommended by a doctor."
    ],
    lifestyle: [
      "Practice stress-management techniques to support endocrine health.",
      "Ensure consistent, high-quality sleep to maintain proper hormone regulation."
    ],
    followUp: [
      "Have your thyroid hormone levels (TSH) checked during regular wellness checkups."
    ]
  }
};

function getRecommendations(condition: string, panel: string): Recommendation {
  const condLower = condition.toLowerCase();
  const panelLower = panel.toLowerCase();

  // Check if the condition is a specific disease (NOT healthy/normal)
  const isHealthyOrNormal = 
    condLower.includes("healthy") || 
    condLower.includes("normal") || 
    condLower.includes("balanced") || 
    condLower.includes("euthyroid") ||
    condLower === "unknown" || 
    condLower === "";

  if (!isHealthyOrNormal) {
    if (condLower.includes("diabetes") || condLower.includes("hyperglycemia")) {
      return DISEASE_RECOMMENDATIONS.diabetes;
    }
    if (condLower.includes("anemia")) {
      return DISEASE_RECOMMENDATIONS.anemia;
    }
    if (condLower.includes("infection") || condLower.includes("leukemia")) {
      return DISEASE_RECOMMENDATIONS.infection;
    }
    if (condLower.includes("kidney") || condLower.includes("ckd")) {
      return DISEASE_RECOMMENDATIONS.kidney;
    }
    if (condLower.includes("liver")) {
      return DISEASE_RECOMMENDATIONS.liver;
    }
    if (condLower.includes("hypothyroid")) {
      return DISEASE_RECOMMENDATIONS.thyroid_hypo;
    }
    if (condLower.includes("hyperthyroid")) {
      return DISEASE_RECOMMENDATIONS.thyroid_hyper;
    }
  }

  // Fallback to panel-specific healthy recommendations
  if (panelLower.includes("diabetes")) return DISEASE_RECOMMENDATIONS.healthy_diabetes;
  if (panelLower.includes("cbc")) return DISEASE_RECOMMENDATIONS.healthy_cbc;
  if (panelLower.includes("kidney")) return DISEASE_RECOMMENDATIONS.healthy_kidney;
  if (panelLower.includes("liver")) return DISEASE_RECOMMENDATIONS.healthy_liver;
  if (panelLower.includes("thyroid")) return DISEASE_RECOMMENDATIONS.healthy_thyroid;

  return DISEASE_RECOMMENDATIONS.default;
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export function PatientStorytellingDashboard({ result }: { result: PredictResponse }) {
  const [viewMode, setViewMode] = useState<"healthy" | "current">("current");

  const panel  = result.panel ?? "";
  const meta   = PANEL_META[panel] ?? DEFAULT_META;
  const Icon   = meta.icon;
  const condition = result.ontology_explanation?.disease ?? result.predictions[0]?.disease ?? "Unknown";
  const findings  = result.findings ?? [];
  const isHealthyResult = /healthy/i.test(condition) && findings.length === 0;

  const causeEffect = buildCauseEffect(panel, findings, condition);
  const recs = getRecommendations(condition, panel);

  const fadeUp = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-5">

      {/* ──── 1. STORY HEADER ──── */}
      <motion.div {...fadeUp} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-100/40" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-100/30" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-lg shadow-cyan-200/50">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{meta.title}</h3>
            <p className="mt-1.5 leading-relaxed text-slate-600 text-sm">{meta.metaphor}</p>
          </div>
        </div>
      </motion.div>

      {/* ──── 2. HEALTHY vs CURRENT COMPARISON TABS ──── */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button onClick={() => setViewMode("healthy")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all",
              viewMode === "healthy"
                ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
                : "text-slate-500 hover:bg-slate-50"
            )}>
            <Heart className="h-4 w-4" /> Ideal Balanced State
          </button>
          <button onClick={() => setViewMode("current")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all",
              viewMode === "current"
                ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                : "text-slate-500 hover:bg-slate-50"
            )}>
            <BookOpen className="h-4 w-4" /> Your Current Case
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {viewMode === "healthy" ? (
            <motion.div key="healthy"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Heart className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 text-base">When Everything Is In Balance</h4>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-700/80">{meta.healthyDesc}</p>
                </div>
              </div>
              <BiologicalVisualizer panel={panel} findings={[]} condition="Healthy" />
            </motion.div>
          ) : (
            <motion.div key="current"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isHealthyResult ? "bg-emerald-100" : "bg-amber-100")}>
                  {isHealthyResult
                    ? <Heart className="h-5 w-5 text-emerald-600" />
                    : <AlertTriangle className="h-5 w-5 text-amber-600" />}
                </div>
                <div>
                  <h4 className={cn("font-bold text-base", isHealthyResult ? "text-emerald-800" : "text-amber-800")}>
                    {isHealthyResult ? "Looking Good!" : "What Your Results Show"}
                  </h4>
                  <p className={cn("mt-1 text-sm leading-relaxed", isHealthyResult ? "text-emerald-700/80" : "text-amber-700/80")}>
                    {isHealthyResult ? meta.healthyDesc : meta.affectedDesc}
                  </p>
                </div>
              </div>
              <BiologicalVisualizer panel={panel} findings={findings} condition={condition} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ──── 3. DETECTED FINDINGS — visual cards ──── */}
      {findings.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Understanding Your Findings</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {findings.map((f, i) => {
              const info = friendlyFinding(f);
              return (
                <motion.div key={f}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4",
                    info.direction === "up"   ? "border-orange-200 bg-orange-50/60" :
                    info.direction === "down"  ? "border-blue-200 bg-blue-50/60" :
                                                 "border-slate-200 bg-slate-50/60"
                  )}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    info.direction === "up"   ? "bg-orange-200/70 text-orange-700" :
                    info.direction === "down"  ? "bg-blue-200/70 text-blue-700" :
                                                 "bg-slate-200/70 text-slate-700"
                  )}>
                    {info.direction === "up" ? <TrendingUp className="h-4 w-4" /> :
                     info.direction === "down" ? <TrendingDown className="h-4 w-4" /> :
                     <Activity className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold",
                      info.direction === "up" ? "text-orange-800" :
                      info.direction === "down" ? "text-blue-800" : "text-slate-800"
                    )}>{humanize(info.label)}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{info.simple}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ──── 4. CAUSE → EFFECT FLOW ──── */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">How This Connects</h4>

        <div className="relative flex flex-col gap-0">
          {causeEffect.map((step, i) => {
            const StepIcon = step.icon;
            const isLast = i === causeEffect.length - 1;
            const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; line: string }> = {
              emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "bg-emerald-500", line: "bg-emerald-300" },
              amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   icon: "bg-amber-500",   line: "bg-amber-300"   },
              orange:  { bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-800",  icon: "bg-orange-500",  line: "bg-orange-300"  },
              rose:    { bg: "bg-rose-50",     border: "border-rose-200",    text: "text-rose-800",    icon: "bg-rose-500",    line: "bg-rose-300"    },
            };
            const colors = colorMap[step.color] ?? colorMap.amber;

            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i, duration: 0.4 }}
                className="relative flex gap-4">

                {/* Vertical connector */}
                <div className="flex flex-col items-center">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md", colors.icon)}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  {!isLast && <div className={cn("w-0.5 flex-1 min-h-[24px]", colors.line)} />}
                </div>

                {/* Content */}
                <div className={cn("flex-1 mb-4 rounded-xl border p-4", colors.bg, colors.border)}>
                  <p className={cn("text-sm font-bold", colors.text)}>{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{step.text}</p>
                </div>

                {/* Arrow between steps */}
                {!isLast && (
                  <div className="absolute left-[14px] bottom-[-2px] text-slate-300">
                    <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ──── 5. DIET & LIFESTYLE RECOMMENDATIONS ──── */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Personalized Guidance</h4>
          <h3 className="mt-1 text-lg font-bold text-slate-800">Diet & Lifestyle Suggestions</h3>
          <p className="mt-1 text-xs leading-relaxed flex flex-col gap-1 text-slate-500">
            <span>⚠️ <strong>Educational Notice:</strong> These suggestions are for wellness education only and do not replace professional medical advice, diagnosis, or treatment.</span>
            <span className="font-medium text-slate-400" dir="rtl">تنبيه تعليمي: هذه النصائح لأغراض التوعية والإرشاد الصحي فقط، ولا تُعد تشخيصاً طبياً أو بديلاً عن استشارة الطبيب المختص.</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Card 1: Foods to Focus On */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Apple className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm">Foods to Focus On</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
              {recs.diet.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Card 2: Foods & Substances to Avoid */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Ban className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm">Foods & Substances to Avoid</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
              {recs.avoid.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Card 3: Lifestyle Adjustments */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Dumbbell className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm">Lifestyle Adjustments</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
              {recs.lifestyle.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Card 4: Follow-up Recommendations */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-sm">Follow-up Recommendations</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 leading-relaxed">
              {recs.followUp.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ──── 6. SAFETY DISCLAIMER ──── */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/80 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-800">Clinical Decision Support Only</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              This visualization is a <span className="font-semibold">decision support tool</span>, not a diagnosis.
              Please discuss these results with a qualified healthcare professional who knows your complete medical history.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
