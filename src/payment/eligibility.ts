import type {
  PaymentContext,
  PaymentDecision,
} from "./types";

const PRIVILEGED_ROLES = new Set([
  "admin",
  "owner",
  "internal",
]);

export function evaluatePayment(
  context: PaymentContext,
): PaymentDecision {
  if (context.amount <= 0) {
    return {
      required: false,
      bypass: true,
      reason: "zero_amount",
    };
  }

  if (context.isTrial === true) {
    return {
      required: false,
      bypass: true,
      reason: "trial",
    };
  }

  if (context.isSponsor === true) {
    return {
      required: false,
      bypass: true,
      reason: "sponsor",
    };
  }

  if (context.couponPercent === 100) {
    return {
      required: false,
      bypass: true,
      reason: "full_coupon",
    };
  }

  if (
    context.role &&
    PRIVILEGED_ROLES.has(context.role)
  ) {
    return {
      required: false,
      bypass: true,
      reason: "privileged_role",
    };
  }

  return {
    required: true,
    bypass: false,
  };
}
