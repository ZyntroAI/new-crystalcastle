import React from "react";
import { Trash2, X, CheckCircle2 } from "lucide-react";

const statuses = ["draft", "ready", "deployed"];

export default function BulkActionBar({ count, onClear, onDelete, onSetStatus, busy }) {
  if (count === 0) return null;
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {count}
        </span>
        <span className="text-sm font-medium text-foreground">
          {count} template{count > 1 ? "s" : ""} selected
        </span>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Set status:</span>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => onSetStatus(s)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium capitalize text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {s}
          </button>
        ))}
        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
