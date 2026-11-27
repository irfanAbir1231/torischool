import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  // Handle PKCE email links
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/set-password`);
    }

    console.error("PKCE verification error:", error.message);
  }

  // Handle invitation and password recovery OTP links
  if (
    tokenHash &&
    (type === "invite" || type === "recovery")
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/set-password`);
    }

    console.error("OTP verification error:", error.message);
  }

  console.error("Auth callback parameters:", {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
  });

  return NextResponse.redirect(
    `${origin}/login?error=verification_failed`
  );
}