import React, { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { draftSectionWithAI } from "@/lib/aiSectionDraft";
import { computeSectionProgress } from "@/lib/templateCompleteness";
import { useToast } from "@/components/ui/use-toast";

export default function DraftSectionButton({ sectionKey, template, onDrafted }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const businessAnalysisReady = computeSectionProgress(template).sections.some(
    (s) => s.key === "business_analysis" && s.filled
  );

  const handleDraft = async () => {
    if (!businessAnalysisReady) {
      toast({ title: "Fill in the Business Analysis section first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const drafted = await draftSectionWithAI(sectionKey, template);
      onDrafted(drafted);
      toast({ title: "AI draft applied — review it and click Save Template" });
    } catch {
      toast({ title: "AI draft failed — try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDraft}
      disabled={loading}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
      {loading ? "Drafting..." : "Draft with AI"}
    </button>
  );
}
