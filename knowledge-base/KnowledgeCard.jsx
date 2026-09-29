"use client";

import React from "react";
import { 
  BookOpen, 
  Wrench, 
  ShieldAlert, 
  Layers, 
  UserCheck, 
  HelpCircle,
  Clock,
  User,
  ArrowRight
} from "lucide-react";

export interface KnowledgeItem {
  id: string;
  title: string;
  summary: string;
  taxonomy: "concepts" | "howtos" | "runbooks" | "architecture" | "onboarding" | "troubleshooting";
  tags: string[];
  owner: string;
  lastReviewed: string;
  status: "draft" | "review" | "published" | "deprecated";
}

const taxonomyBadgeConfig = {
  concepts: { label: "Concept", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: BookOpen },
  howtos: { label: "How-To", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: Wrench },
  runbooks: { label: "Runbook", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", icon: ShieldAlert },
  architecture: { label: "Architecture", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: Layers },
  onboarding: { label: "Onboarding", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: UserCheck },
  troubleshooting: { label: "Troubleshooting", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", icon: HelpCircle },
};

export function KnowledgeCard({ item }: { item: KnowledgeItem }) {
  const badge = taxonomyBadgeConfig[item.taxonomy];
  const IconComponent = badge.icon;

  return (
    <div className="group relative flex flex-col justify-between p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/10">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          {item.status === "review" && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Needs Review
            </span>
          )}
        </div>

        {/* Title & Summary */}
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
      </div>

      {/* Footer Meta Data */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-3 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-medium">{item.owner}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.lastReviewed}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
