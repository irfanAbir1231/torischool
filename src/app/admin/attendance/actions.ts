"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSession(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {

    redirect("/login");
  }

  // 2. Verify Admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Get form values
  const sessionType = formData.get("session_type") as string;
  const sessionDate = formData.get("session_date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const location = formData.get("location") as string;

  // 4. Validate session type
  if (!["REGULAR", "EDUCATION_CAMP"].includes(sessionType)) {
    redirect("/admin/attendance?error=invalid_session_type");
  }

  // 5. Validate required fields
  if (!sessionDate || !startTime || !endTime) {
    redirect("/admin/attendance?error=missing_fields");
  }

  // 6. Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionDate)) {
    redirect("/admin/attendance?error=invalid_date");
  }

  // 7. Validate time
  if (startTime >= endTime) {
    redirect("/admin/attendance?error=invalid_time");
  }

  // 8. Insert session
  const { error: insertError } = await supabase
    .from("sessions")
    .insert({
      session_type: sessionType,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      location: location.trim() || null,
      status: "SCHEDULED",
    });

    if (insertError) {
  console.error("Session creation error:", insertError);

  if (insertError.code === "23505") {
    redirect("/admin/attendance?error=session_already_exists");
  }

  redirect("/admin/attendance?error=session_creation_failed");
}
  // 9. Refresh page
  revalidatePath("/admin/attendance");

  redirect("/admin/attendance?created=true");

}
export async function completeSession(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify Admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Get session ID
  const sessionId = formData.get("session_id") as string;

  if (
    !sessionId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      sessionId
    )
  ) {
    redirect("/admin/attendance?error=invalid_session");
  }

  // 4. Fetch session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, session_date, end_time, status")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    redirect("/admin/attendance?error=session_not_found");
  }

  // 5. Only scheduled sessions can be completed
  if (session.status !== "SCHEDULED") {
    redirect(
      `/admin/attendance/${sessionId}?error=session_not_scheduled`
    );
  }

  // 6. Get current Bangladesh date and time
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const currentDate = dateFormatter.format(now);
  const currentTime = timeFormatter.format(now);

  // 7. Prevent completing future sessions
  if (session.session_date > currentDate) {
    redirect(
      `/admin/attendance/${sessionId}?error=future_session`
    );
  }

  // 8. Prevent completing before session end time
  if (
    session.session_date === currentDate &&
    session.end_time > currentTime
  ) {
    redirect(
      `/admin/attendance/${sessionId}?error=session_not_finished`
    );
  }

  // 9. Complete session
  const { data: updatedSession, error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "COMPLETED",
    })
    .eq("id", sessionId)
    .eq("status", "SCHEDULED")
    .select("id")
    .maybeSingle();

  if (updateError || !updatedSession) {
    console.error("Session completion error:", updateError);

    redirect(
      `/admin/attendance/${sessionId}?error=session_completion_failed`
    );
  }

  // 10. Refresh pages
  revalidatePath("/admin/attendance");
  revalidatePath(`/admin/attendance/${sessionId}`);

  redirect(
    `/admin/attendance/${sessionId}?completed=true`
  );
}