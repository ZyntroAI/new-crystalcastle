import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyVerificationToken } from "@/lib/services/token-service";

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const { valid, userId, email } = verifyVerificationToken(token);
  if (!valid || !userId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  try {
    await prisma.user.updateMany({
      where: { id: userId, email, verificationToken: token },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Email verified" });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
