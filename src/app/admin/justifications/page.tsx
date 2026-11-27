import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewJustification } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    reviewed?: string;
  }>;
};

type ItemType = {
  id: string;
  justification_id: string;
  attendance_id: string;
  reason_category: string;
  explanation: string;
  status: string;
  volunteer_response: string | null;
};

type AttendanceType = {
  id: string;
  volunteer_id: string;
  session_id: string;
};

type SessionType = {
  id: string;
  session_date: string;
  session_type: string;
};

type VolunteerType = {
  id: string;
  volunteer_code: string;
  profile_id: string;
};

type VolunteerProfileType = {
  id: string;
  full_name: string;
};

type VolunteerInfo = {
  volunteer_code: string;
  full_name: string;
};

export default async function AdminJustificationsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Fetch submitted justifications
  const adminClient = createAdminClient();

  const {
    data: justifications,
    error: justificationsError,
  } = await adminClient
    .from("weekly_justifications")
    .select("*")
    .eq("status", "SUBMITTED")
    .order("week_start_date", { ascending: false });

  // Log actual database errors for debugging
  if (justificationsError) {
    console.error(
      "Justifications query error:",
      justificationsError
    );
  }

  // 4. Fetch justification items
  const justificationIds = (justifications || []).map(
    (item) => item.id
  );

  const { data: items, error: itemsError } =
    justificationIds.length > 0
      ? await adminClient
          .from("justification_items")
          .select("*")
          .in("justification_id", justificationIds)
      : { data: [], error: null };

  if (itemsError) {
    console.error("Justification items query error:", itemsError);
  }

  const itemList: ItemType[] = (items || []) as ItemType[];

  // 5. Fetch attendance records
  const attendanceIds = itemList.map(
    (item) => item.attendance_id
  );

  const { data: attendanceRecords, error: attendanceError } =
    attendanceIds.length > 0
      ? await adminClient
          .from("attendance")
          .select("id, volunteer_id, session_id")
          .in("id", attendanceIds)
      : { data: [], error: null };

  if (attendanceError) {
    console.error("Attendance query error:", attendanceError);
  }

  const attendanceList: AttendanceType[] =
    (attendanceRecords || []) as AttendanceType[];

  // 6. Fetch sessions
  const sessionIds = attendanceList.map(
    (item) => item.session_id
  );

  const { data: sessions, error: sessionsError } =
    sessionIds.length > 0
      ? await adminClient
          .from("sessions")
          .select("id, session_date, session_type")
          .in("id", sessionIds)
      : { data: [], error: null };

  if (sessionsError) {
    console.error("Sessions query error:", sessionsError);
  }

  const sessionList: SessionType[] =
    (sessions || []) as SessionType[];

  // 7. Fetch volunteer information
  const volunteerIds = [
    ...new Set(
      attendanceList.map((item) => item.volunteer_id)
    ),
  ];

  const { data: volunteers, error: volunteersError } =
    volunteerIds.length > 0
      ? await adminClient
          .from("volunteers")
          .select("id, volunteer_code, profile_id")
          .in("id", volunteerIds)
      : { data: [], error: null };

  if (volunteersError) {
    console.error("Volunteers query error:", volunteersError);
  }

  const volunteerList: VolunteerType[] =
    (volunteers || []) as VolunteerType[];

  // 8. Fetch volunteer names
  const profileIds = [
    ...new Set(
      volunteerList.map((item) => item.profile_id)
    ),
  ];

  const {
    data: volunteerProfiles,
    error: volunteerProfilesError,
  } = profileIds.length > 0
    ? await adminClient
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds)
    : { data: [], error: null };

  if (volunteerProfilesError) {
    console.error(
      "Volunteer profiles query error:",
      volunteerProfilesError
    );
  }

  const volunteerProfileList: VolunteerProfileType[] =
    (volunteerProfiles || []) as VolunteerProfileType[];

  // 9. Prepare lookup maps
  const sessionMap = new Map<string, SessionType>(
    sessionList.map((item) => [item.id, item])
  );

  const attendanceMap = new Map<string, AttendanceType>(
    attendanceList.map((item) => [item.id, item])
  );

  const volunteerMap = new Map<string, VolunteerInfo>(
    volunteerList.map((item) => {
      const volunteerProfile = volunteerProfileList.find(
        (profile) => profile.id === item.profile_id
      );

      return [
        item.id,
        {
          volunteer_code: item.volunteer_code,
          full_name: volunteerProfile?.full_name || "Unknown",
        },
      ];
    })
  );

  // 10. Labels and messages
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

  const errorMessages: Record<string, string> = {
    invalid_item: "Invalid justification item.",
    invalid_decision: "Invalid review decision.",
    comment_too_long: "Admin comment cannot exceed 1000 characters.",
    comment_required:
      "A comment is required when requesting more information.",
    item_not_found: "Justification item not found.",
    not_submitted: "This justification has not been submitted.",
    already_reviewed: "This item has already been reviewed.",
    review_failed: "Failed to save the review.",
    response_failed:
      "Review saved, but volunteer feedback could not be saved.",
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-6 sm:p-8"
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          &#8592; Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Volunteer Justifications
        </h1>

        <p className="mt-2 text-gray-600">
          Review submitted weekly absence justifications.
        </p>

        {params.reviewed && (
          <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-800">
            Justification reviewed successfully.
          </div>
        )}

        {params.error && (
          <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-800">
            {errorMessages[params.error] || "Something went wrong."}
          </div>
        )}

        {(justificationsError || itemsError) && (
          <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-800">
            Failed to load justification records. Please refresh the page.
          </div>
        )}

        <section className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Submitted Justifications ({justifications?.length || 0})
          </h2>

          {!justifications || justifications.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="text-gray-500">
                No submitted justifications found.
              </p>
            </div>
          ) : (
            justifications.map((justification) => {
              const formItems = itemList.filter(
                (item) =>
                  item.justification_id === justification.id
              );

              const firstAttendance = formItems.length
                ? attendanceMap.get(formItems[0].attendance_id)
                : undefined;

              const volunteer = firstAttendance
                ? volunteerMap.get(firstAttendance.volunteer_id)
                : undefined;

              return (
                <article
                  key={justification.id}
                  className="space-y-5 rounded-xl bg-white p-5 shadow sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {volunteer?.full_name || "Unknown Volunteer"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {volunteer?.volunteer_code || "N/A"}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Week: {justification.week_start_date} –{" "}
                        {justification.week_end_date}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Deadline: {justification.due_date}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Submitted:{" "}
                        {justification.submitted_at
                          ? new Date(
                              justification.submitted_at
                            ).toLocaleString("en-GB", {
                              timeZone: "Asia/Dhaka",
                            })
                          : "N/A"}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      SUBMITTED
                    </span>
                  </div>

                  <div className="space-y-5">
                    {formItems.map((item) => {
                      const attendance = attendanceMap.get(
                        item.attendance_id
                      );

                      const session = attendance
                        ? sessionMap.get(attendance.session_id)
                        : undefined;

                      const itemVolunteer = attendance
                        ? volunteerMap.get(attendance.volunteer_id)
                        : undefined;

                      const canReview = [
                        "PENDING",
                        "NEEDS_INFORMATION",
                      ].includes(item.status);

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="font-semibold text-gray-900">
                              Absence Details
                            </h4>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                statusColors[item.status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                            <p>
                              Volunteer:{" "}
                              {itemVolunteer?.full_name || "Unknown"}
                            </p>

                            <p>
                              Date: {session?.session_date || "N/A"}
                            </p>

                            <p>
                              Session:{" "}
                              {session?.session_type?.replace("_", " ") ||
                                "N/A"}
                            </p>

                            <p>
                              Reason:{" "}
                              {reasonLabels[item.reason_category] ||
                                item.reason_category}
                            </p>
                          </div>

                          <div className="mt-4 rounded-lg bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-700">
                              Volunteer Explanation
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                              {item.explanation}
                            </p>
                          </div>

                          {item.volunteer_response && (
                            <div className="mt-3 rounded-lg bg-blue-50 p-4">
                              <p className="text-sm font-medium text-blue-800">
                                Previous Admin Feedback
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-sm text-blue-700">
                                {item.volunteer_response}
                              </p>
                            </div>
                          )}

                          {canReview ? (
                            <form
                              action={reviewJustification}
                              className="mt-5 space-y-4 border-t pt-4"
                            >
                              <input
                                type="hidden"
                                name="item_id"
                                value={item.id}
                              />

                              <div>
                                <label
                                  htmlFor={`comment-${item.id}`}
                                  className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                  Admin Comment
                                </label>

                                <textarea
                                  id={`comment-${item.id}`}
                                  name="admin_comment"
                                  maxLength={1000}
                                  rows={3}
                                  placeholder="Write feedback for the volunteer..."
                                  className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                                  required
                                />
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="submit"
                                  name="decision"
                                  value="APPROVED"
                                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                  Approve
                                </button>

                                <button
                                  type="submit"
                                  name="decision"
                                  value="REJECTED"
                                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                  Reject
                                </button>

                                <button
                                  type="submit"
                                  name="decision"
                                  value="NEEDS_INFORMATION"
                                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                  Request More Information
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="mt-4 text-sm text-gray-500">
                              This item has already been reviewed.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
