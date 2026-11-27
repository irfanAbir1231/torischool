import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VolunteerEvaluationsPage() {
  // 1. Verify authenticated user
  const supabase = await createClient();

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
      <main

      id="main-content"
      className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/volunteer/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Evaluations
          </h1>

          <p className="mt-6 rounded-lg bg-yellow-100 p-4 text-yellow-800">
            Your volunteer profile was not found. Please contact the
            administrator.
          </p>
        </div>
      </main>
    );
  }

  // 4. Fetch this volunteer's evaluations
  const { data: evaluations, error: evaluationError } = await supabase
    .from("evaluations")
    .select("*")
    .eq("volunteer_id", volunteer.id)
    .order("period_start", { ascending: false });

  return (
    <main
    id="main-content"
    className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/volunteer/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          My Evaluations
        </h1>

        <p className="mt-2 text-gray-600">
          View your weekly and monthly performance evaluations.
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

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Evaluation History
          </h2>

          {evaluationError ? (
            <p className="mt-4 text-red-600">
              Failed to load evaluations: {evaluationError.message}
            </p>
          ) : evaluations && evaluations.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-3">Type</th>
                    <th className="p-3">Period</th>
                    <th className="p-3">Overall Attendance</th>
                    <th className="p-3">Regular Attendance</th>
                    <th className="p-3">Camp Attendance</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Category</th>
                  </tr>
                </thead>

                <tbody>
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="border-b">
                      <td className="p-3">
                        {evaluation.evaluation_type}
                      </td>

                      <td className="p-3">
                        {evaluation.period_start} to{" "}
                        {evaluation.period_end}
                      </td>

                      <td className="p-3">
                        {evaluation.attendance_percentage !== null
                          ? `${evaluation.attendance_percentage}%`
                          : "N/A"}
                      </td>

                      <td className="p-3">
                        {evaluation.regular_attendance_percentage !== null
                          ? `${evaluation.regular_attendance_percentage}%`
                          : "N/A"}
                      </td>

                      <td className="p-3">
                        {evaluation.camp_attendance_percentage !== null
                          ? `${evaluation.camp_attendance_percentage}%`
                          : "N/A"}
                      </td>

                      <td className="p-3">
                        {evaluation.score ?? "N/A"}
                      </td>

                      <td className="p-3">
                        {evaluation.category || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No evaluations available yet.
            </p>
          )}
        </section>

      </div>
    </main>
  );
}