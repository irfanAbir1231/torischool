import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RegisteredVolunteersPage() {
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

  // 3. Fetch registered volunteers
  const { data: volunteers, error } = await supabase
    .from("volunteers")
    .select(`
      id,
      volunteer_code,
      joining_date,
      status,
      profiles (
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <Link
          href="/admin/volunteers"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Volunteer Management
        </Link>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Registered Volunteers
        </h1>

        <p className="mt-2 text-gray-600">
          View and manage all registered volunteers.
        </p>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-red-100 p-4 text-red-700"
          >
            <p className="font-semibold">
              Failed to load volunteers.
            </p>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && volunteers?.length === 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow">
            No registered volunteers found.
          </div>
        )}

        {/* Volunteers Table */}
        {!error && volunteers && volunteers.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full min-w-[850px] text-left text-sm">
              <caption className="sr-only">
                List of registered volunteers and their details
              </caption>

              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th scope="col" className="p-4">
                    Volunteer Code
                  </th>
                  <th scope="col" className="p-4">
                    Name
                  </th>
                  <th scope="col" className="p-4">
                    Email
                  </th>
                  <th scope="col" className="p-4">
                    Phone
                  </th>
                  <th scope="col" className="p-4">
                    Joining Date
                  </th>
                  <th scope="col" className="p-4">
                    Status
                  </th>
                  <th scope="col" className="p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {volunteers.map((volunteer) => {
                  const profile = Array.isArray(volunteer.profiles)
                    ? volunteer.profiles[0]
                    : volunteer.profiles;

                  return (
                    <tr
                      key={volunteer.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {volunteer.volunteer_code}
                      </td>

                      <td className="p-4">
                        {profile?.full_name ?? "N/A"}
                      </td>

                      <td className="p-4">
                        {profile?.email ?? "N/A"}
                      </td>

                      <td className="p-4">
                        {profile?.phone ?? "N/A"}
                      </td>

                      <td className="p-4">
                        {volunteer.joining_date}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            volunteer.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {volunteer.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/admin/volunteers/registered/${volunteer.id}`}
                          className="font-medium text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                        >
                          View Details &#8594;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}