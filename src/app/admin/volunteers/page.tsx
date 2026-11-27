import Link from "next/link";

export default function VolunteerManagementPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/dashboard"
          className="text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          &#8592; Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Volunteer Management
        </h1>

        <p className="mt-2 text-gray-600">
          Manage applications, selected applicants and registered volunteers.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Application Management */}
          <Link
            href="/admin/volunteers/applications"
            className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Application Management
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              View submitted applications, review applicant details and update application status.
            </p>

            <p className="mt-4 font-medium text-blue-600">
              Manage Applications &#8594;
            </p>
          </Link>

          {/* Selected Applicants */}
          <Link
            href="/admin/volunteers/selected-applicants"
            className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Selected Applicants
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              View selected applicants and register them as volunteers.
            </p>

            <p className="mt-4 font-medium text-blue-600">
              View Applicants &#8594;
            </p>
          </Link>

          {/* Registered Volunteers */}
          <Link
            href="/admin/volunteers/registered"
            className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Registered Volunteers
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              View and manage registered volunteers.
            </p>

            <p className="mt-4 font-medium text-blue-600">
              Manage Volunteers &#8594;
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}