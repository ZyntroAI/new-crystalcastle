import { describe, expect, it } from "vitest";

import { evaluatePayment } from "@/payment/eligibility";

describe("evaluatePayment", () => {
  describe("payment bypass", () => {
    it("bypasses payment when amount is zero", () => {
      const result = evaluatePayment({
        amount: 0,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "zero_amount",
      });
    });

    it("bypasses payment for trial users", () => {
      const result = evaluatePayment({
        amount: 100,
        isTrial: true,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "trial",
      });
    });

    it("bypasses payment for sponsors", () => {
      const result = evaluatePayment({
        amount: 100,
        isSponsor: true,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "sponsor",
      });
    });

    it("bypasses payment for a 100% coupon", () => {
      const result = evaluatePayment({
        amount: 100,
        couponPercent: 100,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "full_coupon",
      });
    });

    it.each([
      "admin",
      "owner",
      "internal",
    ])("bypasses payment for %s role", (role) => {
      const result = evaluatePayment({
        amount: 100,
        role,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "privileged_role",
      });
    });
  });

  describe("payment required", () => {
    it("requires payment for a normal user", () => {
      const result = evaluatePayment({
        amount: 100,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("requires payment when coupon is less than 100%", () => {
      const result = evaluatePayment({
        amount: 100,
        couponPercent: 50,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("requires payment for a non-privileged role", () => {
      const result = evaluatePayment({
        amount: 100,
        role: "user",
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("requires payment when trial is explicitly false", () => {
      const result = evaluatePayment({
        amount: 100,
        isTrial: false,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("requires payment when sponsor is explicitly false", () => {
      const result = evaluatePayment({
        amount: 100,
        isSponsor: false,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });
  });

  describe("boundary conditions", () => {
    it("bypasses negative amount", () => {
      const result = evaluatePayment({
        amount: -1,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "zero_amount",
      });
    });

    it("requires payment for a positive amount", () => {
      const result = evaluatePayment({
        amount: 0.01,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("does not bypass for a 99% coupon", () => {
      const result = evaluatePayment({
        amount: 100,
        couponPercent: 99,
      });

      expect(result).toEqual({
        required: true,
        bypass: false,
      });
    });

    it("bypasses exactly at 100% coupon", () => {
      const result = evaluatePayment({
        amount: 100,
        couponPercent: 100,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "full_coupon",
      });
    });
  });

  describe("priority", () => {
    it("uses zero amount as the first bypass reason", () => {
      const result = evaluatePayment({
        amount: 0,
        isTrial: true,
        isSponsor: true,
        couponPercent: 100,
        role: "admin",
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "zero_amount",
      });
    });

    it("uses trial before sponsor", () => {
      const result = evaluatePayment({
        amount: 100,
        isTrial: true,
        isSponsor: true,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "trial",
      });
    });

    it("uses sponsor before coupon", () => {
      const result = evaluatePayment({
        amount: 100,
        isSponsor: true,
        couponPercent: 100,
      });

      expect(result).toEqual({
        required: false,
        bypass: true,
        reason: "sponsor",
      });
    });
  });
});
