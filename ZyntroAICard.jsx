import * as React from "react";

/**
 * ZyntroAICard — ชุดการ์ดมาตรฐานของ ZyntroAI
 * ประกอบด้วย: ZyntroAICard, ZyntroAICardHeader, ZyntroAICardTitle,
 *             ZyntroAICardDescription, ZyntroAICardContent, ZyntroAICardFooter
 * - รองรับ variant: default | elevated | outline
 * - Standalone: ไม่พึ่งพา path alias ใด ๆ
 */
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const cardVariantClasses = {
  default: "bg-white border border-slate-200",
  elevated: "bg-white border border-slate-200 shadow-md",
  outline: "bg-transparent border border-slate-300",
};

const ZyntroAICard = React.forwardRef(function ZyntroAICard(
  { className, variant = "default", as: As = "div", ...props },
  ref
) {
  return (
    <As
      ref={ref}
      className={cx(
        "rounded-lg text-slate-900",
        cardVariantClasses[variant] || cardVariantClasses.default,
        className
      )}
      {...props}
    />
  );
});
ZyntroAICard.displayName = "ZyntroAICard";

const ZyntroAICardHeader = React.forwardRef(function ZyntroAICardHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
});
ZyntroAICardHeader.displayName = "ZyntroAICardHeader";

const ZyntroAICardTitle = React.forwardRef(function ZyntroAICardTitle(
  { className, as: As = "h3", ...props },
  ref
) {
  return (
    <As
      ref={ref}
      className={cx("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});
ZyntroAICardTitle.displayName = "ZyntroAICardTitle";

const ZyntroAICardDescription = React.forwardRef(function ZyntroAICardDescription(
  { className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cx("text-sm text-slate-500", className)}
      {...props}
    />
  );
});
ZyntroAICardDescription.displayName = "ZyntroAICardDescription";

const ZyntroAICardContent = React.forwardRef(function ZyntroAICardContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cx("p-6 pt-0", className)} {...props} />;
});
ZyntroAICardContent.displayName = "ZyntroAICardContent";

const ZyntroAICardFooter = React.forwardRef(function ZyntroAICardFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
});
ZyntroAICardFooter.displayName = "ZyntroAICardFooter";

export {
  ZyntroAICard,
  ZyntroAICardHeader,
  ZyntroAICardTitle,
  ZyntroAICardDescription,
  ZyntroAICardContent,
  ZyntroAICardFooter,
};
export default ZyntroAICard;
