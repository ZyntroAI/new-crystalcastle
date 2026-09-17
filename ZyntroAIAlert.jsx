import * as React from "react";

/**
 * ZyntroAIAlert — กล่องแจ้งเตือนมาตรฐานของ ZyntroAI
 * ประกอบด้วย: ZyntroAIAlert, ZyntroAIAlertTitle, ZyntroAIAlertDescription
 * - รองรับ variant: info | success | warning | danger
 * - เข้าถึงได้ (a11y): role="alert" สำหรับ danger/warning, role="status" สำหรับ info/success
 * - Standalone: ไม่พึ่งพา path alias ใด ๆ
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const variantClasses = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
};

const defaultRole = {
  info: "status",
  success: "status",
  warning: "alert",
  danger: "alert",
};

const ZyntroAIAlert = React.forwardRef(function ZyntroAIAlert(
  { className, variant = "info", role, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role={role || defaultRole[variant] || "status"}
      className={cx(
        "relative w-full rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant] || variantClasses.info,
        className
      )}
      {...props}
    />
  );
});
ZyntroAIAlert.displayName = "ZyntroAIAlert";

const ZyntroAIAlertTitle = React.forwardRef(function ZyntroAIAlertTitle(
  { className, as: As = "h5", ...props },
  ref
) {
  return (
    <As
      ref={ref}
      className={cx("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
});
ZyntroAIAlertTitle.displayName = "ZyntroAIAlertTitle";

const ZyntroAIAlertDescription = React.forwardRef(function ZyntroAIAlertDescription(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("text-sm opacity-90 [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
});
ZyntroAIAlertDescription.displayName = "ZyntroAIAlertDescription";

export { ZyntroAIAlert, ZyntroAIAlertTitle, ZyntroAIAlertDescription };
export default ZyntroAIAlert;
