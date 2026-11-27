"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createInAppNotification } from "@/lib/notifications";

export async function registerVolunteer(formData: FormData) {
  // 1. Verify logged-in user
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify Admin role
  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || adminProfile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Read form data
  const applicationId = String(
    formData.get("application_id") ?? ""
  ).trim();

  const joiningDate = String(
    formData.get("joining_date") ?? ""
  ).trim();

  if (!applicationId || !joiningDate) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=missing_fields`
    );
  }

  // 4. Strict joining date validation
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(joiningDate)) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=invalid_date`
    );
  }

  const [year, month, day] = joiningDate.split("-").map(Number);

  const dateCheck = new Date(Date.UTC(year, month - 1, day));

  const validDate =
    dateCheck.getUTCFullYear() === year &&
    dateCheck.getUTCMonth() === month - 1 &&
    dateCheck.getUTCDate() === day;

  if (!validDate) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=invalid_date`
    );
  }

  // 5. Create Admin Supabase client
  const adminSupabase = createAdminClient();

  // 6. Fetch application
  const { data: application, error: applicationError } =
    await adminSupabase
      .from("volunteer_applications")
      .select("id, full_name, email, status")
      .eq("id", applicationId)
      .single();

  if (applicationError || !application) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=application_not_found`
    );
  }

  // 7. Ensure application is SELECTED
  if (application.status !== "SELECTED") {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=not_selected`
    );
  }

  // 8. Check existing volunteer registration
  const { data: existingVolunteer, error: existingError } =
    await adminSupabase
      .from("volunteers")
      .select("id")
      .eq("application_id", applicationId)
      .maybeSingle();

  if (existingError) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=database_error`
    );
  }

  if (existingVolunteer) {
    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=already_registered`
    );
  }

  // 9. Generate Volunteer Code
  const volunteerCode = `TORI-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // 10. Send Supabase Invitation Email and create Auth User
  const { data: inviteData, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(
      application.email,
      {
        redirectTo: `${
   process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000")
   }/auth/callback`,
        data: {
          full_name: application.full_name,
        },
      }
    );

  if (inviteError || !inviteData.user) {
    console.error("Invitation error:", inviteError?.message);

    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=auth_creation_failed`
    );
  }

  const volunteerUserId = inviteData.user.id;

  // 11. Create Profile
  const { error: profileInsertError } = await adminSupabase
    .from("profiles")
    .insert({
      id: volunteerUserId,
      full_name: application.full_name,
      email: application.email,
      role: "VOLUNTEER",
    });

  if (profileInsertError) {
    console.error("Profile creation error:", profileInsertError.message);

    // Cleanup Auth user
    const { error: cleanupAuthError } =
      await adminSupabase.auth.admin.deleteUser(volunteerUserId);

    if (cleanupAuthError) {
      console.error("Auth cleanup error:", cleanupAuthError.message);
    }

    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=profile_creation_failed`
    );
  }

  // 12. Create Volunteer record
  const { error: volunteerInsertError } = await adminSupabase
    .from("volunteers")
    .insert({
      profile_id: volunteerUserId,
      application_id: applicationId,
      volunteer_code: volunteerCode,
      joining_date: joiningDate,
      status: "ACTIVE",
    });

  if (volunteerInsertError) {
    console.error(
      "Volunteer registration error:",
      volunteerInsertError.message
    );

    // Cleanup profile
    const { error: cleanupProfileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", volunteerUserId);

    if (cleanupProfileError) {
      console.error(
        "Profile cleanup error:",
        cleanupProfileError.message
      );
    }

    // Cleanup Auth user
    const { error: cleanupAuthError } =
      await adminSupabase.auth.admin.deleteUser(volunteerUserId);

    if (cleanupAuthError) {
      console.error("Auth cleanup error:", cleanupAuthError.message);
    }

    redirect(
      `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&error=volunteer_creation_failed`
    );
  }

  // 13. Notify newly registered volunteer
  try {
    await createInAppNotification({
      profileId: volunteerUserId,
      title: "Welcome to Tori School!",
      message:
        "Your volunteer registration is complete. Welcome to the Tori School volunteer team!",
      notificationType: "VOLUNTEER_REGISTERED",
      dedupeKey: `VOLUNTEER_REGISTERED_${applicationId}`,
    });
  } catch (notificationError) {
    console.error(
      "Volunteer registration notification error:",
      notificationError
    );
  }

  // 14. Refresh relevant pages
  revalidatePath("/admin/volunteers/selected-applicants");
  revalidatePath("/admin/volunteers/applications");
  revalidatePath("/admin/volunteers");

  // 15. Redirect after success
  redirect(
    `/admin/volunteers/selected-applicants/register?applicationId=${applicationId}&registered=1`
  );
}