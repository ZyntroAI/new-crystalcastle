import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { createVerificationToken } from "@/lib/services/token-service";
import { sendVerificationEmail } from "@/lib/services/email-service";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.emailVerified) {
      return NextResponse.json({ message: "Already verified" }, { status: 200 });
    }

    const token = createVerificationToken(user.id, user.email!);
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token },
    });

    await sendVerificationEmail(user.email!, token);
    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
