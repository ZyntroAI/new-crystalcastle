import * as React from "react";

/**
 * ZyntroAILoader — ตัวแสดงสถานะกำลังโหลดมาตรฐานของ ZyntroAI
 * - รองรับ variant: spinner | dots | bar
 * - รองรับ size: sm | md | lg
 * - รองรับ label (ข้อความใต้ตัวโหลด) และเต็มพื้นที่ผ่าน `fullscreen`
 * - เข้าถึงได้ (a11y): role="status", aria-live="polite", aria-label
 * - Standalone: ไม่พึ่งพา path alias ใด ๆ
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const sizeMap = {
  sm: { spinner: "h-4 w-4", text: "text-xs", bar: "h-1 w-24" },
  md: { spinner: "h-6 w-6", text: "text-sm", bar: "h-1.5 w-40" },
  lg: { spinner: "h-10 w-10", text: "text-base", bar: "h-2 w-64" },
};

const ZyntroAILoader = React.forwardRef(function ZyntroAILoader(
  {
    className,
    variant = "spinner",
    size = "md",
    label,
    fullscreen = false,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  const s = sizeMap[size] || sizeMap.md;
  const accessibleName = ariaLabel || label || "กำลังโหลด";

  let indicator = null;

  if (variant === "dots") {
    indicator = (
      <span className="inline-flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-current"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
    );
  } else if (variant === "bar") {
    indicator = (
      <span className={cx("block overflow-hidden rounded-full bg-slate-200", s.bar)}>
        <span className="block h-full w-1/2 animate-pulse rounded-full bg-current" />
      </span>
    );
  } else {
    indicator = (
      <svg className={cx("animate-spin", s.spinner)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    );
  }

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={accessibleName}
      className={cx(
        "inline-flex flex-col items-center justify-center gap-3 text-slate-600",
        fullscreen && "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {indicator}
      {label && <span className={cx("font-medium", s.text)}>{label}</span>}
      <span className="sr-only">{accessibleName}</span>
    </div>
  );
});

ZyntroAILoader.displayName = "ZyntroAILoader";

export { ZyntroAILoader };
export default ZyntroAILoader;
