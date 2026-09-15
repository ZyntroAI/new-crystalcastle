import React from "react";
import { computeSectionProgress } from "@/lib/templateCompleteness";

const BAR_COLORS = { low: "bg-amber-500", mid: "bg-primary", high: "bg-emerald-500" };

export default function CompletenessMeter({ template }) {
  const { filled, total, pct } = computeSectionProgress(template);
  const color = pct < 40 ? BAR_COLORS.low : pct < 80 ? BAR_COLORS.mid : BAR_COLORS.high;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Sections filled</span>
        <span className="font-medium">{filled}/{total}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
