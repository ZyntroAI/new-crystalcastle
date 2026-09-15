import React, { useState, useMemo } from "react";
import { Download, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { generateTypeScript, generateJSON, downloadFile, slugify } from "@/lib/exportTemplate";

const formats = [
  { key: "ts", label: "TypeScript", ext: "ts", mime: "text/typescript" },
  { key: "json", label: "JSON", ext: "json", mime: "application/json" },
];

export default function ExportDialog({ open, onOpenChange, template }) {
  const [format, setFormat] = useState("ts");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    if (!template) return "";
    return format === "ts" ? generateTypeScript(template) : generateJSON(template);
  }, [template, format]);

  const active = formats.find((f) => f.key === format);

  const handleDownload = () => {
    downloadFile(`${slugify(template?.name)}.${active.ext}`, code, active.mime);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export code</DialogTitle>
          <DialogDescription>
            Generate downloadable code from this template's backend section.
          </DialogDescription>
        </DialogHeader>

        {/* Format switch */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {formats.map((f) => (
            <button
              key={f.key}
              onClick={() => setFormat(f.key)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                format === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Code preview */}
        <pre className="max-h-[55vh] overflow-auto rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground">
          {code}
        </pre>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download .{active.ext}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
