import { motion } from "framer-motion";

// ──────────────────────────────────────────────────────
//  Utility helpers
// ──────────────────────────────────────────────────────
function isHighFinding(f: string) {
  return /high|elevated|hyper|excess/i.test(f);
}
function isLowFinding(f: string) {
  return /low|deficiency|hypo|reduced|anemia/i.test(f);
}

function getSeverityFromFindings(findings: string[]): "healthy" | "mild" | "moderate" | "severe" {
  if (!findings || findings.length === 0) return "healthy";
  if (findings.length === 1) return "mild";
  if (findings.length === 2) return "moderate";
  return "severe";
}

// ──────────────────────────────────────────────────────
//  Colour maps
// ──────────────────────────────────────────────────────
const SEVERITY_COLOR = {
  healthy:  { stroke: "#10b981", fill: "#d1fae5", glow: "#34d399", pulse: false },
  mild:     { stroke: "#f59e0b", fill: "#fef3c7", glow: "#fbbf24", pulse: true  },
  moderate: { stroke: "#f97316", fill: "#ffedd5", glow: "#fb923c", pulse: true  },
  severe:   { stroke: "#ef4444", fill: "#fee2e2", glow: "#f87171", pulse: true  },
};

// ──────────────────────────────────────────────────────
//  Individual organ SVGs
// ──────────────────────────────────────────────────────

// DIABETES → Pancreas + blood vessels
function PancreasSVG({ severity }: { severity: keyof typeof SEVERITY_COLOR }) {
  const c = SEVERITY_COLOR[severity];
  const isAffected = severity !== "healthy";

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow-p">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="panc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill} />
          <stop offset="100%" stopColor={c.stroke} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Blood vessels background */}
      <motion.path d="M 30 100 Q 80 60 140 100 Q 200 140 250 100" stroke={isAffected ? "#fca5a5" : "#86efac"}
        strokeWidth="3" fill="none" strokeDasharray="6 3"
        animate={isAffected ? { strokeDashoffset: [0, -20] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
      <motion.path d="M 30 120 Q 80 80 140 120 Q 200 160 250 120" stroke={isAffected ? "#fca5a5" : "#86efac"}
        strokeWidth="2" fill="none" strokeDasharray="6 3"
        animate={isAffected ? { strokeDashoffset: [0, -20] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />

      {/* Pancreas body */}
      <motion.ellipse cx="140" cy="100" rx="90" ry="30" fill="url(#panc-grad)"
        stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-p)"
        animate={c.pulse ? { rx: [90, 93, 90] } : {}}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} />

      {/* Pancreatic tail */}
      <motion.ellipse cx="55" cy="95" rx="28" ry="16" fill={c.fill}
        stroke={c.stroke} strokeWidth="2" filter="url(#glow-p)"
        animate={c.pulse ? { rx: [28, 30, 28] } : {}}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 0.3 }} />

      {/* Islet cells (insulin producers) */}
      {[100, 130, 160, 190].map((x, i) => (
        <motion.circle key={i} cx={x} cy={100} r={5} fill={isAffected ? "#fca5a5" : "#34d399"}
          stroke={isAffected ? "#ef4444" : "#10b981"} strokeWidth="1.5"
          animate={{ scale: [1, isAffected ? 0.7 : 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: "easeInOut" }} />
      ))}

      {/* Insulin/Sugar particles */}
      {isAffected ? (
        // Blocked sugar particles
        [60, 120, 180, 240].map((x, i) => (
          <motion.circle key={i} cx={x} cy={115} r={4} fill="#fbbf24"
            animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4, ease: "easeInOut" }} />
        ))
      ) : (
        // Healthy flowing particles
        [70, 130, 190].map((x, i) => (
          <motion.circle key={i} cx={x} cy={110} r={3} fill="#10b981"
            animate={{ x: [0, 30, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.7, ease: "easeInOut" }} />
        ))
      )}

      {/* Label */}
      <text x="140" y="160" textAnchor="middle" fontSize="11" fill={c.stroke} fontWeight="600">Pancreas</text>
      <text x="140" y="175" textAnchor="middle" fontSize="9" fill="#64748b">{isAffected ? "⚠ Stressed" : "✓ Balanced"}</text>
    </svg>
  );
}

// CBC → Blood stream + cells
function BloodStreamSVG({ severity, findings }: { severity: keyof typeof SEVERITY_COLOR; findings: string[] }) {
  const c = SEVERITY_COLOR[severity];
  const isAffected = severity !== "healthy";
  const hasLow = findings.some(isLowFinding);
  const hasHigh = findings.some(isHighFinding);

  const cellCount = hasLow ? 4 : hasHigh ? 12 : 8;
  const cellColor = hasLow ? "#fca5a5" : hasHigh ? "#fbbf24" : "#f87171";
  const cellFill  = hasLow ? "#fee2e2" : hasHigh ? "#fef3c7" : "#fde8e8";

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow-b"><feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Vessel walls */}
      <path d="M 20 70 Q 140 50 260 70" stroke="#cbd5e1" strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M 20 130 Q 140 150 260 130" stroke="#cbd5e1" strokeWidth="28" fill="none" strokeLinecap="round" />

      {/* Blood flow (plasma) */}
      <motion.path d="M 20 100 Q 140 90 260 100" stroke={isAffected ? "#fda4af" : "#fca5a5"}
        strokeWidth="22" fill="none" strokeLinecap="round"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />

      {/* Red blood cells */}
      {Array.from({ length: cellCount }).map((_, i) => {
        const x = 30 + i * (220 / cellCount);
        return (
          <motion.ellipse key={i} cx={x} cy={100} rx={8} ry={5}
            fill={isAffected ? cellFill : "#fde8e8"} stroke={isAffected ? cellColor : "#f87171"} strokeWidth="1.5"
            filter="url(#glow-b)"
            animate={{ x: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2, ease: "easeInOut" }} />
        );
      })}

      {/* Status indicators */}
      {hasLow && (
        <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">
          ↓ Low Cell Count
        </text>
      )}
      {hasHigh && (
        <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="600">
          ↑ Elevated Markers
        </text>
      )}

      <text x="140" y="170" textAnchor="middle" fontSize="11" fill={c.stroke} fontWeight="600">Blood System</text>
      <text x="140" y="183" textAnchor="middle" fontSize="9" fill="#64748b">{isAffected ? "⚠ Abnormal" : "✓ Healthy Flow"}</text>
    </svg>
  );
}

// KIDNEY → Twin kidneys with filtration
function KidneySVG({ severity }: { severity: keyof typeof SEVERITY_COLOR }) {
  const c = SEVERITY_COLOR[severity];
  const isAffected = severity !== "healthy";

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow-k"><feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="kid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill} />
          <stop offset="100%" stopColor={c.stroke} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Left kidney */}
      <motion.path d="M 50 70 C 30 70 20 90 20 100 C 20 120 30 140 50 140 C 65 140 75 130 80 120 C 85 110 80 90 75 80 C 70 70 60 70 50 70 Z"
        fill="url(#kid-grad)" stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-k)"
        animate={c.pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />

      {/* Left kidney renal pelvis */}
      <ellipse cx="60" cy="105" rx="12" ry="20" fill={isAffected ? "#fca5a5" : "#86efac"}
        stroke={isAffected ? "#ef4444" : "#10b981"} strokeWidth="1.5" />

      {/* Right kidney */}
      <motion.path d="M 230 70 C 250 70 260 90 260 100 C 260 120 250 140 230 140 C 215 140 205 130 200 120 C 195 110 200 90 205 80 C 210 70 220 70 230 70 Z"
        fill="url(#kid-grad)" stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-k)"
        animate={c.pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }} />

      {/* Right kidney renal pelvis */}
      <ellipse cx="220" cy="105" rx="12" ry="20" fill={isAffected ? "#fca5a5" : "#86efac"}
        stroke={isAffected ? "#ef4444" : "#10b981"} strokeWidth="1.5" />

      {/* Ureters */}
      <motion.path d="M 70 130 Q 140 180 210 130" stroke={isAffected ? "#f97316" : "#10b981"}
        strokeWidth="3" fill="none" strokeDasharray="5 3"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />

      {/* Filtration particles */}
      {isAffected ? (
        // Blocked toxins
        [80, 140, 200].map((x, i) => (
          <motion.polygon key={i} points={`${x},95 ${x+6},107 ${x-6},107`} fill="#fca5a5"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }} />
        ))
      ) : (
        [90, 140, 190].map((x, i) => (
          <motion.circle key={i} cx={x} cy={155} r={3} fill="#10b981"
            animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }} />
        ))
      )}

      <text x="140" y="32" textAnchor="middle" fontSize="11" fill={c.stroke} fontWeight="600">Kidneys</text>
      <text x="140" y="46" textAnchor="middle" fontSize="9" fill="#64748b">{isAffected ? "⚠ Filtration Stressed" : "✓ Filtering Normally"}</text>
    </svg>
  );
}

// LIVER → Liver with metabolic pathways
function LiverSVG({ severity }: { severity: keyof typeof SEVERITY_COLOR }) {
  const c = SEVERITY_COLOR[severity];
  const isAffected = severity !== "healthy";

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow-l"><feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="liv-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill} />
          <stop offset="100%" stopColor={c.stroke} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Liver shape */}
      <motion.path d="M 40 120 C 20 100 20 70 50 60 C 80 50 120 55 150 60 C 180 65 210 60 230 75 C 255 95 255 115 240 130 C 225 145 195 145 160 140 C 130 135 100 145 80 140 C 60 135 50 135 40 120 Z"
        fill="url(#liv-grad)" stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-l)"
        animate={c.pulse ? { scale: [1, 1.03, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} />

      {/* Portal vein */}
      <motion.path d="M 140 155 L 140 130" stroke={isAffected ? "#f97316" : "#10b981"} strokeWidth="5"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} />
      <motion.path d="M 120 165 L 120 145 L 140 130" stroke={isAffected ? "#fca5a5" : "#86efac"} strokeWidth="3" fill="none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
      <motion.path d="M 160 165 L 160 145 L 140 130" stroke={isAffected ? "#fca5a5" : "#86efac"} strokeWidth="3" fill="none"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }} />

      {/* Lobule cells */}
      {[[100, 90], [140, 85], [180, 90], [120, 110], [160, 110]].map(([x, y], i) => (
        <motion.circle key={i}
          cx={x} cy={y} r={10} fill={isAffected ? "#fca5a5" : "#bbf7d0"}
          stroke={isAffected ? "#ef4444" : "#10b981"} strokeWidth="1"
          animate={{ opacity: [0.5, 0.9, 0.5], r: isAffected ? [10, 8, 10] : [10, 12, 10] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.4 }} />
      ))}

      {/* Toxin flow indicators */}
      {isAffected ? (
        <text x="140" y="38" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">⚠ Processing Overloaded</text>
      ) : (
        <text x="140" y="38" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="600">✓ Detoxifying Efficiently</text>
      )}

      <text x="140" y="175" textAnchor="middle" fontSize="11" fill={c.stroke} fontWeight="600">Liver</text>
      <text x="140" y="188" textAnchor="middle" fontSize="9" fill="#64748b">{isAffected ? "⚠ Elevated Enzymes" : "✓ Normal Function"}</text>
    </svg>
  );
}

// THYROID → Butterfly gland with hormone flow
function ThyroidSVG({ severity, findings }: { severity: keyof typeof SEVERITY_COLOR; findings: string[] }) {
  const c = SEVERITY_COLOR[severity];
  const isAffected = severity !== "healthy";
  const isHyper = findings.some(f => /hyper|elevated|high/i.test(f));

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="glow-t"><feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="thy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.fill} />
          <stop offset="100%" stopColor={c.stroke} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Trachea */}
      <rect x="125" y="30" width="30" height="140" rx="15" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />

      {/* Left lobe */}
      <motion.ellipse cx="95" cy="105" rx="45" ry="55" fill="url(#thy-grad)"
        stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-t)"
        animate={c.pulse ? { rx: isHyper ? [45, 50, 45] : [45, 42, 45] } : {}}
        transition={{ repeat: Infinity, duration: isHyper ? 1.2 : 3, ease: "easeInOut" }} />

      {/* Right lobe */}
      <motion.ellipse cx="185" cy="105" rx="45" ry="55" fill="url(#thy-grad)"
        stroke={c.stroke} strokeWidth="2.5" filter="url(#glow-t)"
        animate={c.pulse ? { rx: isHyper ? [45, 50, 45] : [45, 42, 45] } : {}}
        transition={{ repeat: Infinity, duration: isHyper ? 1.2 : 3, delay: 0.3, ease: "easeInOut" }} />

      {/* Isthmus (bridge) */}
      <motion.rect x="115" y="95" width="50" height="20" rx="10" fill={c.fill} stroke={c.stroke} strokeWidth="2" />

      {/* Hormone particles */}
      {Array.from({ length: isHyper ? 8 : isAffected ? 2 : 5 }).map((_, i) => {
        const angle = (i / (isHyper ? 8 : isAffected ? 2 : 5)) * Math.PI * 2;
        const r = 65;
        const x = 140 + Math.cos(angle) * r;
        const y = 105 + Math.sin(angle) * r;
        return (
          <motion.circle key={i} cx={x} cy={y} r={4}
            fill={isHyper ? "#fbbf24" : isAffected ? "#94a3b8" : "#34d399"}
            animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: isHyper ? 1.2 : 2.5, delay: i * 0.3 }} />
        );
      })}

      <text x="140" y="178" textAnchor="middle" fontSize="11" fill={c.stroke} fontWeight="600">Thyroid Gland</text>
      <text x="140" y="191" textAnchor="middle" fontSize="9" fill="#64748b">
        {isHyper ? "⚠ Overactive" : isAffected ? "⚠ Underactive" : "✓ Balanced Hormones"}
      </text>
    </svg>
  );
}

// ──────────────────────────────────────────────────────
//  Public component
// ──────────────────────────────────────────────────────
interface BiologicalVisualizerProps {
  panel: string;
  findings: string[];
  condition: string;
}

export function BiologicalVisualizer({ panel, findings, condition }: BiologicalVisualizerProps) {
  const normalizedPanel = panel.toUpperCase();
  const severity = getSeverityFromFindings(findings);
  const isHealthy = /healthy/i.test(condition) && severity === "healthy";
  const effectiveSeverity: keyof typeof SEVERITY_COLOR = isHealthy ? "healthy" : severity;

  function renderOrgan() {
    if (normalizedPanel === "DIABETES") return <PancreasSVG severity={effectiveSeverity} />;
    if (normalizedPanel === "CBC")      return <BloodStreamSVG severity={effectiveSeverity} findings={findings} />;
    if (normalizedPanel === "KIDNEY")   return <KidneySVG severity={effectiveSeverity} />;
    if (normalizedPanel === "LIVER")    return <LiverSVG severity={effectiveSeverity} />;
    if (normalizedPanel === "THYROID")  return <ThyroidSVG severity={effectiveSeverity} findings={findings} />;
    return <PancreasSVG severity={effectiveSeverity} />;
  }

  const severityLabel = {
    healthy:  "Normal / Optimal",
    mild:     "Mild Imbalance",
    moderate: "Moderate Concern",
    severe:   "Significant Changes",
  }[effectiveSeverity];

  const severityPct = { healthy: 5, mild: 35, moderate: 65, severe: 90 }[effectiveSeverity];

  const gaugeColor = {
    healthy:  "from-emerald-400 to-emerald-500",
    mild:     "from-amber-400 to-yellow-500",
    moderate: "from-orange-400 to-orange-500",
    severe:   "from-rose-500 to-red-600",
  }[effectiveSeverity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Biological Overview</p>
        <h3 className="text-lg font-bold text-slate-800">
          {normalizedPanel === "CBC" ? "Blood Cell System" :
           normalizedPanel === "DIABETES" ? "Metabolic System — Pancreas" :
           normalizedPanel === "KIDNEY" ? "Renal Filtration System" :
           normalizedPanel === "LIVER" ? "Hepatic Processing System" :
           normalizedPanel === "THYROID" ? "Endocrine — Thyroid Gland" : "Organ System"}
        </h3>
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr] gap-0">
        {/* SVG Visual */}
        <div className="p-4 flex items-center justify-center min-h-[200px]">
          <div className="w-full max-w-[260px] aspect-[280/200]">
            {renderOrgan()}
          </div>
        </div>

        {/* Severity + Info */}
        <div className="p-5 border-l border-slate-100 flex flex-col justify-center gap-4">
          {/* Severity meter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Severity Level</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                effectiveSeverity === "healthy"  ? "bg-emerald-100 text-emerald-700" :
                effectiveSeverity === "mild"     ? "bg-amber-100 text-amber-700" :
                effectiveSeverity === "moderate" ? "bg-orange-100 text-orange-700" :
                "bg-rose-100 text-rose-700"
              }`}>{severityLabel}</span>
            </div>
            {/* Track */}
            <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gaugeColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${severityPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>Optimal</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Active findings */}
          {findings.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Findings</p>
              <div className="flex flex-wrap gap-1.5">
                {findings.map((f) => (
                  <motion.span key={f}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      isHighFinding(f) ? "bg-orange-50 border-orange-200 text-orange-700" :
                      isLowFinding(f)  ? "bg-blue-50 border-blue-200 text-blue-700" :
                                         "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                    {isHighFinding(f) ? "↑" : isLowFinding(f) ? "↓" : "•"} {f}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
