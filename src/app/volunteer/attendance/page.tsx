import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VolunteerAttendancePage() {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify Volunteer role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // 3. Find logged-in volunteer
  const { data: volunteer, error: volunteerError } = await supabase
    .from("volunteers")
    .select("id, volunteer_code")
    .eq("profile_id", user.id)
    .single();

  if (volunteerError || !volunteer) {
    return (
      <main id="main-content" className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/volunteer/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Attendance
          </h1>

          <p className="mt-6 rounded-lg bg-yellow-100 p-4 text-yellow-800">
            Your volunteer profile was not found. Please contact the
            administrator.
          </p>
        </div>
      </main>
    );
  }

  // 4. Fetch attendance records
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance")
    .select(`
      id,
      status,
      source,
      marked_at,
      sessions (
        session_type,
        session_date,
        start_time,
        end_time,
        location,
        status
      )
    `)
    .eq("volunteer_id", volunteer.id)
    .order("marked_at", { ascending: false });

  // 5. Include only completed sessions
  const completedAttendance = (attendance ?? []).filter((record) => {
    const session = Array.isArray(record.sessions)
      ? record.sessions[0]
      : record.sessions;

    return session?.status === "COMPLETED";
  });

  const presentCount = completedAttendance.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const absentCount = completedAttendance.filter(
    (record) => record.status === "ABSENT"
  ).length;

  const totalSessions = completedAttendance.length;

  const attendancePercentage =
    totalSessions > 0
      ? Math.round((presentCount / totalSessions) * 100)
      : 0;

  return (
    <main id="main-content" className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/volunteer/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          My Attendance
        </h1>

        <p className="mt-2 text-gray-600">
          View your attendance records and completed session history.
        </p>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Volunteer Name</p>
          <p className="font-semibold text-gray-900">
            {profile.full_name}
          </p>

          <p className="mt-3 text-sm text-gray-500">Volunteer Code</p>
          <p className="font-semibold text-gray-900">
            {volunteer.volunteer_code}
          </p>
        </div>

        {attendanceError ? (
          <p className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
            Failed to load attendance: {attendanceError.message}
          </p>
        ) : (
          <>
            {/* Attendance Statistics */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalSessions}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Present</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {absentCount}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">
                  Attendance Percentage
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {attendancePercentage}%
                </p>
              </div>
            </div>

            {/* Attendance History */}
            <section className="mt-8 rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance History
              </h2>

              {completedAttendance.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-gray-600">
                        <th className="p-3">Session Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Attendance</th>
                        <th className="p-3">Source</th>
                      </tr>
                    </thead>

                    <tbody>
                      {completedAttendance.map((record) => {
                        const session = Array.isArray(record.sessions)
                          ? record.sessions[0]
                          : record.sessions;

                        return (
                          <tr key={record.id} className="border-b">
                            <td className="p-3">
                              {session?.session_date ?? "N/A"}
                            </td>

                            <td className="p-3">
                              {session?.session_type ?? "N/A"}
                            </td>

                            <td className="p-3">
                              {session
                                ? `${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}`
                                : "N/A"}
                            </td>

                            <td className="p-3">
                              {session?.location ?? "N/A"}
                            </td>

                            <td className="p-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  record.status === "PRESENT"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>

                            <td className="p-3">{record.source}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-gray-500">
                  No completed session attendance records available yet.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}