import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/services/auth-service";
import { validateResetToken } from "@/lib/services/token-service";

export async function POST(request: Request) {
  const { token, password, confirmPassword } = await request.json();

  if (!token || !password || password !== confirmPassword) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpires || !validateResetToken(token, user.resetTokenExpires)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
        emailVerified: user.emailVerified || new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
