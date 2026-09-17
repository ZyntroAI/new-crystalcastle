import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createPasswordResetToken } from "@/lib/services/token-service";
import { sendPasswordResetEmail } from "@/lib/services/email-service";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success to prevent email enumeration
      return NextResponse.json({ success: true, message: "If account exists, reset email sent" });
    }

    const { token, expires } = createPasswordResetToken(user.id);
    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    await sendPasswordResetEmail(email, token);
    return NextResponse.json({ success: true, message: "If account exists, reset email sent" });
  } catch {
    return NextResponse.json({ success: true, message: "If account exists, reset email sent" });
  }
}
