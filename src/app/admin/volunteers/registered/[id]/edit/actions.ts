"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateVolunteerProfile(formData: FormData) {
  // 1. Get form data
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  // 2. Validate input
  if (!volunteerId || !fullName || fullName.length > 255) {
    redirect(
      `/admin/volunteers/registered/${volunteerId}/edit?error=invalid_fields`
    );
  }

  if (phone.length > 30) {
    redirect(
      `/admin/volunteers/registered/${volunteerId}/edit?error=invalid_phone`
    );
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

  // 5. Get volunteer's profile ID
  const adminSupabase = createAdminClient();

  const { data: volunteer, error: volunteerError } = await adminSupabase
    .from("volunteers")
    .select("profile_id")
    .eq("id", volunteerId)
    .single();

  if (volunteerError || !volunteer) {
    redirect("/admin/volunteers/registered");
  }

  // 6. Update profile
  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", volunteer.profile_id);

  if (updateError) {
    redirect(
      `/admin/volunteers/registered/${volunteerId}/edit?error=update_failed`
    );
  }

  // 7. Refresh pages
  revalidatePath("/admin/volunteers/registered");
  revalidatePath(`/admin/volunteers/registered/${volunteerId}`);
  revalidatePath(`/admin/volunteers/registered/${volunteerId}/edit`);

  redirect(`/admin/volunteers/registered/${volunteerId}?updated=true`);
}