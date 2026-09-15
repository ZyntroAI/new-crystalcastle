import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ChevronRight, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function TemplateTable({
  templates,
  onDelete,
  onDuplicate,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-foreground">No templates yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first full-stack master template to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-10 px-5 py-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated</th>
            <th className="w-20 px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {templates.map((t) => (
            <tr key={t.id} className={`group transition-colors hover:bg-muted/30 ${selectedIds?.has(t.id) ? "bg-primary/5" : ""}`}>
              <td className="px-5 py-3.5">
                <Checkbox
                  checked={selectedIds?.has(t.id) || false}
                  onCheckedChange={() => onToggleSelect(t.id)}
                  aria-label={`Select ${t.name}`}
                />
              </td>
              <td className="px-5 py-3.5">
                <Link to={`/templates/${t.id}`} className="block">
                  <span className="font-medium text-foreground">{t.name}</span>
                </Link>
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">{t.category || "—"}</td>
              <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
              <td className="px-5 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {(t.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {(t.tags || []).length > 3 && (
                    <span className="text-xs text-muted-foreground">+{t.tags.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">
                {t.updated_date ? formatDistanceToNow(new Date(t.updated_date), { addSuffix: true }) : "—"}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                   <button
                     onClick={() => onDuplicate(t)}
                     className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                     title="Duplicate"
                   >
                     <Copy className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => onDelete(t)}
                     className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                     title="Delete"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                  <Link
                    to={`/templates/${t.id}`}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
