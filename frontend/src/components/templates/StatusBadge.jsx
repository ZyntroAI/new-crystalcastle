import React from "react";
import { cn } from "@/lib/utils";

const styles = {
  draft: "bg-amber-100 text-amber-700 ring-amber-200",
  ready: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  deployed: "bg-indigo-100 text-indigo-700 ring-indigo-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset",
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      )}
    >
      {status}
    </span>
  );
}
