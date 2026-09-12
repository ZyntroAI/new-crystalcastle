#!/usr/bin/env tsx

import "dotenv/config";
import { randomUUID } from "crypto";
import { hashPassword } from "../lib/services/auth-service";
import prisma from "../lib/db";

const COMMANDS = {
  CREATE_USER: "create-user",
  LIST_USERS: "list-users",
  DELETE_USER: "delete-user",
  VERIFY_EMAIL: "verify-email",
  RESET_PASSWORD: "reset-password",
  GENERATE_SECRET: "generate-secret",
  SETUP: "setup",
} as const;

type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

const args = process.argv.slice(2);
const [command, ...rest] = args;

// ─── Create User ───
async function createUser(name: string, email: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.error("❌ User already exists:", email);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
      passwordHash,
      provider: "credentials",
    },
  });

  console.log("✅ User created:");
  console.table({ id: user.id, name: user.name, email: user.email });
  process.exit(0);
}

// ─── List All Users ───
async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      provider: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (users.length === 0) {
    console.log("📭 No users found");
    return;
  }

  console.table(users);
  console.log(`\n📊 Total ${users.length} user(s)`);
  process.exit(0);
}

// ─── Delete User ───
async function deleteUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("❌ User not found:", email);
    process.exit(1);
  }

  await prisma.user.delete({ where: { email } });
  console.log("🗑️  User deleted:", email);
  process.exit(0);
}

// ─── Manually Verify Email ───
async function verifyEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("❌ User not found:", email);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date(), verificationToken: null },
  });

  console.log("✅ Email verified:", email);
  process.exit(0);
}

// ─── Admin Reset Password ───
async function resetPassword(email: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("❌ User not found:", email);
    process.exit(1);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  console.log("✅ Password reset for:", email);
  process.exit(0);
}

// ─── Generate Secure Secret ───
function generateSecret(length = 32) {
  const secret = Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  console.log(`🔑 Generated secret (${length * 4} bits):\n${secret}`);
  console.log("\n👉 Add to .env.local:");
  console.log(`NEXTAUTH_SECRET="${secret}"`);
  console.log(`EMAIL_VERIFICATION_SECRET="${secret}"`);
  console.log(`PASSWORD_RESET_SECRET="${secret}"`);
  process.exit(0);
}

// ─── Quick Setup Wizard ───
async function setup() {
  console.log("🚀 Auth Environment Setup\n");
  const { execSync } = require("child_process");

  try {
    console.log("📦 Pushing database schema...");
    execSync("npx prisma db push", { stdio: "inherit" });

    console.log("\n🔑 Generating secrets...");
    const secret = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    console.log("\n✅ Add these to your .env.local:");
    console.log("─".repeat(60));
    console.log(`NEXTAUTH_URL="http://localhost:3000"`);
    console.log(`NEXTAUTH_SECRET="${secret}"`);
    console.log(`EMAIL_VERIFICATION_SECRET="${secret}"`);
    console.log(`PASSWORD_RESET_SECRET="${secret}"`);
    console.log("─".repeat(60));
    console.log("\n✅ Setup complete! 🎉");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  }
  process.exit(0);
}

// ─── Help Screen ───
function showHelp() {
  console.log(`
🔐 Auth CLI — Next.js Auth Management Tool

Usage:
  pnpm auth <command> [options]

Commands:
  ${COMMANDS.CREATE_USER} <name> <email> <password>   Create a new user
  ${COMMANDS.LIST_USERS}                                   List all users
  ${COMMANDS.DELETE_USER} <email>                       Delete a user
  ${COMMANDS.VERIFY_EMAIL} <email>                      Manually verify email
  ${COMMANDS.RESET_PASSWORD} <email> <new-password>     Reset user password
  ${COMMANDS.GENERATE_SECRET} [length]                   Generate secure secret
  ${COMMANDS.SETUP}                                        Quick setup wizard

Examples:
  pnpm auth ${COMMANDS.CREATE_USER} "Admin" "admin@example.com" "Str0ng!Pass"
  pnpm auth ${COMMANDS.VERIFY_EMAIL} "admin@example.com"
  pnpm auth ${COMMANDS.LIST_USERS}
  pnpm auth ${COMMANDS.SETUP}
`);
}

// ─── Router ───
async function main() {
  switch (command as Command) {
    case COMMANDS.CREATE_USER:
      if (rest.length < 3) throw new Error("Usage: create-user <name> <email> <password>");
      await createUser(rest[0], rest[1], rest[2]);
      break;
    case COMMANDS.LIST_USERS:
      await listUsers();
      break;
    case COMMANDS.DELETE_USER:
      if (rest.length < 1) throw new Error("Usage: delete-user <email>");
      await deleteUser(rest[0]);
      break;
    case COMMANDS.VERIFY_EMAIL:
      if (rest.length < 1) throw new Error("Usage: verify-email <email>");
      await verifyEmail(rest[0]);
      break;
    case COMMANDS.RESET_PASSWORD:
      if (rest.length < 2) throw new Error("Usage: reset-password <email> <new-password>");
      await resetPassword(rest[0], rest[1]);
      break;
    case COMMANDS.GENERATE_SECRET:
      generateSecret(rest[0] ? parseInt(rest[0]) : 32);
      break;
    case COMMANDS.SETUP:
      await setup();
      break;
    default:
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Error:", err instanceof Error ? err.message : err);
  showHelp();
  process.exit(1);
});
