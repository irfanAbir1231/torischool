import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationStatus } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

export default async function ApplicationManagementPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Verify logged-in user
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

  if (profileError || profile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Fetch all applications
  const { data: applications, error } = await supabase
    .from("volunteer_applications")
    .select(`
      id,
      full_name,
      email,
      phone,
      department,
      hall_name,
      academic_session,
      motivation,
      experience,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  const statuses = [
    "PENDING",
    "UNDER_REVIEW",
    "INTERVIEW",
    "SELECTED",
    "REJECTED",
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/volunteers"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Volunteer Management
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Application Management
        </h1>

        <p className="mt-2 text-gray-600">
          Review submitted volunteer applications and manage their status.
        </p>

        {/* Success and Error Messages */}
        <div className="mt-6 space-y-3">
          {params.updated === "1" && (
            <div
              role="status"
              className="rounded-lg bg-green-100 p-4 text-green-700"
            >
              Application status updated successfully!
            </div>
          )}

          {params.error === "invalid_data" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Invalid application data or status.
            </div>
          )}

          {params.error === "update_failed" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Failed to update application status.
            </div>
          )}
        </div>

        {/* Fetch Error */}
        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-6 text-red-700"
          >
            Failed to load applications: {error.message}
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No Applications Found
            </h2>

            <p className="mt-2 text-gray-500">
              No volunteer applications have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <p className="font-medium text-gray-700">
              Total Applications: {applications.length}
            </p>

            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                {/* Applicant Information */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {application.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {application.email}
                    </p>

                    <p className="text-sm text-gray-600">
                      {application.phone}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    {application.status}
                  </span>
                </div>

                {/* Academic Information */}
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Department
                    </p>
                    <p className="mt-1 text-gray-800">
                      {application.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Hall Name
                    </p>
                    <p className="mt-1 text-gray-800">
                      {application.hall_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Academic Session
                    </p>
                    <p className="mt-1 text-gray-800">
                      {application.academic_session}
                    </p>
                  </div>
                </div>

                {/* Motivation */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Motivation
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {application.motivation}
                  </p>
                </div>

                {/* Previous Experience */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Previous Experience
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {application.experience || "Not provided"}
                  </p>
                </div>

                {/* Application Date */}
                <p className="mt-5 text-xs text-gray-400">
                  Applied on:{" "}
                  {new Date(application.created_at).toLocaleDateString(
                    "en-GB",
                    { timeZone: "Asia/Dhaka" }
                  )}
                </p>

                {/* Update Application Status */}
                <div className="mt-6 border-t border-gray-200 pt-5">
                  <h3 className="font-semibold text-gray-800">
                    Update Application Status
                  </h3>

                  <form
                    action={updateApplicationStatus}
                    className="mt-3 flex flex-wrap items-center gap-3"
                  >
                    <input
                      type="hidden"
                      name="application_id"
                      value={application.id}
                    />

                    <label
                      htmlFor={`status-${application.id}`}
                      className="sr-only"
                    >
                      Application status for {application.full_name}
                    </label>

                    <select
                      id={`status-${application.id}`}
                      name="status"
                      defaultValue={application.status}
                      className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="min-h-11 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Update Status
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}