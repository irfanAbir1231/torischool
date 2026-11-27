import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitLeaveApplication } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
  }>;
};

export default async function VolunteerLeavesPage({
  searchParams,
}: PageProps) {
  const { error, submitted } = await searchParams;

  // 1. Verify user
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2. Verify Volunteer role
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
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!volunteer) {
    return <div className="p-8">Volunteer record not found.</div>;
  }

  // 4. Fetch leave history
  const { data: leaves, error: leavesError } = await adminSupabase
    .from("volunteer_leaves")
    .select("*")
    .eq("volunteer_id", volunteer.id)
    .order("created_at", { ascending: false });

  const errorMessages: Record<string, string> = {
    missing_fields: "Please fill in all fields.",
    invalid_date: "Please enter valid dates.",
    invalid_date_range: "End date cannot be before start date.",
    reason_too_long: "Reason must not exceed 1000 characters.",
    volunteer_not_found: "Volunteer record not found or inactive.",
    application_failed: "Failed to submit leave application.",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <main
    id="main-content"
    className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <Link
          href="/volunteer/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-bold">
          My Leave Applications
        </h1>

        <p className="mt-1 text-gray-600">
          Welcome, {profile.full_name}
        </p>
      </div>

      {/* Success message */}
      {submitted === "1" && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800">
          Leave application submitted successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-800">
          {errorMessages[error] || "Something went wrong."}
        </div>
      )}

      {/* Leave Application Form */}
      <section className="rounded-xl border p-6">
        <h2 className="mb-5 text-xl font-semibold">
          Apply for Leave
        </h2>

        <form action={submitLeaveApplication} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              required
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Reason
            </label>
            <textarea
              name="reason"
              required
              maxLength={1000}
              rows={4}
              placeholder="Explain why you need leave..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Submit Application
          </button>
        </form>
      </section>

      {/* Leave History */}
      <section className="rounded-xl border p-6">
        <h2 className="mb-5 text-xl font-semibold">
          Leave History
        </h2>

        {leavesError ? (
          <p className="text-red-600">
            Failed to load leave history.
          </p>
        ) : !leaves || leaves.length === 0 ? (
          <p className="text-gray-500">
            You have not submitted any leave applications yet.
          </p>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium">
                    {leave.start_date} → {leave.end_date}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      statusColors[leave.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>

                <p className="mt-3 text-gray-600">
                  {leave.reason}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Applied:{" "}
                  {new Date(leave.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}