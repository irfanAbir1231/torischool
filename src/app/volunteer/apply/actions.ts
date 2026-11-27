"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createInAppNotification } from "@/lib/notifications";

export async function submitApplication(formData: FormData) {
  // 1. Read form data
  const recruitmentId = String(
    formData.get("recruitment_period_id") ?? ""
  );

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const hallName = String(formData.get("hall_name") ?? "").trim();
  const academicSession = String(
    formData.get("academic_session") ?? ""
  ).trim();
  const motivation = String(formData.get("motivation") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();

  // 2. Validate required fields
  if (
    !recruitmentId ||
    !fullName ||
    !email ||
    !phone ||
    !department ||
    !hallName ||
    !academicSession ||
    !motivation
  ) {
    redirect("/volunteer/apply?error=missing_fields");
  }

  // 3. Validate field lengths
  if (
    fullName.length > 150 ||
    email.length > 255 ||
    phone.length > 30 ||
    department.length > 255 ||
    hallName.length > 255 ||
    academicSession.length > 50 ||
    motivation.length > 5000 ||
    experience.length > 5000
  ) {
    redirect("/volunteer/apply?error=invalid_length");
  }

  // 4. Validate email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    redirect("/volunteer/apply?error=invalid_email");
  }

  // 5. Create admin client
  const supabase = createAdminClient();

  // 6. Verify recruitment period
  const { data: recruitment, error: recruitmentError } =
    await supabase
      .from("recruitment_periods")
      .select("id, status, opens_at, closes_at")
      .eq("id", recruitmentId)
      .single();

  if (recruitmentError || !recruitment) {
    redirect("/volunteer/apply?error=invalid_recruitment");
  }

  // 7. Check recruitment availability
  const now = new Date();
  const opensAt = new Date(recruitment.opens_at);
  const closesAt = new Date(recruitment.closes_at);

  if (
    recruitment.status !== "OPEN" ||
    now < opensAt ||
    now >= closesAt
  ) {
    redirect("/volunteer/apply?error=recruitment_closed");
  }

  // 8. Insert application
     const { data: application, error: insertError } = await supabase
  .from("volunteer_applications")
  .insert({
    recruitment_period_id: recruitmentId,
    full_name: fullName,
    email,
    phone,
    department,
    hall_name: hallName,
    academic_session: academicSession,
    motivation,
    experience: experience || null,
    status: "PENDING",
  })
  .select("id")
  .single();

  if (insertError) {
    console.error("Application submission error:", insertError.message);

    redirect("/volunteer/apply?error=submission_failed");
  }

  // 9. Notify all admins about the new application
try {
  const { data: admins, error: adminError } = await supabase
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
  title: "New Volunteer Application",
  message: `${fullName} has submitted a new volunteer application.`,
  notificationType: "NEW_APPLICATION",
  dedupeKey: `NEW_APPLICATION_${application.id}_${admin.id}`,
})
      )
    );
  }
} catch (notificationError) {
  console.error(
    "Application notification error:",
    notificationError
  );
}
  // 9. Refresh relevant pages
  revalidatePath("/volunteer/apply");
  revalidatePath("/admin/volunteers/selected-applicants");

  redirect("/volunteer/apply?submitted=1");
}