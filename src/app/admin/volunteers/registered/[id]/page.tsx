import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateVolunteerStatus } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    statusUpdated?: string;
    updated?: string;
  }>;
};

export default async function VolunteerDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;

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
  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || adminProfile?.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Fetch volunteer details
  const { data: volunteer, error } = await supabase
    .from("volunteers")
    .select(`
      id,
      volunteer_code,
      joining_date,
      inactive_date,
      status,
      created_at,
      profiles (
        full_name,
        email,
        phone,
        role
      ),
      volunteer_applications (
        department,
        hall_name,
        academic_session,
        motivation,
        experience
      )
    `)
    .eq("id", id)
    .single();

  // 4. Handle errors
  if (error || !volunteer) {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-gray-50 p-4 sm:p-8"
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/volunteers/registered"
            className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            &#8592; Back to Registered Volunteers
          </Link>

          <div
            role="alert"
            className="mt-8 rounded-xl bg-red-100 p-6 text-red-700"
          >
            Volunteer not found or unable to load details.
          </div>
        </div>
      </main>
    );
  }

  // 5. Handle related profile/application data
  const profile = Array.isArray(volunteer.profiles)
    ? volunteer.profiles[0]
    : volunteer.profiles;

  const application = Array.isArray(volunteer.volunteer_applications)
    ? volunteer.volunteer_applications[0]
    : volunteer.volunteer_applications;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <Link
          href="/admin/volunteers/registered"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Registered Volunteers
        </Link>

        {/* Heading */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Volunteer Details
            </h1>

            <p className="mt-2 text-gray-600">
              Complete information about this volunteer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                volunteer.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {volunteer.status}
            </span>

            <Link
              href={`/admin/volunteers/registered/${id}/edit`}
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Status Management */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Volunteer Status
          </h2>

          {query.statusUpdated === "true" && (
            <p
              role="status"
              className="mt-3 rounded-lg bg-green-100 p-3 text-green-700"
            >
              Volunteer status updated successfully.
            </p>
          )}

          {query.error === "status_update_failed" && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-100 p-3 text-red-700"
            >
              Unable to update volunteer status.
            </p>
          )}

          <p className="mt-3 text-gray-600">
            Current Status:{" "}
            <strong>{volunteer.status}</strong>
          </p>

          <form action={updateVolunteerStatus} className="mt-5">
            <input
              type="hidden"
              name="volunteerId"
              value={volunteer.id}
            />

            {volunteer.status === "ACTIVE" ? (
              <button
                type="submit"
                name="status"
                value="INACTIVE"
                className="min-h-11 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Deactivate Volunteer
              </button>
            ) : (
              <button
                type="submit"
                name="status"
                value="ACTIVE"
                className="min-h-11 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Reactivate Volunteer
              </button>
            )}
          </form>
        </section>

        {/* Personal Information */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Personal Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile?.full_name ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile?.email ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile?.phone ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile?.role ?? "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Volunteer Information */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Volunteer Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Volunteer Code</p>
              <p className="mt-1 font-medium text-gray-900">
                {volunteer.volunteer_code}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Joining Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {volunteer.joining_date}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Inactive Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {volunteer.inactive_date ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Registration Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {new Date(volunteer.created_at).toLocaleDateString(
                  "en-GB",
                  { timeZone: "Asia/Dhaka" }
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Academic Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="mt-1 font-medium text-gray-900">
                {application?.department ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Hall Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {application?.hall_name ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Academic Session</p>
              <p className="mt-1 font-medium text-gray-900">
                {application?.academic_session ?? "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Application Information */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            Application Information
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm text-gray-500">Motivation</p>
              <p className="mt-1 whitespace-pre-wrap text-gray-900">
                {application?.motivation ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Previous Experience</p>
              <p className="mt-1 whitespace-pre-wrap text-gray-900">
                {application?.experience ?? "N/A"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}