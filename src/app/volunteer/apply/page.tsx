import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { submitApplication } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    submitted?: string;
  }>;
};

export default async function VolunteerApplicationPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const now = new Date().toISOString();

  // Fetch active recruitment periods
  const { data: recruitments, error } = await supabase
    .from("recruitment_periods")
    .select("id, title, opens_at, closes_at")
    .eq("status", "OPEN")
    .lte("opens_at", now)
    .gte("closes_at", now)
    .order("created_at", { ascending: false });

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-12"
    >
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-blue-600 hover:underline">
          &#8592; Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Volunteer Application
        </h1>

        <p className="mt-2 text-gray-600">
          Apply to become a volunteer at Tori School.
        </p>

        {/* Success Message */}
        {params.submitted === "1" && (
          <div
            role="status"
            className="mt-6 rounded-lg bg-green-100 p-4 text-green-700"
          >
            Your application has been submitted successfully!
          </div>
        )}

        {/* Error Messages */}
        {params.error && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
          >
            {params.error === "missing_fields" &&
              "Please fill in all required fields."}

            {params.error === "invalid_email" &&
              "Please provide a valid email address."}

            {params.error === "invalid_length" &&
              "One or more fields exceed the allowed length."}

            {params.error === "invalid_recruitment" &&
              "Invalid recruitment period."}

            {params.error === "recruitment_closed" &&
              "This recruitment is no longer accepting applications."}

            {params.error === "submission_failed" &&
              "Failed to submit your application. Please try again."}
          </div>
        )}

        {/* Recruitment Fetch Error */}
        {error ? (
          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-6 text-red-700"
          >
            Failed to load recruitment information.
          </div>
        ) : !recruitments || recruitments.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No Active Recruitment
            </h2>

            <p className="mt-2 text-gray-500">
              There is currently no open volunteer recruitment.
              Please check again later.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {recruitments.map((recruitment) => (
              <section
                key={recruitment.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {recruitment.title}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Application Deadline:{" "}
                  {new Date(recruitment.closes_at).toLocaleString("en-GB", {
                    timeZone: "Asia/Dhaka",
                  })}
                </p>

                <form
                  action={submitApplication}
                  className="mt-6 space-y-5"
                >
                  <input
                    type="hidden"
                    name="recruitment_period_id"
                    value={recruitment.id}
                  />

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor={`full_name-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Full Name *
                    </label>

                    <input
                      id={`full_name-${recruitment.id}`}
                      name="full_name"
                      type="text"
                      required
                      maxLength={150}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor={`email-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Email Address *
                    </label>

                    <input
                      id={`email-${recruitment.id}`}
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor={`phone-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>

                    <input
                      id={`phone-${recruitment.id}`}
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label
                      htmlFor={`department-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Department *
                    </label>

                    <input
                      id={`department-${recruitment.id}`}
                      name="department"
                      type="text"
                      required
                      maxLength={255}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Enter your department"
                    />
                  </div>

                  {/* Hall Name */}
                  <div>
                    <label
                      htmlFor={`hall_name-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Hall Name *
                    </label>

                    <input
                      id={`hall_name-${recruitment.id}`}
                      name="hall_name"
                      type="text"
                      required
                      maxLength={255}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Enter your residential hall name"
                    />
                  </div>

                  {/* Academic Session */}
                  <div>
                    <label
                      htmlFor={`academic_session-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Academic Session *
                    </label>

                    <input
                      id={`academic_session-${recruitment.id}`}
                      name="academic_session"
                      type="text"
                      required
                      maxLength={50}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="e.g. 2022-2023"
                    />
                  </div>

                  {/* Motivation */}
                  <div>
                    <label
                      htmlFor={`motivation-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Why do you want to join Tori School? *
                    </label>

                    <textarea
                      id={`motivation-${recruitment.id}`}
                      name="motivation"
                      required
                      rows={5}
                      maxLength={5000}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Tell us why you want to become a volunteer..."
                    />
                  </div>

                  {/* Previous Experience */}
                  <div>
                    <label
                      htmlFor={`experience-${recruitment.id}`}
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Previous Experience
                    </label>

                    <textarea
                      id={`experience-${recruitment.id}`}
                      name="experience"
                      rows={4}
                      maxLength={5000}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      placeholder="Describe your previous volunteering or relevant experience..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
                  >
                    Submit Application
                  </button>
                </form>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}