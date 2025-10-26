import { VerifyEmailTemplate } from "@/components/modules/general/email-templates/verify-email";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_3QxAiSLw_MJwA4wzJYJiUoyRfqqFiJRD5");

export async function GET() {
  try {
    console.log("Attempting to send verification email...");

    // Generate verification link (in production, this should be a real token)
    const verificationLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/verify-email?token=demo-token-123`;

    const { data, error } = await sendEmail(
      "matheshraju1000@gmail.com",
      "Verify Your Email - ProTribe",
      VerifyEmailTemplate({
        firstName: "Mathesh",
        verificationLink: verificationLink,
        trainerName: "John Doe", // Optional: pass trainer name
      })
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Catch error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
