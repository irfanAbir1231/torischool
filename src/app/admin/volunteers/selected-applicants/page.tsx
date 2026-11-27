import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SelectedApplicantsPage() {
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

  // 3. Fetch selected applicants
  const { data: applicants, error } = await supabase
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
    .eq("status", "SELECTED")
    .order("created_at", { ascending: false });

  const selectedApplicants = applicants ?? [];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/volunteers"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Volunteer Management
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Selected Applicants
        </h1>

        <p className="mt-2 text-gray-600">
          Manage applicants selected for volunteering.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-6 text-red-700"
          >
            Failed to load applicants: {error.message}
          </div>
        ) : selectedApplicants.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No Selected Applicants
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no applicants with SELECTED status.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <p role="status" className="font-medium text-gray-700">
              Total Selected Applicants: {selectedApplicants.length}
            </p>

            {selectedApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {applicant.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {applicant.email}
                    </p>

                    <p className="text-sm text-gray-600">
                      {applicant.phone}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    {applicant.status}
                  </span>
                </div>

                {/* Academic Information */}
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Department
                    </p>
                    <p className="mt-1 text-gray-800">
                      {applicant.department || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Hall Name
                    </p>
                    <p className="mt-1 text-gray-800">
                      {applicant.hall_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Academic Session
                    </p>
                    <p className="mt-1 text-gray-800">
                      {applicant.academic_session || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Motivation */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Motivation
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {applicant.motivation}
                  </p>
                </div>

                {/* Previous Experience */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-500">
                    Previous Experience
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {applicant.experience || "Not provided"}
                  </p>
                </div>

                {/* Application Date */}
                <p className="mt-5 text-xs text-gray-400">
                  Applied on:{" "}
                  {new Date(applicant.created_at).toLocaleDateString(
                    "en-GB",
                    { timeZone: "Asia/Dhaka" }
                  )}
                </p>

                {/* Register Button */}
                <Link
                  href={`/admin/volunteers/selected-applicants/register?applicationId=${applicant.id}`}
                  className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Register as Volunteer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}