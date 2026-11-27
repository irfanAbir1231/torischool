"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInAppNotification } from "@/lib/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function getCategory(score: number) {
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "GOOD";
  if (score >= 70) return "AVERAGE";
  if (score >= 50) return "NEEDS_IMPROVEMENT";
  return "CRITICAL";
}

function roundPercentage(value: number) {
  return Math.round(value * 100) / 100;
}

export async function generateEvaluations(formData: FormData) {
  // 1. Verify authenticated user
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify Admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Get form values
  const evaluationType = formData.get("evaluation_type")?.toString();

  let periodStart = "";
  let periodEnd = "";

  if (evaluationType === "WEEKLY") {
    periodStart = formData.get("period_start")?.toString() || "";
    periodEnd = formData.get("period_end")?.toString() || "";
  } else if (evaluationType === "MONTHLY") {
    const month = formData.get("month")?.toString() || "";

    if (!/^\d{4}-\d{2}$/.test(month)) {
      redirect("/admin/evaluations?error=invalid_period");
    }

    const [year, monthNumber] = month.split("-").map(Number);

    if (monthNumber < 1 || monthNumber > 12) {
      redirect("/admin/evaluations?error=invalid_period");
    }

    periodStart = `${month}-01`;

    const lastDay = new Date(year, monthNumber, 0).getDate();

    periodEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
  } else {
    redirect("/admin/evaluations?error=invalid_type");
  }

  // 4. Validate dates
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(periodStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd) ||
    periodStart > periodEnd
  ) {
    redirect("/admin/evaluations?error=invalid_period");
  }

  // 5. Create admin client
  const adminSupabase = createAdminClient();

  // 6. Fetch volunteers
  const { data: volunteers, error: volunteerError } =
    await adminSupabase
      .from("volunteers")
      .select("id, profile_id, joining_date, inactive_date")
      .lte("joining_date", periodEnd)
      .or(`inactive_date.is.null,inactive_date.gte.${periodStart}`);

  if (volunteerError) {
    console.error(volunteerError);
    redirect("/admin/evaluations?error=fetch_failed");
  }

  if (!volunteers || volunteers.length === 0) {
    redirect("/admin/evaluations?error=no_volunteers");
  }

  // 7. Fetch completed sessions within the period
  const { data: sessions, error: sessionError } =
    await adminSupabase
      .from("sessions")
      .select("id, session_type, session_date")
      .eq("status", "COMPLETED")
      .gte("session_date", periodStart)
      .lte("session_date", periodEnd);

  if (sessionError) {
    console.error(sessionError);
    redirect("/admin/evaluations?error=fetch_failed");
  }

  if (!sessions || sessions.length === 0) {
    redirect("/admin/evaluations?error=no_sessions");
  }

  // 8. Fetch attendance records
  const { data: attendance, error: attendanceError } =
    await adminSupabase
      .from("attendance")
      .select("volunteer_id, session_id, status");

  if (attendanceError) {
    console.error(attendanceError);
    redirect("/admin/evaluations?error=fetch_failed");
  }

  // 9. Fetch approved leaves overlapping this period
  const { data: leaves, error: leaveError } =
    await adminSupabase
      .from("volunteer_leaves")
      .select("volunteer_id, start_date, end_date")
      .eq("status", "APPROVED")
      .lte("start_date", periodEnd)
      .gte("end_date", periodStart);

  if (leaveError) {
    console.error(leaveError);
    redirect("/admin/evaluations?error=fetch_failed");
  }

  // 10. Check existing evaluations for this period
  const { data: existingEvaluations, error: existingError } =
    await adminSupabase
      .from("evaluations")
      .select("volunteer_id")
      .eq("evaluation_type", evaluationType)
      .eq("period_start", periodStart)
      .eq("period_end", periodEnd);

  if (existingError) {
    console.error(existingError);
    redirect("/admin/evaluations?error=fetch_failed");
  }

  const existingVolunteerIds = new Set(
    (existingEvaluations || []).map((item) => item.volunteer_id)
  );

  // 11. Generate evaluation records
  const evaluationRecords = [];

  for (const volunteer of volunteers) {
    // Skip volunteers already evaluated for this period
    if (existingVolunteerIds.has(volunteer.id)) {
      continue;
    }

    // Find eligible sessions for this volunteer
    const eligibleSessions = sessions.filter((session) => {
      // Joining date check
      if (session.session_date < volunteer.joining_date) {
        return false;
      }

      // Inactive date check
      if (
        volunteer.inactive_date &&
        session.session_date > volunteer.inactive_date
      ) {
        return false;
      }

      // Approved leave check
      const onApprovedLeave = (leaves || []).some(
        (leave) =>
          leave.volunteer_id === volunteer.id &&
          session.session_date >= leave.start_date &&
          session.session_date <= leave.end_date
      );

      return !onApprovedLeave;
    });

    // No eligible sessions means no evaluation
    if (eligibleSessions.length === 0) {
      continue;
    }

    // Count regular and camp sessions
    const regularSessions = eligibleSessions.filter(
      (session) => session.session_type === "REGULAR"
    );

    const campSessions = eligibleSessions.filter(
      (session) => session.session_type === "EDUCATION_CAMP"
    );

    // Count present attendance
    const presentRecords = attendance || [];

    const isPresent = (sessionId: string) =>
      presentRecords.some(
        (record) =>
          record.volunteer_id === volunteer.id &&
          record.session_id === sessionId &&
          record.status === "PRESENT"
      );

    const regularPresent = regularSessions.filter((session) =>
      isPresent(session.id)
    ).length;

    const campPresent = campSessions.filter((session) =>
      isPresent(session.id)
    ).length;

    const totalPresent = eligibleSessions.filter((session) =>
      isPresent(session.id)
    ).length;

    // Calculate percentages
    const regularPercentage =
      regularSessions.length > 0
        ? roundPercentage(
            (regularPresent / regularSessions.length) * 100
          )
        : null;

    const campPercentage =
      campSessions.length > 0
        ? roundPercentage(
            (campPresent / campSessions.length) * 100
          )
        : null;

    const overallPercentage = roundPercentage(
      (totalPresent / eligibleSessions.length) * 100
    );

    // Score and category
    const score = overallPercentage;
    const category = getCategory(score);

    evaluationRecords.push({
      volunteer_id: volunteer.id,
      evaluation_type: evaluationType,
      period_start: periodStart,
      period_end: periodEnd,
      attendance_percentage: overallPercentage,
      regular_attendance_percentage: regularPercentage,
      camp_attendance_percentage: campPercentage,
      score,
      category,
      evaluated_by: user.id,
    });
  }

  // 12. Insert evaluations
  if (evaluationRecords.length === 0) {
    redirect("/admin/evaluations?error=no_eligible_volunteers");
  }

  const { data: insertedEvaluations, error: insertError } =
    await adminSupabase
      .from("evaluations")
      .upsert(evaluationRecords, {
        onConflict:
          "volunteer_id,evaluation_type,period_start,period_end",
        ignoreDuplicates: true,
      })
      .select("id, volunteer_id");

  if (insertError) {
    console.error("Evaluation generation error:", insertError);
    redirect("/admin/evaluations?error=generation_failed");
  }

  const generatedCount = insertedEvaluations?.length || 0;

  if (generatedCount === 0) {
    redirect("/admin/evaluations?error=duplicate");
  }

  // 13. Notify volunteers about their new evaluations
  try {
    const notificationTasks = (insertedEvaluations || []).flatMap(
      (evaluation) => {
        const volunteer = volunteers.find(
          (item) => item.id === evaluation.volunteer_id
        );

        if (!volunteer?.profile_id) {
          return [];
        }

        return [
          createInAppNotification({
            profileId: volunteer.profile_id,
            title: "New Evaluation Available",
            message: `Your ${evaluationType.toLowerCase()} evaluation for ${periodStart} to ${periodEnd} is now available.`,
            notificationType: "NEW_EVALUATION",
            dedupeKey: `NEW_EVALUATION_${evaluation.volunteer_id}_${evaluationType}_${periodStart}_${periodEnd}`,
          }),
        ];
      }
    );

    await Promise.all(notificationTasks);
  } catch (notificationError) {
    console.error(
      "Evaluation notification error:",
      notificationError
    );
  }

  // 14. Refresh pages
  revalidatePath("/admin/evaluations");
  revalidatePath("/volunteer/evaluations");

  redirect(
    `/admin/evaluations?generated=${generatedCount}`
  );
}