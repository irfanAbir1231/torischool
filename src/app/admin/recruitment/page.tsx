import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createRecruitment,
  updateRecruitmentStatus,
} from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    updated?: string;
  }>;
};

export default async function RecruitmentPage({
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

  // 3. Fetch all recruitment periods
  const { data: recruitments, error } = await supabase
    .from("recruitment_periods")
    .select("id, title, opens_at, closes_at, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Back Navigation */}
        <Link
          href="/admin/dashboard"
          className="text-blue-600 hover:underline"
        >
          &#8592; Back to Dashboard
        </Link>

        {/* Page Header */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Recruitment Management
        </h1>

        <p className="mt-2 text-gray-600">
          Create and manage volunteer recruitment periods.
        </p>

        {/* Success and Error Messages */}
        <div className="mt-6 space-y-3">
          {params.created === "1" && (
            <div
              role="status"
              className="rounded-lg bg-green-100 p-4 text-green-700"
            >
              Recruitment period created successfully!
            </div>
          )}

          {params.updated === "1" && (
            <div
              role="status"
              className="rounded-lg bg-green-100 p-4 text-green-700"
            >
              Recruitment status updated successfully!
            </div>
          )}

          {params.error === "missing_fields" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Please fill in all required fields.
            </div>
          )}

          {params.error === "invalid_dates" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Please provide valid dates. Closing date must be after opening date.
            </div>
          )}

          {params.error === "creation_failed" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Failed to create recruitment. Please try again.
            </div>
          )}

          {params.error === "invalid_status" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Invalid recruitment status.
            </div>
          )}

          {params.error === "recruitment_not_found" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Recruitment period not found.
            </div>
          )}

          {params.error === "outside_recruitment_dates" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Recruitment can only be opened during its scheduled dates.
            </div>
          )}

          {params.error === "status_update_failed" && (
            <div
              role="alert"
              className="rounded-lg bg-red-100 p-4 text-red-700"
            >
              Failed to update recruitment status.
            </div>
          )}
        </div>

        {/* Create Recruitment Form */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold text-gray-900">
            Create New Recruitment
          </h2>

          <form
            action={createRecruitment}
            className="mt-6 space-y-5"
          >
            {/* Recruitment Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Recruitment Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Volunteer Recruitment 2026"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            {/* Opening and Closing Dates */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="opens_at"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Opening Date and Time
                </label>

                <input
                  id="opens_at"
                  name="opens_at"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="closes_at"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Closing Date and Time
                </label>

                <input
                  id="closes_at"
                  name="closes_at"
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">
              All dates and times are interpreted as Bangladesh time (UTC+6).
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create Recruitment
            </button>
          </form>
        </section>

        {/* Existing Recruitment Periods */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Existing Recruitment Periods
          </h2>

          {/* Fetch Error */}
          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-xl bg-red-50 p-6 text-red-700"
            >
              Failed to load recruitment periods: {error.message}
            </div>
          ) : !recruitments || recruitments.length === 0 ? (
            /* Empty State */
            <div className="mt-6 rounded-xl bg-white p-8 text-center shadow">
              <h3 className="text-lg font-semibold text-gray-800">
                No Recruitment Periods
              </h3>

              <p className="mt-2 text-gray-500">
                No recruitment periods have been created yet.
              </p>
            </div>
          ) : (
            /* Recruitment List */
            <div className="mt-6 space-y-5">
              {recruitments.map((recruitment) => (
                <div
                  key={recruitment.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  {/* Title and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {recruitment.title}
                    </h3>

                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                      {recruitment.status}
                    </span>
                  </div>

                  {/* Opening and Closing Dates */}
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Opens At
                      </p>

                      <p className="mt-1 text-gray-800">
                        {new Date(recruitment.opens_at).toLocaleString(
                          "en-GB",
                          { timeZone: "Asia/Dhaka" }
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        Closes At
                      </p>

                      <p className="mt-1 text-gray-800">
                        {new Date(recruitment.closes_at).toLocaleString(
                          "en-GB",
                          { timeZone: "Asia/Dhaka" }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Open and Close Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {/* Open Button */}
                    {recruitment.status !== "OPEN" && (
                      <form action={updateRecruitmentStatus}>
                        <input
                          type="hidden"
                          name="recruitment_id"
                          value={recruitment.id}
                        />

                        <input
                          type="hidden"
                          name="status"
                          value="OPEN"
                        />

                        <button
                          type="submit"
                          className="min-h-11 rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                        >
                          Open Recruitment
                        </button>
                      </form>
                    )}

                    {/* Close Button */}
                    {recruitment.status !== "CLOSED" && (
                      <form action={updateRecruitmentStatus}>
                        <input
                          type="hidden"
                          name="recruitment_id"
                          value={recruitment.id}
                        />

                        <input
                          type="hidden"
                          name="status"
                          value="CLOSED"
                        />

                        <button
                          type="submit"
                          className="min-h-11 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                        >
                          Close Recruitment
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}