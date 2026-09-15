import * as React from "react";

/**
 * ZyntroAIBadge — ป้ายกำกับสถานะมาตรฐานของ ZyntroAI
 * - รองรับ variant: default | success | warning | danger | info | outline
 * - รองรับ size: sm | md
 * - รองรับ dot (จุดสถานะนำหน้า) และ asChild ผ่าน `as`
 * - Standalone: ไม่พึ่งพา path alias ใด ๆ
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const variantClasses = {
  default: "bg-slate-100 text-slate-800 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  outline: "bg-transparent text-slate-700 border-slate-300",
};

const dotClasses = {
  default: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-sky-500",
  outline: "bg-slate-400",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const ZyntroAIBadge = React.forwardRef(function ZyntroAIBadge(
  { className, variant = "default", size = "md", dot = false, as: As = "span", children, ...props },
  ref
) {
  return (
    <As
      ref={ref}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium leading-none",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cx(
            "h-1.5 w-1.5 rounded-full",
            dotClasses[variant] || dotClasses.default
          )}
        />
      )}
      {children}
    </As>
  );
});

ZyntroAIBadge.displayName = "ZyntroAIBadge";

export { ZyntroAIBadge };
export default ZyntroAIBadge;
