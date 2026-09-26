export const TOKENS = {
  ink: "#0F1633",
  paper: "#F3F5FA",
  ultramarine: "#2F45FF",
  signal: "#FF5B4A",
  verify: "#1FB58F",
  caution: "#F5A524",
} as const;

export const RISK_LEVEL_COLORS = {
  LOW: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    hex: TOKENS.verify,
    icon: "ShieldCheck",
    label: "Low Risk",
  },
  CAUTION: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    hex: TOKENS.caution,
    icon: "AlertTriangle",
    label: "Caution Advised",
  },
  HIGH: {
    bg: "bg-orange-50 text-orange-800 border-orange-200",
    hex: "#F97316",
    icon: "AlertCircle",
    label: "High Risk",
  },
  CRITICAL: {
    bg: "bg-rose-50 text-rose-800 border-rose-200",
    hex: TOKENS.signal,
    icon: "ShieldAlert",
    label: "Critical Threat",
  },
  INCONCLUSIVE: {
    bg: "bg-slate-50 text-slate-800 border-slate-200",
    hex: "#64748B",
    icon: "HelpCircle",
    label: "Inconclusive",
  },
} as const;
