"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markAttendance(formData: FormData) {
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
  const sessionId = String(formData.get("session_id") ?? "").trim();
  const volunteerId = String(formData.get("volunteer_id") ?? "").trim();
  const attendanceStatus = String(
    formData.get("attendance_status") ?? ""
  ).trim();
  const reason = String(formData.get("reason") ?? "").trim();

  // 4. Validate UUIDs
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(sessionId) || !uuidPattern.test(volunteerId)) {
    redirect("/admin/attendance?error=invalid_session");
  }

  // 5. Validate status and reason
  if (!["PRESENT", "ABSENT"].includes(attendanceStatus)) {
    redirect(`/admin/attendance/${sessionId}?error=invalid_status`);
  }

  if (!reason || reason.length > 1000) {
    redirect(`/admin/attendance/${sessionId}?error=invalid_reason`);
  }

  // 6. Find existing attendance
  const { data: existingAttendance, error: existingError } =
    await supabase
      .from("attendance")
      .select("id, status")
      .eq("session_id", sessionId)
      .eq("volunteer_id", volunteerId)
      .maybeSingle();

  if (existingError) {
    console.error("Attendance lookup error:", existingError.message);
    redirect(`/admin/attendance/${sessionId}?error=attendance_check_failed`);
  }

  // 7. Avoid unnecessary correction
  if (existingAttendance?.status === attendanceStatus) {
    redirect(`/admin/attendance/${sessionId}?unchanged=true`);
  }

  // 8. Insert new attendance or correct existing attendance
  let saveError;

  if (existingAttendance) {
    const { error } = await supabase.rpc("admin_correct_attendance", {
      p_attendance_id: existingAttendance.id,
      p_new_status: attendanceStatus as "PRESENT" | "ABSENT",
      p_reason: reason,
    });

    saveError = error;
  } else {
    const { error } = await supabase.rpc("admin_mark_attendance", {
      p_session_id: sessionId,
      p_volunteer_id: volunteerId,
      p_status: attendanceStatus as "PRESENT" | "ABSENT",
      p_reason: reason,
    });

    saveError = error;
  }

  if (saveError) {
    console.error("Attendance save error:", saveError.message);

    if (saveError.message.includes("Reason")) {
      redirect(`/admin/attendance/${sessionId}?error=invalid_reason`);
    }

    if (saveError.message.includes("Session")) {
      redirect(`/admin/attendance/${sessionId}?error=session_not_available`);
    }

    redirect(`/admin/attendance/${sessionId}?error=attendance_save_failed`);
  }

  // 9. Refresh relevant pages
  revalidatePath(`/admin/attendance/${sessionId}`);
  revalidatePath("/admin/attendance");
  revalidatePath("/volunteer/attendance");

  redirect(`/admin/attendance/${sessionId}?saved=true`);
}
