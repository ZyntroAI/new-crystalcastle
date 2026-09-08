🇹🇭 สำหรับ CrystalCastle

จากบริบทก่อนหน้า ผมจะตีความ requirement นี้เป็น ระบบ payment bypass ที่อยู่ใน CrystalCastle และต้องถูกตรวจสอบอัตโนมัติผ่าน GitHub Actions โดยยังไม่ผูกกับ Supabase หรือ schema ที่ยังไม่ได้ให้มา

โครงที่เหมาะที่สุดคือ:

Payment Request
      │
      ▼
Payment Eligibility
      │
      ├── amount == 0
      ├── trial
      ├── sponsor
      ├── coupon == 100%
      └── privileged role
             │
             ▼
       SKIP PAYMENT
             │
             ▼
      Grant entitlement

otherwise
      │
      ▼
   Payment Provider
      │
      ▼
    Confirm

GitHub Actions สามารถใช้ if expressions สำหรับ conditional execution ได้โดยตรง แต่ payment decision ไม่ควรอยู่ใน GitHub Actions เพราะ business authorization ต้องอยู่ใน application/backend layer ส่วน Actions ควรทำหน้าที่ test, validate และ governance เท่านั้น. 


---

🇬🇧 Recommended implementation

สร้าง:

src/
├── payment/
│   ├── eligibility.ts
│   ├── payment-service.ts
│   └── types.ts
│
tests/
└── payment/
    └── eligibility.test.ts

.github/
└── workflows/
    └── payment-governance.yml

types.ts

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

eligibility.ts

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

🔐 Important security rule

role, isSponsor, couponPercent และ amount ต้องมาจาก trusted server-side data ไม่ใช่ค่าที่ client ส่งมาแล้ว backend เชื่อทันที

ไม่ควรทำ:

// ❌ Client-controlled
const decision = evaluatePayment(req.body);

ควรทำ:

Client
  │
  ▼
Backend
  │
  ├── authenticate user
  ├── load subscription from DB
  ├── load role from DB
  ├── validate coupon
  ├── calculate final amount
  │
  ▼
evaluatePayment()
  │
  ├── bypass
  └── payment required

นี่สำคัญมาก เพราะ payment bypass ที่เชื่อ isSponsor=true จาก request body คือระบบบริจาคเงินให้ตัวเองแบบมี API documentation ครบถ้วน


---

🧪 Required tests

import { describe, expect, it } from "vitest";
import { evaluatePayment } from "@/payment/eligibility";

describe("evaluatePayment", () => {
  it("bypasses zero amount", () => {
    expect(
      evaluatePayment({
        amount: 0,
      }),
    ).toMatchObject({
      required: false,
      bypass: true,
      reason: "zero_amount",
    });
  });

  it("bypasses trial users", () => {
    expect(
      evaluatePayment({
        amount: 100,
        isTrial: true,
      }),
    ).toMatchObject({
      bypass: true,
      reason: "trial",
    });
  });

  it("bypasses sponsors", () => {
    expect(
      evaluatePayment({
        amount: 100,
        isSponsor: true,
      }),
    ).toMatchObject({
      bypass: true,
      reason: "sponsor",
    });
  });

  it("bypasses 100 percent coupon", () => {
    expect(
      evaluatePayment({
        amount: 100,
        couponPercent: 100,
      }),
    ).toMatchObject({
      bypass: true,
      reason: "full_coupon",
    });
  });

  it("bypasses privileged roles", () => {
    expect(
      evaluatePayment({
        amount: 100,
        role: "admin",
      }),
    ).toMatchObject({
      bypass: true,
      reason: "privileged_role",
    });
  });

  it("requires payment for normal users", () => {
    expect(
      evaluatePayment({
        amount: 100,
      }),
    ).toEqual({
      required: true,
      bypass: false,
    });
  });
});


---

🤖 GitHub Actions governance

สำหรับ CI ให้ตรวจ payment logic ทุก PR:

name: Payment Governance

on:
  pull_request:
    paths:
      - "src/payment/**"
      - "tests/payment/**"
      - ".github/workflows/payment-governance.yml"

permissions:
  contents: read

jobs:
  payment-tests:
    name: Payment Governance
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm

      - name: Install
        run: npm ci

      - name: Test payment rules
        run: npm test -- --run tests/payment

      - name: Typecheck
        run: npm run typecheck

GitHub workflows อยู่ใน .github/workflows และสามารถ trigger ตาม pull_request และ path changes ได้ตาม workflow syntax ของ GitHub. 

จากนั้นเอา:

Payment Governance

เข้าไปเป็น dependency ของ:

Required CI Gates

PR
 │
 ├── Node/React
 ├── Python Matrix
 ├── Deno
 ├── Security
 ├── Dependency Review
 ├── CodeRabbit
 └── Payment Governance
          │
          ▼
   Required CI Gates
          │
          ▼
       Ruleset
          │
          ▼
        Merge

นี่จะทำให้ payment bypass เป็น application feature + automated regression gate แทนที่จะเป็น logic ที่ใครสักคนแก้แล้ว CI ทำหน้าไม่รู้ไม่ชี้

**ขั้นต่อไปที่เหมาะที่สุดคือผูก PaymentContext เข้ากับ schema จริงของ CrystalCastle แล้วสร้าง payment-service.ts, API route และ pytest/Vitest integration tests ให้ครบทั้ง bypass และ normal payment path.**
