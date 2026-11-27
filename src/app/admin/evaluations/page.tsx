import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEvaluations } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    generated?: string;
  }>;
};

export default async function EvaluationsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  // 1. Verify authenticated user
  const supabase = await createClient();

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

  // 3. Fetch evaluations
  const adminClient = createAdminClient();

  const { data: evaluations, error: evaluationsError } =
    await adminClient
      .from("evaluations")
      .select("*")
      .order("period_start", { ascending: false });

  // 4. Fetch volunteer information
  const volunteerIds = [
    ...new Set((evaluations || []).map((item) => item.volunteer_id)),
  ];

  let volunteers: {
    id: string;
    volunteer_code: string;
    profile_id: string;
  }[] = [];

  let profiles: {
    id: string;
    full_name: string;
  }[] = [];

  if (volunteerIds.length > 0) {
    const { data: volunteerData } = await adminClient
      .from("volunteers")
      .select("id, volunteer_code, profile_id")
      .in("id", volunteerIds);

    volunteers = volunteerData || [];

    const profileIds = volunteers.map((item) => item.profile_id);

    if (profileIds.length > 0) {
      const { data: profileData } = await adminClient
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      profiles = profileData || [];
    }
  }

  // 5. Prepare volunteer details
  const volunteerMap = new Map(
    volunteers.map((item) => {
      const volunteerProfile = profiles.find(
        (profile) => profile.id === item.profile_id
      );

      return [
        item.id,
        {
          volunteer_code: item.volunteer_code,
          full_name: volunteerProfile?.full_name || "Unknown",
        },
      ];
    })
  );

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          &#8592; Back to Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Volunteer Evaluations
        </h1>

        <p className="mt-2 text-gray-600">
          Manage weekly and monthly volunteer evaluations.
        </p>

        {/* Success and Error Messages */}
        {params.generated && (
          <div className="mt-6 rounded-lg bg-green-100 p-4 text-green-800">
            Successfully generated {params.generated} evaluation(s).
          </div>
        )}

        {params.error && (
          <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
            {params.error === "invalid_period" &&
              "Please select a valid date range or month."}

            {params.error === "invalid_type" &&
              "Invalid evaluation type."}

            {params.error === "fetch_failed" &&
              "Failed to fetch required information from the database."}

            {params.error === "no_volunteers" &&
              "No eligible volunteers found."}

            {params.error === "no_sessions" &&
              "No completed sessions found in this period."}

            {params.error === "no_eligible_volunteers" &&
              "No volunteers have eligible sessions in this period."}

            {params.error === "duplicate" &&
              "Evaluations already exist for at least one volunteer in this period. No records were generated."}

            {params.error === "generation_failed" &&
              "Failed to generate evaluations. Please try again."}
          </div>
        )}

        {/* Generate Evaluations */}
        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Weekly Evaluation */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Generate Weekly Evaluation
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Select the starting and ending dates of the week.
            </p>

            <form action={generateEvaluations} className="mt-5 space-y-4">
              <input
                type="hidden"
                name="evaluation_type"
                value="WEEKLY"
              />

              <div>
                <label
                  htmlFor="weekly-period-start"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>

                <input
                  id="weekly-period-start"
                  type="date"
                  name="period_start"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label
                  htmlFor="weekly-period-end"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>

                <input
                  id="weekly-period-end"
                  type="date"
                  name="period_end"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Generate Weekly Evaluation
              </button>
            </form>
          </div>

          {/* Monthly Evaluation */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Generate Monthly Evaluation
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Select a month. The system will calculate its first and last
              dates automatically.
            </p>

            <form action={generateEvaluations} className="mt-5 space-y-4">
              <input
                type="hidden"
                name="evaluation_type"
                value="MONTHLY"
              />

              <div>
                <label
                  htmlFor="evaluation-month"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Select Month
                </label>

                <input
                  id="evaluation-month"
                  type="month"
                  name="month"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
              >
                Generate Monthly Evaluation
              </button>
            </form>
          </div>
        </section>

        {/* Evaluation List */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            All Evaluations
          </h2>

          {evaluationsError ? (
            <p className="mt-4 text-red-600">
              Failed to load evaluations: {evaluationsError.message}
            </p>
          ) : evaluations && evaluations.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-600">
                    <th className="p-3">Volunteer</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Period</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Category</th>
                  </tr>
                </thead>

                <tbody>
                  {evaluations.map((evaluation) => {
                    const volunteer = volunteerMap.get(
                      evaluation.volunteer_id
                    );

                    return (
                      <tr key={evaluation.id} className="border-b">
                        <td className="p-3">
                          <p className="font-medium">
                            {volunteer?.full_name || "Unknown"}
                          </p>

                          <p className="text-gray-500">
                            {volunteer?.volunteer_code || "N/A"}
                          </p>
                        </td>

                        <td className="p-3">
                          {evaluation.evaluation_type}
                        </td>

                        <td className="p-3">
                          {evaluation.period_start} to{" "}
                          {evaluation.period_end}
                        </td>

                        <td className="p-3">
                          {evaluation.attendance_percentage ?? "N/A"}%
                        </td>

                        <td className="p-3">
                          {evaluation.score ?? "N/A"}
                        </td>

                        <td className="p-3">
                          {evaluation.category || "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No evaluations found. Create your first evaluation to get
              started.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}