import React from "react";
import { cn } from "@/lib/utils";

const sections = [
  { key: "business_analysis", label: "Business Analysis" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend / API" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "tester", label: "Tester" },
];

export default function SectionTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {sections.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors",
            active === s.key
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {s.label}
          {active === s.key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export { sections };
