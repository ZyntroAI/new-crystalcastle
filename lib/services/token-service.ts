import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const EMAIL_VERIFICATION_SECRET = process.env.EMAIL_VERIFICATION_SECRET!;
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET!;

// ─── Generate Email Verification Token ───
export function createVerificationToken(userId: string, email: string) {
  const token = jwt.sign({ userId, email }, EMAIL_VERIFICATION_SECRET, {
    expiresIn: "24h",
  });
  return token;
}

// ─── Verify Email Token ───
export function verifyVerificationToken(token: string) {
  try {
    const decoded = jwt.verify(token, EMAIL_VERIFICATION_SECRET) as {
      userId: string;
      email: string;
    };
    return { valid: true, ...decoded };
  } catch {
    return { valid: false, userId: null, email: null };
  }
}

// ─── Generate Password Reset Token ───
export function createPasswordResetToken(userId: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expires };
}

// ─── Validate Reset Token ───
export function validateResetToken(token: string, expiresAt?: Date) {
  if (!expiresAt) return false;
  return new Date() < expiresAt;
}
