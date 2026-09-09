import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getRecent } from "@/lib/recentTemplates";
import StatusBadge from "./StatusBadge";

export default function RecentTemplates() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    const ids = getRecent();
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    base44.entities.MasterTemplate.filter({ id: { $in: ids } })
      .then((data) => {
        const byId = Object.fromEntries(data.map((t) => [t.id, t]));
        setItems(ids.map((id) => byId[id]).filter(Boolean));
      })
      .catch(() => setItems([]));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Recently viewed</h2>
      </div>
      <ul className="divide-y divide-border">
        {items.map((t) => (
          <li key={t.id}>
            <Link
              to={`/templates/${t.id}`}
              className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.category || "Uncategorized"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={t.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
