export type PaymentBypassReason =
  | "zero_amount"
  | "trial"
  | "sponsor"
  | "full_coupon"
  | "privileged_role";

export interface PaymentContext {
  amount: number;
  role?: string;
  isTrial?: boolean;
  isSponsor?: boolean;
  couponPercent?: number;
}

export interface PaymentDecision {
  required: boolean;
  bypass: boolean;
  reason?: PaymentBypassReason;
}
