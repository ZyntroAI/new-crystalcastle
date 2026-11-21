// components/tool-call-card.jsx
// Standalone agent function-call card. Renders tool name, status, expandable
// JSON args + result. Wire to agent_local.py tool-execution events.
// Assumes: lucide-react, ui/button, sonner, @/lib/utils (cn). No other deps.
// Usage:
//   <ToolCallCard name="run_python" args={{ code: "print(1+1)" }} status="running" />
//   <ToolCallCard name="search_files" args={{ q: "*.pdf" }} status="done" result={["a.pdf"]} durationMs={412} />
//   <ToolCallCard name="run_bash" args={{ cmd: "..." }} status="error" error="exit code 1" />

import { useState } from "react";
import { toast } from "sonner";
import {
  Terminal,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_META = {
  queued: {
    label: "Queued",
    icon: Clock,
    iconClass: "text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
  running: {
    label: "Running",
    icon: Loader2,
    iconClass: "text-blue-500 animate-spin",
    dotClass: "bg-blue-500 animate-pulse",
  },
  done: {
    label: "Completed",
    icon: CheckCircle2,
    iconClass: "text-green-500",
    dotClass: "bg-green-500",
  },
  error: {
    label: "Failed",
    icon: XCircle,
    iconClass: "text-red-500",
    dotClass: "bg-red-500",
  },
};

function toText(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
      onClick={copy}
    >
      {copied ? (
        <Check className="mr-1 h-3 w-3 text-green-500" />
      ) : (
        <Copy className="mr-1 h-3 w-3" />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

function Section({ title, text, tone = "default" }) {
  if (!text) return null;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <CopyButton text={text} label={`Copy ${title.toLowerCase()}`} />
      </div>
      <pre
        className={cn(
          "max-h-48 overflow-auto rounded-md border p-2 font-mono text-xs leading-relaxed",
          tone === "error"
            ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
            : "bg-background"
        )}
      >
        {text}
      </pre>
    </div>
  );
}

export default function ToolCallCard({
  name,
  args,
  status = "running",
  result,
  error,
  durationMs,
  defaultOpen,
  compact = false,
  className,
}) {
  const meta = STATUS_META[status] ?? STATUS_META.running;
  const StatusIcon = meta.icon;
  const [open, setOpen] = useState(
    defaultOpen ?? status === "running" || status === "error"
  );

  const argsText = toText(args);
  const resultText = toText(result);
  const hasBody = Boolean(argsText || resultText || error);

  const duration =
    typeof durationMs === "number" && status === "done"
      ? durationMs < 1000
        ? `${durationMs} ms`
        : `${(durationMs / 1000).toFixed(1)} s`
      : null;

  return (
    <div
      className={cn(
        "my-2 overflow-hidden rounded-lg border bg-muted/40 text-sm",
        status === "error" && "border-red-500/40 bg-red-500/5",
        compact && "my-1",
        className
      )}
    >
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={() => hasBody && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left",
          hasBody ? "hover:bg-muted/60" : "cursor-default"
        )}
      >
        <Terminal className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-xs font-medium">{name}</span>

        <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dotClass)} />
        <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", meta.iconClass)} />
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {meta.label}
        </span>
        {duration && (
          <span className="shrink-0 text-[11px] text-muted-foreground/70">
            · {duration}
          </span>
        )}

        {hasBody && (
          <span className="ml-auto shrink-0 text-muted-foreground">
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {/* Body */}
      {open && hasBody && (
        <div className="space-y-3 border-t px-3 py-2.5">
          {argsText && <Section title="Arguments" text={argsText} />}

          {resultText && (
            <Section
              title="Result"
              text={resultText}
              tone={status === "error" ? "error" : "default"}
            />
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold">Error</span>
                  <CopyButton text={String(error)} label="Copy error" />
                </div>
                <pre className="whitespace-pre-wrap font-mono">{String(error)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
