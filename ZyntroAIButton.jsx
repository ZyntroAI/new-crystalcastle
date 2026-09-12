import * as React from "react";

/**
 * ZyntroAIButton — ปุ่มมาตรฐานของ ZyntroAI
 * - รองรับ variant: primary | secondary | outline | ghost | destructive
 * - รองรับ size: sm | md | lg
 * - รองรับสถานะ loading / disabled / fullWidth
 * - เข้าถึงได้ (a11y): ใช้ aria-busy, aria-disabled และซ่อน spinner จาก screen reader
 * - Standalone: ไม่พึ่งพา path alias ใด ๆ
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variantClasses = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400",
  outline:
    "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-6 text-base",
};

const ZyntroAIButton = React.forwardRef(function ZyntroAIButton(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled = false,
    type = "button",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cx(
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

ZyntroAIButton.displayName = "ZyntroAIButton";

export { ZyntroAIButton, cx };
export default ZyntroAIButton;
