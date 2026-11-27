"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await createClient();

  // 1. Verify logged-in user
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

  if (profileError || profile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Read form data
  const applicationId = String(
    formData.get("application_id") ?? ""
  );

  const newStatus = String(formData.get("status") ?? "");

  // 4. Validate status
  const allowedStatuses = [
    "PENDING",
    "UNDER_REVIEW",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
  ];

  if (!applicationId || !allowedStatuses.includes(newStatus)) {
    redirect("/admin/volunteers/applications?error=invalid_data");
  }

  // 5. Update application
  const { error: updateError } = await supabase
    .from("volunteer_applications")
    .update({
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Application status update error:", updateError.message);

    redirect("/admin/volunteers/applications?error=update_failed");
  }

  // 6. Refresh relevant pages
  revalidatePath("/admin/volunteers/applications");
  revalidatePath("/admin/volunteers/selected-applicants");

  redirect("/admin/volunteers/applications?updated=1");
}