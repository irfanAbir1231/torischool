import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markAttendance } from "./actions";
import { completeSession } from "../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    completed?: string;
    saved?: string;
    unchanged?: string;
  }>;
};

export default async function SessionDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { error, saved, completed, unchanged } = await searchParams;

  const supabase = await createClient();

  // 1. Verify authenticated user
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

  // 3. Fetch session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return (
      <main id="main-content" className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/attendance"
            className="text-blue-600 hover:underline"
          >
            &#8592; Back to Attendance
          </Link>

          <p className="mt-6 text-red-600">Session not found.</p>
        </div>
      </main>
    );
  }

  // 4. Fetch eligible volunteers
  const { data: volunteers, error: volunteersError } = await supabase
    .from("volunteers")
    .select(`
      id,
      volunteer_code,
      joining_date,
      inactive_date,
      status,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq("status", "ACTIVE")
    .lte("joining_date", session.session_date)
    .order("volunteer_code");

  // 5. Fetch approved leaves
  const { data: leaves, error: leavesError } = await supabase
    .from("volunteer_leaves")
    .select("volunteer_id")
    .eq("status", "APPROVED")
    .lte("start_date", session.session_date)
    .gte("end_date", session.session_date);

  // 6. Fetch attendance records
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select("*")
    .eq("session_id", id);

  const dataError =
    volunteersError || leavesError || attendanceError;

  // 7. Filter eligible volunteers
  const leaveIds = new Set(
    (leaves || []).map((leave) => leave.volunteer_id)
  );

  const eligibleVolunteers = (volunteers || []).filter(
    (volunteer) =>
      !leaveIds.has(volunteer.id) &&
      (
        volunteer.inactive_date === null ||
        volunteer.inactive_date >= session.session_date
      )
  );

  // 8. Attendance lookup
  const attendanceMap = new Map(
    (attendance || []).map((record) => [
      record.volunteer_id,
      record,
    ])
  );

  // 9. Attendance statistics
  const presentCount = (attendance || []).filter(
    (record) => record.status === "PRESENT"
  ).length;

  const absentCount = (attendance || []).filter(
    (record) => record.status === "ABSENT"
  ).length;

  // 10. Fetch audit history
  const attendanceIds = (attendance || []).map(
    (record) => record.id
  );

  let auditLogs: any[] = [];
  let auditError = false;

  if (attendanceIds.length > 0) {
    const { data, error: historyError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", "attendance")
      .in("entity_id", attendanceIds)
      .order("created_at", { ascending: false });

    auditLogs = data || [];
    auditError = Boolean(historyError);
  }

  // 11. Error messages
  const errorMessages: Record<string, string> = {
    missing_fields: "Required information is missing.",
    invalid_status: "Invalid attendance status.",
    invalid_reason: "Please provide a valid reason (1-1000 characters).",
    session_not_scheduled:
      "New attendance cannot be added to this session.",
    session_not_available:
      "This session is not available for attendance marking.",
    attendance_check_failed:
      "Failed to check existing attendance.",
    attendance_save_failed:
      "Failed to save attendance.",
    session_not_found: "Session not found.",
    invalid_session: "Invalid session information.",
    future_session: "A future session cannot be completed.",
    session_not_finished:
      "You cannot complete this session before its scheduled end time.",
    session_completion_failed:
      "Failed to complete the session. Please try again.",
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-6xl">

        {/* Back Link */}
        <Link
          href="/admin/attendance"
          className="text-sm text-blue-600 hover:underline"
        >
          &#8592; Back to Attendance
        </Link>

        {/* Page Heading */}
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Session Details
        </h1>

        {/* Success Messages */}
        {saved === "true" && (
          <p className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
            Attendance saved successfully!
          </p>
        )}

        {completed === "true" && (
          <p className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
            Session completed successfully. Missing attendance records
            have been marked as ABSENT.
          </p>
        )}

        {unchanged === "true" && (
          <p className="mt-6 rounded-lg bg-yellow-100 p-4 text-yellow-800">
            Attendance status is already the same. No changes were made.
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
            {errorMessages[error] || "Something went wrong."}
          </p>
        )}

        {/* Session Information */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            {session.session_type.replace("_", " ")}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <p>
              <strong>Date:</strong> {session.session_date}
            </p>

            <p>
              <strong>Status:</strong> {session.status}
            </p>

            <p>
              <strong>Start Time:</strong> {session.start_time}
            </p>

            <p>
              <strong>End Time:</strong> {session.end_time}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {session.location || "Not specified"}
            </p>
          </div>
        </section>

        {/* Attendance Summary */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Eligible Volunteers
            </p>
            <p className="mt-2 text-2xl font-bold">
              {eligibleVolunteers.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Present
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {presentCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Absent
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {absentCount}
            </p>
          </div>
        </section>

        {/* Complete Session */}
        {session.status === "SCHEDULED" && (
          <section className="mt-6 rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">
              Complete Session
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Completing this session will automatically mark
              eligible volunteers without attendance records as ABSENT.
            </p>

            <form action={completeSession} className="mt-4">
              <input
                type="hidden"
                name="session_id"
                value={session.id}
              />

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
              >
                Complete Session
              </button>
            </form>
          </section>
        )}

        {/* Volunteer Attendance */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Volunteer Attendance
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Provide a reason whenever you mark or correct attendance.
          </p>

          {dataError ? (
            <p className="mt-4 text-red-600">
              Failed to load attendance data.
            </p>
          ) : eligibleVolunteers.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No eligible volunteers found for this session.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-3">Volunteer</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Attendance</th>
                  </tr>
                </thead>

                <tbody>
                  {eligibleVolunteers.map((volunteer) => {
                    const profileData = Array.isArray(
                      volunteer.profiles
                    )
                      ? volunteer.profiles[0]
                      : volunteer.profiles;

                    const record = attendanceMap.get(
                      volunteer.id
                    );

                    const canEdit =
                      session.status === "SCHEDULED" ||
                      Boolean(record);

                    return (
                      <tr
                        key={volunteer.id}
                        className="border-b align-top"
                      >
                        <td className="p-3">
                          <p className="font-medium">
                            {volunteer.volunteer_code}
                          </p>
                          <p className="mt-1 text-gray-600">
                            {profileData?.full_name || "N/A"}
                          </p>
                        </td>

                        <td className="p-3">
                          <p>{profileData?.email || "N/A"}</p>
                          <p className="mt-1 text-gray-500">
                            {profileData?.phone || "N/A"}
                          </p>
                        </td>

                        <td className="min-w-64 p-3">
                          {canEdit ? (
                            <form
                              action={markAttendance}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="session_id"
                                value={id}
                              />

                              <input
                                type="hidden"
                                name="volunteer_id"
                                value={volunteer.id}
                              />

                              <select
                                name="attendance_status"
                                defaultValue={record?.status || ""}
                                required
                                className="w-full rounded-lg border border-gray-300 p-2"
                              >
                                <option value="" disabled>
                                  Select status
                                </option>

                                <option value="PRESENT">
                                  Present
                                </option>

                                <option value="ABSENT">
                                  Absent
                                </option>
                              </select>

                              <textarea
                                name="reason"
                                required
                                minLength={1}
                                maxLength={1000}
                                rows={2}
                                placeholder="Reason for marking or correcting attendance"
                                className="w-full rounded-lg border border-gray-300 p-2"
                              />

                              <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                              >
                                {record ? "Save Correction" : "Save Attendance"}
                              </button>
                            </form>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No attendance record available for correction.
                            </p>
                          )}

                          {record && (
                            <p className="mt-2 text-xs text-gray-500">
                              Current status: {record.status}
                              <br />
                              Source: {record.source}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Attendance Audit History */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            Attendance Change History
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            This section shows recorded attendance changes and their reasons.
          </p>

          {auditError ? (
            <p className="mt-4 text-red-600">
              Failed to load attendance history.
            </p>
          ) : auditLogs.length === 0 ? (
            <p className="mt-4 text-gray-500">
              No attendance changes recorded yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {auditLogs.map((log) => {
                const oldValues = log.old_values || {};
                const newValues = log.new_values || {};

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="font-medium">
                      {log.action === "INSERT"
                        ? "Attendance Created"
                        : log.action === "UPDATE"
                          ? "Attendance Updated"
                          : "Attendance Deleted"}
                    </p>

                    {log.action === "UPDATE" && (
                      <p className="mt-2 text-sm text-gray-600">
                        Previous status: {oldValues.status || "N/A"}
                        {" → "}
                        New status: {newValues.status || "N/A"}
                      </p>
                    )}

                    {log.action === "INSERT" && (
                      <p className="mt-2 text-sm text-gray-600">
                        Status: {newValues.status || "N/A"}
                      </p>
                    )}

                    <p className="mt-2 text-sm">
                      <strong>Reason:</strong>{" "}
                      {newValues.correction_reason || "Not provided"}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("en-GB", {
                            timeZone: "Asia/Dhaka",
                          })
                        : "Time unavailable"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}