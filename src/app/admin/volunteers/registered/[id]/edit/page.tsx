import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateVolunteerProfile } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditVolunteerProfilePage({
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

  // 3. Fetch volunteer information
  const { data: volunteer, error } = await supabase
    .from("volunteers")
    .select(`
      id,
      profile_id,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq("id", id)
    .single();

  if (error || !volunteer) {
    redirect("/admin/volunteers/registered");
  }

  // 4. Handle profile relation
  const profile = Array.isArray(volunteer.profiles)
    ? volunteer.profiles[0]
    : volunteer.profiles;

  if (!profile) {
    redirect("/admin/volunteers/registered");
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/admin/volunteers/registered/${id}`}
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Volunteer Details
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Edit Volunteer Profile
        </h1>

        <p className="mt-2 text-gray-600">
          Update the volunteer&apos;s personal information.
        </p>

        {query.error && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
          >
            {query.error === "invalid_fields" &&
              "Please enter a valid full name."}

            {query.error === "invalid_phone" &&
              "Phone number is too long."}

            {query.error === "update_failed" &&
              "Unable to update volunteer profile."}
          </div>
        )}

        <form
          action={updateVolunteerProfile}
          className="mt-8 rounded-xl bg-white p-6 shadow"
        >
          <input
            type="hidden"
            name="volunteerId"
            value={volunteer.id}
          />

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                name="fullName"
                defaultValue={profile.full_name}
                required
                maxLength={255}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
              />

              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed here.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="text"
                name="phone"
                defaultValue={profile.phone ?? ""}
                maxLength={30}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Save Changes
              </button>

              <Link
                href={`/admin/volunteers/registered/${id}`}
                className="inline-flex min-h-11 items-center rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}