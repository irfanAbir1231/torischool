import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitJustification } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
  }>;
};

export default async function VolunteerJustificationsPage({
  searchParams,
}: PageProps) {
  const { error, submitted } = await searchParams;

  // 1. Verify logged-in user
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Verify volunteer role
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // 3. Find volunteer record
  const adminSupabase = createAdminClient();

  const { data: volunteer } = await adminSupabase
    .from("volunteers")
    .select("id, status")
    .eq("profile_id", user.id)
    .single();

  if (!volunteer) {
    return <main className="p-8">Volunteer record not found.</main>;
  }

  // 4. Fetch completed sessions
  const { data: sessions, error: sessionsError } =
    await adminSupabase
      .from("sessions")
      .select("id, session_date, session_type")
      .eq("status", "COMPLETED")
      .order("session_date", { ascending: false });

  // 5. Fetch volunteer absences
  const sessionIds = (sessions || []).map((session) => session.id);

  const { data: absences, error: absencesError } =
    sessionIds.length > 0
      ? await adminSupabase
          .from("attendance")
          .select("id, session_id")
          .eq("volunteer_id", volunteer.id)
          .eq("status", "ABSENT")
          .in("session_id", sessionIds)
      : { data: [], error: null };

  // 6. Fetch previous justifications
  const { data: justifications, error: justificationsError } =
    await adminSupabase
      .from("weekly_justifications")
      .select(`
        id,
        week_start_date,
        week_end_date,
        due_date,
        status,
        submitted_at,
        justification_items (
          id,
          attendance_id,
          reason_category,
          explanation,
          status,
          volunteer_response,
          response_at
        )
      `)
      .eq("volunteer_id", volunteer.id)
      .order("week_start_date", { ascending: false });

  const errorMessages: Record<string, string> = {
    invalid_week: "Invalid week selected.",
    volunteer_not_found: "Volunteer record not found or inactive.",
    fetch_failed: "Failed to load attendance information.",
    no_absences: "No completed absence records found for this week.",
    not_enough_absences:
      "At least two absences in the same week are required.",
    already_submitted:
      "You have already submitted justification for this week.",
    missing_fields: "Please provide a reason and explanation for every absence.",
    creation_failed: "Failed to create justification.",
    items_failed: "Failed to save justification details.",
    submission_failed: "Failed to submit justification.",
  };

  const reasonLabels: Record<string, string> = {
    ILLNESS: "Illness",
    ACADEMIC_EXAMINATION: "Academic Examination",
    FAMILY_EMERGENCY: "Family Emergency",
    PERSONAL_ISSUES: "Personal Issues",
    TRANSPORTATION_PROBLEMS: "Transportation Problems",
    OTHER: "Other",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    NEEDS_INFORMATION: "bg-blue-100 text-blue-800",
  };

  // 7. Group absences by Friday-Saturday week
  const sessionMap = new Map(
    (sessions || []).map((session) => [
      session.id,
      session,
    ])
  );

  const weeklyGroups = new Map<
    string,
    {
      weekStart: string;
      weekEnd: string;
      dueDate: string;
      absences: {
        id: string;
        session_date: string;
        session_type: string;
      }[];
    }
  >();

  for (const absence of absences || []) {
    const session = sessionMap.get(absence.session_id);

    if (!session) continue;

    const date = new Date(`${session.session_date}T00:00:00.000Z`);
    const day = date.getUTCDay();

    const friday = new Date(date);

    if (day === 6) {
      friday.setUTCDate(friday.getUTCDate() - 1);
    }

    const weekStart = friday.toISOString().slice(0, 10);

    const saturday = new Date(friday);
    saturday.setUTCDate(saturday.getUTCDate() + 1);

    const weekEnd = saturday.toISOString().slice(0, 10);

    const due = new Date(friday);
    due.setUTCDate(due.getUTCDate() + 7);

    const dueDate = due.toISOString().slice(0, 10);

    if (!weeklyGroups.has(weekStart)) {
      weeklyGroups.set(weekStart, {
        weekStart,
        weekEnd,
        dueDate,
        absences: [],
      });
    }

    weeklyGroups.get(weekStart)!.absences.push({
      id: absence.id,
      session_date: session.session_date,
      session_type: session.session_type,
    });
  }

  const submittedWeeks = new Set(
    (justifications || []).map((item) => item.week_start_date)
  );

  const eligibleWeeks = Array.from(weeklyGroups.values())
    .filter(
      (week) =>
        week.absences.length >= 2 &&
        !submittedWeeks.has(week.weekStart)
    )
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  return (
    <main id="main-content" className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <Link
          href="/volunteer/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold">
          My Justifications
        </h1>

        <p className="mt-1 text-gray-600">
          Welcome, {profile.full_name}
        </p>
      </div>

      {submitted === "1" && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800">
          Your weekly justification was submitted successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          {errorMessages[error] || "Something went wrong."}
        </div>
      )}

      {(sessionsError || absencesError || justificationsError) && (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          Failed to load justification information. Please refresh the page.
        </div>
      )}

      {/* Submission Forms */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">
          Submit Weekly Justification
        </h2>

        {volunteer.status !== "ACTIVE" ? (
          <p className="rounded-lg border p-5 text-gray-600">
            Only active volunteers can submit justifications.
          </p>
        ) : eligibleWeeks.length === 0 ? (
          <p className="rounded-lg border p-5 text-gray-500">
            No eligible weeks available. At least two absences in
            completed sessions during the same Friday-Saturday week
            are required.
          </p>
        ) : (
          eligibleWeeks.map((week) => (
            <form
              key={week.weekStart}
              action={submitJustification}
              className="space-y-5 rounded-xl border p-6"
            >
              <input
                type="hidden"
                name="week_start_date"
                value={week.weekStart}
              />

              <div>
                <h3 className="text-lg font-semibold">
                  Week: {week.weekStart} – {week.weekEnd}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Deadline: {week.dueDate}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Total absences: {week.absences.length}
                </p>
              </div>

              {week.absences.map((absence, index) => (
                <div
                  key={absence.id}
                  className="space-y-3 rounded-lg bg-gray-50 p-4"
                >
                  <h4 className="font-semibold">
                    Absence {index + 1}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Date: {absence.session_date}
                  </p>

                  <p className="text-sm text-gray-600">
                    Session: {absence.session_type.replace("_", " ")}
                  </p>

                  <div>
                    <label className="mb-1 block font-medium">
                      Reason
                    </label>

                    <select
                      name={`reason_${absence.id}`}
                      required
                      className="w-full rounded-lg border p-3"
                    >
                      <option value="">Select a reason</option>
                      <option value="ILLNESS">Illness</option>
                      <option value="ACADEMIC_EXAMINATION">
                        Academic Examination
                      </option>
                      <option value="FAMILY_EMERGENCY">
                        Family Emergency
                      </option>
                      <option value="PERSONAL_ISSUES">
                        Personal Issues
                      </option>
                      <option value="TRANSPORTATION_PROBLEMS">
                        Transportation Problems
                      </option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium">
                      Explanation
                    </label>

                    <textarea
                      name={`explanation_${absence.id}`}
                      required
                      maxLength={1000}
                      rows={3}
                      placeholder="Explain the reason for your absence..."
                      className="w-full rounded-lg border p-3"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Submit Justification
              </button>
            </form>
          ))
        )}
      </section>

      {/* Previous Submissions */}
      <section className="rounded-xl border p-6">
        <h2 className="mb-5 text-xl font-semibold">
          Justification History
        </h2>

        {!justifications || justifications.length === 0 ? (
          <p className="text-gray-500">
            You have not submitted any justifications yet.
          </p>
        ) : (
          <div className="space-y-5">
            {justifications.map((justification) => (
              <div
                key={justification.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">
                      {justification.week_start_date} –{" "}
                      {justification.week_end_date}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Deadline: {justification.due_date}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {justification.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {justification.justification_items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">
                          {reasonLabels[item.reason_category] ||
                            item.reason_category}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[item.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="mt-2 text-gray-600">
                        {item.explanation}
                      </p>

                      {item.volunteer_response && (
                        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                          <strong>Admin feedback:</strong>{" "}
                          {item.volunteer_response}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}