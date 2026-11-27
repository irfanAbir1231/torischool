"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function submitJustification(formData: FormData) {
  // 1. Verify logged-in user
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Verify volunteer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // 3. Get volunteer record
  const adminSupabase = createAdminClient();

  const { data: volunteer } = await adminSupabase
    .from("volunteers")
    .select("id, status")
    .eq("profile_id", user.id)
    .single();

  if (!volunteer || volunteer.status !== "ACTIVE") {
    redirect("/volunteer/justifications?error=volunteer_not_found");
  }

  // 4. Validate week
  const weekStart = formData.get("week_start_date")?.toString() || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    redirect("/volunteer/justifications?error=invalid_week");
  }

  const parsedDate = new Date(`${weekStart}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== weekStart ||
    parsedDate.getUTCDay() !== 5
  ) {
    redirect("/volunteer/justifications?error=invalid_week");
  }

  const weekEnd = addDays(weekStart, 1);
  const dueDate = addDays(weekStart, 7);

  // 5. Find completed sessions in this week
  const { data: sessions, error: sessionsError } =
    await adminSupabase
      .from("sessions")
      .select("id")
      .gte("session_date", weekStart)
      .lte("session_date", weekEnd)
      .eq("status", "COMPLETED");

  if (sessionsError || !sessions) {
    redirect("/volunteer/justifications?error=fetch_failed");
  }

  const sessionIds = sessions.map((session) => session.id);

  if (sessionIds.length === 0) {
    redirect("/volunteer/justifications?error=no_absences");
  }

  // 6. Find volunteer's absences
  const { data: absences, error: absencesError } =
    await adminSupabase
      .from("attendance")
      .select("id")
      .eq("volunteer_id", volunteer.id)
      .eq("status", "ABSENT")
      .in("session_id", sessionIds);

  if (absencesError || !absences) {
    redirect("/volunteer/justifications?error=fetch_failed");
  }

  if (absences.length < 2) {
    redirect("/volunteer/justifications?error=not_enough_absences");
  }

  // 7. Prevent duplicate weekly submission
  const { data: existing } = await adminSupabase
    .from("weekly_justifications")
    .select("id")
    .eq("volunteer_id", volunteer.id)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (existing) {
    redirect("/volunteer/justifications?error=already_submitted");
  }

  // 8. Validate reason and explanation for every absence
  const allowedReasons = [
    "ILLNESS",
    "ACADEMIC_EXAMINATION",
    "FAMILY_EMERGENCY",
    "PERSONAL_ISSUES",
    "TRANSPORTATION_PROBLEMS",
    "OTHER",
  ];

  const items = [];

  for (const absence of absences) {
    const reason = formData
      .get(`reason_${absence.id}`)
      ?.toString();

    const explanation = formData
      .get(`explanation_${absence.id}`)
      ?.toString()
      .trim();

    if (
      !reason ||
      !allowedReasons.includes(reason) ||
      !explanation ||
      explanation.length > 1000
    ) {
      redirect("/volunteer/justifications?error=missing_fields");
    }

    items.push({
      attendance_id: absence.id,
      reason_category: reason,
      explanation,
    });
  }

  // 9. Create weekly justification draft
  const { data: justification, error: createError } =
    await adminSupabase
      .from("weekly_justifications")
      .insert({
        volunteer_id: volunteer.id,
        week_start_date: weekStart,
        week_end_date: weekEnd,
        due_date: dueDate,
      })
      .select("id")
      .single();

  if (createError || !justification) {
    console.error("Justification creation error:", createError);
    redirect("/volunteer/justifications?error=creation_failed");
  }

  // 10. Insert justification items
  const { error: itemsError } = await adminSupabase
    .from("justification_items")
    .insert(
      items.map((item) => ({
        justification_id: justification.id,
        attendance_id: item.attendance_id,
        reason_category: item.reason_category,
        explanation: item.explanation,
      }))
    );

  if (itemsError) {
    console.error("Justification items error:", itemsError);

    await adminSupabase
      .from("weekly_justifications")
      .delete()
      .eq("id", justification.id)
      .eq("status", "DRAFT");

    redirect("/volunteer/justifications?error=items_failed");
  }

  // 11. Submit the form
  const { error: submitError } = await adminSupabase
    .from("weekly_justifications")
    .update({ status: "SUBMITTED" })
    .eq("id", justification.id)
    .eq("status", "DRAFT");

  if (submitError) {
    console.error("Justification submission error:", submitError);

    await adminSupabase
      .from("weekly_justifications")
      .delete()
      .eq("id", justification.id)
      .eq("status", "DRAFT");

    redirect("/volunteer/justifications?error=submission_failed");
  }

  // 12. Refresh pages
  revalidatePath("/volunteer/justifications");
  revalidatePath("/volunteer/dashboard");
  revalidatePath("/admin/justifications");

  redirect("/volunteer/justifications?submitted=1");
}