"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVolunteerStatus(formData: FormData) {
  // 1. Get form data
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const newStatus = String(formData.get("status") ?? "");

  // 2. Validate input
  if (
    !volunteerId ||
    !["ACTIVE", "INACTIVE"].includes(newStatus)
  ) {
    redirect("/admin/volunteers/registered");
  }

  // 3. Verify logged-in user
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 4. Verify Admin role
  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || adminProfile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 5. Create admin client
  const adminSupabase = createAdminClient();

  // 6. Check volunteer exists
  const { data: volunteer, error: volunteerError } =
    await adminSupabase
      .from("volunteers")
      .select("id")
      .eq("id", volunteerId)
      .single();

  if (volunteerError || !volunteer) {
    redirect("/admin/volunteers/registered");
  }

  // 7. Prepare update data
  const inactiveDate =
    newStatus === "INACTIVE"
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Dhaka",
        }).format(new Date())
      : null;

  // 8. Update volunteer status
  const { error: updateError } = await adminSupabase
    .from("volunteers")
    .update({
      status: newStatus,
      inactive_date: inactiveDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", volunteerId);

  if (updateError) {
    redirect(
      `/admin/volunteers/registered/${volunteerId}?error=status_update_failed`
    );
  }

  // 9. Revalidate pages
  revalidatePath("/admin/volunteers/registered");
  revalidatePath(`/admin/volunteers/registered/${volunteerId}`);

  // 10. Redirect after success
  redirect(
    `/admin/volunteers/registered/${volunteerId}?statusUpdated=true`
  );
}