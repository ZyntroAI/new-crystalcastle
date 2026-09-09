import React, { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMeta = {
  pending: { icon: Loader2, spin: true, text: "Pending", ok: null },
  running: { icon: Loader2, spin: true, text: "Running", ok: null },
  in_progress: { icon: Loader2, spin: true, text: "Working...", ok: null },
  completed: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  success: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  failed: { icon: XCircle, spin: false, text: "Failed", ok: false },
  error: { icon: XCircle, spin: false, text: "Failed", ok: false },
};

export default function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  let parsedResults = toolCall.results;
  try {
    parsedResults = JSON.parse(toolCall.results);
  } catch {
    /* results may already be an object or plain string */
  }

  const failed =
    toolCall.status === "failed" ||
    toolCall.status === "error" ||
    (typeof toolCall.results === "string" && /error|failed/i.test(toolCall.results)) ||
    (parsedResults && parsedResults.success === false);

  const meta = statusMeta[toolCall.status] || statusMeta.pending;
  const Icon = failed ? XCircle : meta.icon;
  const label = failed ? "Failed" : meta.text;
  const hideDetails =
    toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;

  let args = toolCall.arguments_string;
  try {
    args = JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
  } catch {
    /* keep raw string */
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/50 text-xs">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-muted-foreground"
      >
        <Icon className={cn("h-3.5 w-3.5", !failed && meta.spin && "animate-spin")} />
        <span>{toolCall.name}</span>
        <span className={cn("ml-1", failed ? "text-destructive" : "text-muted-foreground")}>{label}</span>
        {!hideDetails && <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition", expanded && "rotate-180")} />}
      </button>
      {expanded && !hideDetails && (
        <div className="space-y-2 border-t border-border px-3 py-2 font-mono">
          {args && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Parameters:</p>
              <pre className="whitespace-pre-wrap break-all">{args}</pre>
            </div>
          )}
          {toolCall.results && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Result:</p>
              <pre className="whitespace-pre-wrap break-all">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}import React, { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMeta = {
  pending: { icon: Loader2, spin: true, text: "Pending", ok: null },
  running: { icon: Loader2, spin: true, text: "Running", ok: null },
  in_progress: { icon: Loader2, spin: true, text: "Working...", ok: null },
  completed: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  success: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  failed: { icon: XCircle, spin: false, text: "Failed", ok: false },
  error: { icon: XCircle, spin: false, text: "Failed", ok: false },
};

export default function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  let parsedResults = toolCall.results;
  try {
    parsedResults = JSON.parse(toolCall.results);
  } catch {
    /* results may already be an object or plain string */
  }

  const failed =
    toolCall.status === "failed" ||
    toolCall.status === "error" ||
    (typeof toolCall.results === "string" && /error|failed/i.test(toolCall.results)) ||
    (parsedResults && parsedResults.success === false);

  const meta = statusMeta[toolCall.status] || statusMeta.pending;
  const Icon = failed ? XCircle : meta.icon;
  const label = failed ? "Failed" : meta.text;
  const hideDetails =
    toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;

  let args = toolCall.arguments_string;
  try {
    args = JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
  } catch {
    /* keep raw string */
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/50 text-xs">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-muted-foreground"
      >
        <Icon className={cn("h-3.5 w-3.5", !failed && meta.spin && "animate-spin")} />
        <span>{toolCall.name}</span>
        <span className={cn("ml-1", failed ? "text-destructive" : "text-muted-foreground")}>{label}</span>
        {!hideDetails && <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition", expanded && "rotate-180")} />}
      </button>
      {expanded && !hideDetails && (
        <div className="space-y-2 border-t border-border px-3 py-2 font-mono">
          {args && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Parameters:</p>
              <pre className="whitespace-pre-wrap break-all">{args}</pre>
            </div>
          )}
          {toolCall.results && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Result:</p>
              <pre className="whitespace-pre-wrap break-all">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}import React, { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMeta = {
  pending: { icon: Loader2, spin: true, text: "Pending", ok: null },
  running: { icon: Loader2, spin: true, text: "Running", ok: null },
  in_progress: { icon: Loader2, spin: true, text: "Working...", ok: null },
  completed: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  success: { icon: CheckCircle2, spin: false, text: "Done", ok: true },
  failed: { icon: XCircle, spin: false, text: "Failed", ok: false },
  error: { icon: XCircle, spin: false, text: "Failed", ok: false },
};

export default function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);

  let parsedResults = toolCall.results;
  try {
    parsedResults = JSON.parse(toolCall.results);
  } catch {
    /* results may already be an object or plain string */
  }

  const failed =
    toolCall.status === "failed" ||
    toolCall.status === "error" ||
    (typeof toolCall.results === "string" && /error|failed/i.test(toolCall.results)) ||
    (parsedResults && parsedResults.success === false);

  const meta = statusMeta[toolCall.status] || statusMeta.pending;
  const Icon = failed ? XCircle : meta.icon;
  const label = failed ? "Failed" : meta.text;
  const hideDetails =
    toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;

  let args = toolCall.arguments_string;
  try {
    args = JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
  } catch {
    /* keep raw string */
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-muted/50 text-xs">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left font-medium text-muted-foreground"
      >
        <Icon className={cn("h-3.5 w-3.5", !failed && meta.spin && "animate-spin")} />
        <span>{toolCall.name}</span>
        <span className={cn("ml-1", failed ? "text-destructive" : "text-muted-foreground")}>{label}</span>
        {!hideDetails && <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition", expanded && "rotate-180")} />}
      </button>
      {expanded && !hideDetails && (
        <div className="space-y-2 border-t border-border px-3 py-2 font-mono">
          {args && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Parameters:</p>
              <pre className="whitespace-pre-wrap break-all">{args}</pre>
            </div>
          )}
          {toolCall.results && (
            <div>
              <p className="mb-1 font-sans font-medium text-muted-foreground">Result:</p>
              <pre className="whitespace-pre-wrap break-all">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
