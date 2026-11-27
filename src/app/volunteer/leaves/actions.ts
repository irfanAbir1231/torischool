"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createInAppNotification } from "@/lib/notifications";

export async function submitLeaveApplication(formData: FormData) {
  // 1. Verify logged-in user
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify Volunteer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // 3. Read form data
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!startDate || !endDate || !reason) {
    redirect("/volunteer/leaves?error=missing_fields");
  }

  // 4. Validate dates
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
    redirect("/volunteer/leaves?error=invalid_date");
  }

  if (startDate > endDate) {
    redirect("/volunteer/leaves?error=invalid_date_range");
  }

  if (reason.length > 1000) {
    redirect("/volunteer/leaves?error=reason_too_long");
  }

  // 5. Create Admin Supabase client
  const adminSupabase = createAdminClient();

  // 6. Find Volunteer record
  const { data: volunteer, error: volunteerError } = await adminSupabase
    .from("volunteers")
    .select("id, status")
    .eq("profile_id", user.id)
    .single();

  if (volunteerError || !volunteer || volunteer.status !== "ACTIVE") {
    redirect("/volunteer/leaves?error=volunteer_not_found");
  }

  // 7. Insert Leave Application
  const { data: leave, error: insertError } = await adminSupabase
  .from("volunteer_leaves")
  .insert({
    volunteer_id: volunteer.id,
    start_date: startDate,
    end_date: endDate,
    reason,
    status: "PENDING",
  })
  .select("id")
  .single();

  if (insertError) {
    console.error("Leave application error:", insertError.message);
    redirect("/volunteer/leaves?error=application_failed");
  }
     // 8. Notify all admins about the new leave application
  try {
    const { data: admins, error: adminError } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("role", "ADMIN");

    if (adminError) {
      throw adminError;
    }

    if (admins && admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
         createInAppNotification({
         profileId: admin.id,
         title: "New Leave Application",
         message: `A volunteer has submitted a leave application from ${startDate} to ${endDate}.`,
         notificationType: "NEW_LEAVE_APPLICATION",
         dedupeKey: `NEW_LEAVE_APPLICATION_${leave.id}_${admin.id}`,
    })
        )
      );
    }
  } catch (notificationError) {
    console.error(
      "Leave application notification error:",
      notificationError
    );
  }
  // 8. Refresh page
  revalidatePath("/volunteer/leaves");

  redirect("/volunteer/leaves?submitted=1");
}