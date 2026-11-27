import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registerVolunteer } from "./actions";

type PageProps = {
  searchParams: Promise<{
    applicationId?: string;
    error?: string;
    registered?: string;
  }>;
};

export default async function RegisterVolunteerPage({
  searchParams,
}: PageProps) {
  const {
    applicationId,
    error: queryError,
    registered,
  } = await searchParams;

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

  // 3. Validate application ID
  if (!applicationId) {
    redirect("/admin/volunteers/selected-applicants");
  }

  // 4. Fetch selected applicant
  const { data: applicant, error } = await supabase
    .from("volunteer_applications")
    .select(`
      id,
      full_name,
      email,
      phone,
      department,
      hall_name,
      academic_session,
      status
    `)
    .eq("id", applicationId)
    .eq("status", "SELECTED")
    .single();

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <Link
          href="/admin/volunteers/selected-applicants"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Selected Applicants
        </Link>

        {/* Page Header */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Register Volunteer
        </h1>

        <p className="mt-2 text-gray-600">
          Register a selected applicant as an official Tori School volunteer.
        </p>

        {/* Success Message */}
        {registered === "1" && (
          <div
            role="status"
            className="mt-6 rounded-lg bg-green-100 p-4 text-green-800"
          >
            Volunteer registration completed successfully!
          </div>
        )}

        {/* Error Messages */}
        {queryError && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
          >
            {queryError === "missing_fields" &&
              "Please select a joining date."}

            {queryError === "invalid_date" &&
              "Invalid joining date."}

            {queryError === "application_not_found" &&
              "Applicant not found."}

            {queryError === "not_selected" &&
              "This applicant is not selected."}

            {queryError === "already_registered" &&
              "This applicant is already registered as a volunteer."}

            {queryError === "database_error" &&
              "Database error occurred."}

            {queryError === "email_already_registered" &&
              "An account already exists with this applicant's email."}

            {queryError === "auth_creation_failed" &&
              "Failed to create volunteer account."}

            {queryError === "profile_creation_failed" &&
              "Failed to create volunteer profile."}

            {queryError === "volunteer_creation_failed" &&
              "Failed to complete volunteer registration."}
          </div>
        )}

        {/* Applicant Information */}
        {error || !applicant ? (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-6 text-red-700"
          >
            Unable to find this selected applicant.
          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              Applicant Information
            </h2>

            {/* Applicant Details */}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Full Name
                </p>
                <p className="mt-1 text-gray-800">
                  {applicant.full_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Email
                </p>
                <p className="mt-1 text-gray-800">
                  {applicant.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Phone
                </p>
                <p className="mt-1 text-gray-800">
                  {applicant.phone}
                </p>
              </div>

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

            <hr className="my-6" />

            {/* Registration Section */}
            <h2 className="text-xl font-bold text-gray-900">
              Registration Information
            </h2>

            <form
              action={registerVolunteer}
              className="mt-5"
            >
              {/* Application ID */}
              <input
                type="hidden"
                name="application_id"
                value={applicant.id}
              />

              {/* Joining Date */}
              <div>
                <label
                  htmlFor="joining_date"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Joining Date *
                </label>

                <input
                  id="joining_date"
                  name="joining_date"
                  type="date"
                  required
                  className="min-h-11 w-full rounded-lg border border-gray-300 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Select the date when this applicant officially joins
                  Tori School as a volunteer.
                </p>
              </div>

              {/* Information */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                A unique Volunteer Code and volunteer account will be
                generated during registration.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-6 min-h-11 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Register as Volunteer
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}