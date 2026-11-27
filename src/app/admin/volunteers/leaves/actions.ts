"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createInAppNotification } from "@/lib/notifications";

export async function reviewLeaveApplication(formData: FormData) {
  const supabase = await createClient();

  // Check logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/login");
  }

  const leaveId = formData.get("leave_id")?.toString();
  const status = formData.get("status")?.toString();

  if (!leaveId || !/^[0-9a-f-]{36}$/i.test(leaveId)) {
    redirect("/admin/volunteers/leaves?error=invalid_id");
  }

  if (status !== "APPROVED" && status !== "REJECTED") {
    redirect("/admin/volunteers/leaves?error=invalid_status");
  }

  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("volunteer_leaves")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", leaveId)
    .eq("status", "PENDING")
    .select("id");

  if (error || !data || data.length === 0) {
    redirect("/admin/volunteers/leaves?error=review_failed");
  }

      // Notify the volunteer about the leave review result
  try {
    const { data: leave } = await adminSupabase
      .from("volunteer_leaves")
      .select("volunteer_id, start_date, end_date")
      .eq("id", leaveId)
      .single();

    if (leave) {
      const { data: volunteer } = await adminSupabase
        .from("volunteers")
        .select("profile_id")
        .eq("id", leave.volunteer_id)
        .single();

      if (volunteer?.profile_id) {
        const isApproved = status === "APPROVED";

        await createInAppNotification({
          profileId: volunteer.profile_id,
          title: isApproved
            ? "Leave Application Approved"
            : "Leave Application Rejected",
          message: isApproved
            ? `Your leave application from ${leave.start_date} to ${leave.end_date} has been approved.`
            : `Your leave application from ${leave.start_date} to ${leave.end_date} has been rejected.`,
          notificationType: isApproved
            ? "LEAVE_APPROVED"
            : "LEAVE_REJECTED",
            dedupeKey: `LEAVE_REVIEW_${leaveId}_${status}`,
        });
      }
    }
  } catch (notificationError) {
    console.error(
      "Leave review notification error:",
      notificationError
    );
  }
  revalidatePath("/admin/volunteers/leaves");
  revalidatePath("/volunteer/leaves");

  redirect("/admin/volunteers/leaves?success=true");
}