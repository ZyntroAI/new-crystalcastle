// components/agent-task-card.jsx
// Inbox card for an agent task (queued → running → success/failed).
// Pairs with agent_local.py task events. Assumes: lucide-react, ui/button,
// sonner, @/lib/utils (cn). No badge dependency — badge is inline.
// Usage:
//   <AgentTaskCard task={{ id, title, status, progress, logs, result, error }}
//     onRetry={...} onCancel={...} onDelete={...} onViewResult={...} />

import { useState } from "react";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  ScrollText,
  RotateCcw,
  Square,
  Trash2,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_META = {
  queued: {
    label: "Queued",
    icon: Clock,
    badgeClass: "bg-muted text-muted-foreground border",
    iconClass: "text-muted-foreground",
    barClass: "bg-muted-foreground/40",
  },
  running: {
    label: "Running",
    icon: Loader2,
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    iconClass: "text-blue-500 animate-spin",
    barClass: "bg-blue-500",
  },
  success: {
    label: "Success",
    icon: CheckCircle2,
    badgeClass: "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30",
    iconClass: "text-green-500",
    barClass: "bg-green-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    iconClass: "text-red-500",
    barClass: "bg-red-500",
  },
};

const LEVEL_META = {
  info: { icon: Info, class: "text-muted-foreground" },
  warn: { icon: AlertTriangle, class: "text-amber-500" },
  error: { icon: XCircle, class: "text-red-500" },
};

function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function LogLine({ log }) {
  const level = log.level ?? "info";
  const meta = LEVEL_META[level] ?? LEVEL_META.info;
  const Icon = meta.icon;
  const time = log.time
    ? new Date(log.time).toLocaleTimeString([], { hour12: false })
    : "";
  return (
    <div className="flex items-start gap-2 py-0.5 font-mono text-[11px] leading-relaxed">
      <Icon className={cn("mt-0.5 h-3 w-3 shrink-0", meta.class)} />
      {time && <span className="shrink-0 text-muted-foreground/60">{time}</span>}
      <span
        className={cn(
          "whitespace-pre-wrap break-words",
          level === "error" && "text-red-400"
        )}
      >
        {log.message}
      </span>
    </div>
  );
}

export default function AgentTaskCard({
  task,
  onRetry,
  onCancel,
  onDelete,
  onViewResult,
  defaultOpen = false,
  className,
}) {
  const {
    id,
    title,
    description,
    status = "queued",
    progress = 0,
    createdAt,
    logs = [],
    result,
    error,
  } = task;

  const meta = STATUS_META[status] ?? STATUS_META.queued;
  const StatusIcon = meta.icon;
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const showProgress = status === "running" || status === "queued";
  const pct = Math.max(0, Math.min(100, progress ?? 0));

  const copyResult = async () => {
    const text =
      typeof result === "string" ? result : JSON.stringify(result, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Result copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        status === "failed" && "border-red-500/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <StatusIcon className={cn("mt-0.5 h-5 w-5 shrink-0", meta.iconClass)} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                meta.badgeClass
              )}
            >
              {status === "running" && (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              )}
              {meta.label}
            </span>
            {createdAt && (
              <span className="text-[11px] text-muted-foreground">
                {timeAgo(createdAt)}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {description}
            </p>
          )}

          {/* Progress bar */}
          {showProgress && (
            <div className="mt-2.5">
              <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{status === "queued" ? "Waiting in queue…" : "Working…"}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    meta.barClass,
                    status === "running" && "animate-pulse"
                  )}
                  style={{ width: `${status === "queued" ? 8 : pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Inline error summary */}
          {status === "failed" && error && (
            <p className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
              {String(error)}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground"
          onClick={() => setOpen((o) => !o)}
        >
          <ScrollText className="mr-1 h-3.5 w-3.5" />
          Logs ({logs.length})
          {open ? (
            <ChevronDown className="ml-1 h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          )}
        </Button>

        <div className="ml-auto flex flex-wrap gap-1.5">
          {status === "running" && onCancel && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancel}>
              <Square className="mr-1 h-3 w-3 fill-current" /> Cancel
            </Button>
          )}
          {status === "failed" && onRetry && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onRetry}>
              <RotateCcw className="mr-1 h-3 w-3" /> Retry
            </Button>
          )}
          {status === "success" && result != null && (
            <>
              {onViewResult && (
                <Button size="sm" className="h-7 text-xs" onClick={() => onViewResult(task)}>
                  <Eye className="mr-1 h-3 w-3" /> View result
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={copyResult}>
                {copied ? (
                  <Check className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-red-600"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Expandable logs */}
      {open && (
        <div className="mt-3 max-h-56 overflow-auto rounded-lg border bg-zinc-950 p-3 text-zinc-200">
          {logs.length === 0 ? (
            <p className="font-mono text-[11px] text-zinc-500">No logs yet.</p>
          ) : (
            logs.map((log, i) => <LogLine key={i} log={log} />)
          )}
        </div>
      )}
    </div>
  );
}
