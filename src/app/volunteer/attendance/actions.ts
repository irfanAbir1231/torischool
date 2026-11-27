"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function volunteerCheckIn(formData: FormData) {
  const supabase = await createClient();

  // Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify Volunteer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // Read session ID
  const sessionId = String(
    formData.get("session_id") ?? ""
  ).trim();

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(sessionId)) {
    redirect("/volunteer/dashboard?error=invalid_session");
  }

  // Call secure database function
  const { error } = await supabase.rpc(
    "volunteer_check_in",
    {
      p_session_id: sessionId,
    }
  );

  if (error) {
    console.error("Volunteer check-in error:", error.message);

    if (error.message.includes("duplicate key")) {
      redirect("/volunteer/dashboard?error=already_checked_in");
    }

    if (error.message.includes("Check-in window")) {
      redirect("/volunteer/dashboard?error=checkin_closed");
    }

    redirect("/volunteer/dashboard?error=checkin_failed");
  }

  revalidatePath("/volunteer/dashboard");
  revalidatePath("/volunteer/attendance");

  redirect("/volunteer/dashboard?checked_in=1");
}