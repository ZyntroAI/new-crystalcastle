import React, { useState, useEffect } from "react";

export default function JsonEditor({ value, onChange, placeholder }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setText(JSON.stringify(value ?? {}, null, 2));
      setError(null);
    } catch {
      setText("{}");
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);
    try {
      const parsed = JSON.parse(raw || "{}");
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder || "{}"}
        spellCheck={false}
        className="w-full h-[420px] rounded-xl border border-border bg-muted/30 p-4 font-mono text-[13px] leading-relaxed text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
      />
      {error && (
        <div className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          Invalid JSON: {error}
        </div>
      )}
    </div>
  );
}
