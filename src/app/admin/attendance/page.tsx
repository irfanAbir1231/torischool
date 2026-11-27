import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSession } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    created?: string;
  }>;
};

export default async function AttendancePage({
  searchParams,
}: PageProps) {
  const { error, created } = await searchParams;

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

  // 3. Fetch all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .order("session_date", { ascending: false });

  // 4. Error messages
  const errorMessages: Record<string, string> = {
    invalid_session_type: "Invalid session type.",
    missing_fields: "Please fill in all required fields.",
    invalid_date: "Invalid session date.",
    invalid_time: "End time must be later than start time.",
    session_already_exists:
      "A session of this type already exists on this date.",
    session_creation_failed: "Failed to create session.",
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          &#8592; Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Attendance Management
        </h1>

        <p className="mt-2 text-gray-600">
          Create sessions and manage volunteer attendance.
        </p>

        {/* Success Message */}
        {created === "true" && (
          <p className="mt-6 rounded-lg bg-green-100 p-4 text-green-700">
            Session created successfully!
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
            {errorMessages[error] || "Something went wrong."}
          </p>
        )}

        {/* Create Session Form */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Session
          </h2>

          <form action={createSession} className="mt-6 space-y-5">
            {/* Session Type */}
            <div>
              <label
                htmlFor="session_type"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Session Type *
              </label>

              <select
                id="session_type"
                name="session_type"
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="">Select session type</option>
                <option value="REGULAR">Regular</option>
                <option value="EDUCATION_CAMP">Education Camp</option>
              </select>
            </div>

            {/* Session Date */}
            <div>
              <label
                htmlFor="session_date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Session Date *
              </label>

              <input
                id="session_date"
                name="session_date"
                type="date"
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            {/* Start Time */}
            <div>
              <label
                htmlFor="start_time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Time *
              </label>

              <input
                id="start_time"
                name="start_time"
                type="time"
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            {/* End Time */}
            <div>
              <label
                htmlFor="end_time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Time *
              </label>

              <input
                id="end_time"
                name="end_time"
                type="time"
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Location (Optional)
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter session location"
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Create Session
            </button>
          </form>
        </section>

        {/* Sessions List */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            All Sessions
          </h2>

          {sessionsError ? (
            <p className="mt-4 text-red-600">
              Failed to load sessions: {sessionsError.message}
            </p>
          ) : sessions && sessions.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-3">Session Type</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Start Time</th>
                    <th className="p-3">End Time</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b">
                      <td className="p-3">
                        {session.session_type.replace("_", " ")}
                      </td>

                      <td className="p-3">{session.session_date}</td>
                      <td className="p-3">{session.start_time}</td>
                      <td className="p-3">{session.end_time}</td>

                      <td className="p-3">
                        {session.location || "Not specified"}
                      </td>

                      <td className="p-3">{session.status}</td>

                      <td className="p-3">
                        <Link
                          href={`/admin/attendance/${session.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No sessions found. Create your first session to get started.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}