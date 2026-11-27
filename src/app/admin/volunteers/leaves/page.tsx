import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewLeaveApplication } from "./actions";
export default async function AdminLeavesPage() {
  const supabase = await createClient();

  // Check logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch leave applications
  const adminSupabase = createAdminClient();

  const { data: leaves, error } = await adminSupabase
    .from("volunteer_leaves")
    .select(`
      id,
      start_date,
      end_date,
      reason,
      status,
      created_at,
      volunteers (
        volunteer_code,
        profiles (
          full_name,
          email
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
  return (
    <div className="p-6">
      <h2 className="text-red-600 font-bold">
        Failed to load leave applications
      </h2>

      <pre className="mt-3 bg-gray-100 p-4 rounded text-sm">
        {JSON.stringify(error, null, 2)}
      </pre>
    </div>
  );
}

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mt-3">
          Volunteer Leave Management
        </h1>

        <p className="text-gray-500 mt-1">
          View and manage volunteer leave applications.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Volunteer</th>
              <th className="p-4">Volunteer Code</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">End Date</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves && leaves.length > 0 ? (
              leaves.map((leave) => {
                const volunteer = leave.volunteers as unknown as {
                  volunteer_code: string;
                  profiles: {
                    full_name: string;
                    email: string;
                  };
                };

                return (
                  <tr key={leave.id} className="border-t">
                    <td className="p-4">
                      <div className="font-medium">
                        {volunteer?.profiles?.full_name ?? "Unknown"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {volunteer?.profiles?.email ?? ""}
                      </div>
                    </td>

                    <td className="p-4">
                      {volunteer?.volunteer_code ?? "-"}
                    </td>

                    <td className="p-4">
                      {leave.start_date}
                    </td>

                    <td className="p-4">
                      {leave.end_date}
                    </td>

                    <td className="p-4 max-w-xs">
                      {leave.reason}
                    </td>

                    <td className="p-4">
  <div className="space-y-3">
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        leave.status === "PENDING"
          ? "bg-yellow-100 text-yellow-700"
          : leave.status === "APPROVED"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {leave.status}
    </span>

    {leave.status === "PENDING" && (
      <div className="flex gap-2">
        <form action={reviewLeaveApplication}>
          <input
            type="hidden"
            name="leave_id"
            value={leave.id}
          />
          <input
            type="hidden"
            name="status"
            value="APPROVED"
          />

          <button
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
        </form>

        <form action={reviewLeaveApplication}>
          <input
            type="hidden"
            name="leave_id"
            value={leave.id}
          />
          <input
            type="hidden"
            name="status"
            value="REJECTED"
          />

          <button
            type="submit"
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </form>
      </div>
    )}
  </div>
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  No leave applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}