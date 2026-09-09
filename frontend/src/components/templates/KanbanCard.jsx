import React from "react";
import { Link } from "react-router-dom";
import CompletenessMeter from "./CompletenessMeter";

export default function KanbanCard({ template }) {
  return (
    <Link
      to={`/templates/${template.id}`}
      className="block rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <p className="font-semibold leading-tight text-foreground">{template.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{template.category || "Uncategorized"}</p>
      {template.tags && template.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {template.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3">
        <CompletenessMeter template={template} />
      </div>
    </Link>
  );
}
