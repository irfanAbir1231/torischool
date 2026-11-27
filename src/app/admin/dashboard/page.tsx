import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/LogoutButton";
import NotificationList from "@/components/NotificationList";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch user's role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Fetch dashboard statistics
  const adminClient = createAdminClient();

  const [
    volunteersResult,
    sessionsResult,
    leavesResult,
    evaluationsResult,
    attendanceResult,
  ] = await Promise.all([
    adminClient.from("volunteers").select("status"),
    adminClient.from("sessions").select("status"),
    adminClient
      .from("volunteer_leaves")
      .select("status")
      .eq("status", "PENDING"),
    adminClient.from("evaluations").select("id, category"),
    adminClient.from("attendance").select("status"),
  ]);

  // Check for database query errors
  if (
    volunteersResult.error ||
    sessionsResult.error ||
    leavesResult.error ||
    evaluationsResult.error ||
    attendanceResult.error
  ) {
    throw new Error("Failed to load dashboard statistics.");
  }

  const volunteers = volunteersResult.data || [];
  const sessions = sessionsResult.data || [];
  const pendingLeaves = leavesResult.data || [];
  const evaluations = evaluationsResult.data || [];
  const attendance = attendanceResult.data || [];

  // 4. Calculate volunteer statistics
  const totalVolunteers = volunteers.length;

  const activeVolunteers = volunteers.filter(
    (volunteer) => volunteer.status === "ACTIVE"
  ).length;

  const inactiveVolunteers = volunteers.filter(
    (volunteer) => volunteer.status === "INACTIVE"
  ).length;

  // 5. Calculate session statistics
  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  ).length;

  // 6. Calculate leave statistics
  const pendingLeaveApplications = pendingLeaves.length;

  // 7. Calculate evaluation statistics
  const totalEvaluations = evaluations.length;

  const excellentCount = evaluations.filter(
    (evaluation) => evaluation.category === "EXCELLENT"
  ).length;

  const goodCount = evaluations.filter(
    (evaluation) => evaluation.category === "GOOD"
  ).length;

  const averageCount = evaluations.filter(
    (evaluation) => evaluation.category === "AVERAGE"
  ).length;

  const needsImprovementCount = evaluations.filter(
    (evaluation) => evaluation.category === "NEEDS_IMPROVEMENT"
  ).length;

  const criticalCount = evaluations.filter(
    (evaluation) => evaluation.category === "CRITICAL"
  ).length;

  // 8. Calculate attendance statistics
  const totalAttendanceRecords = attendance.length;

  const presentRecords = attendance.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const attendancePercentage =
    totalAttendanceRecords > 0
      ? Math.round((presentRecords / totalAttendanceRecords) * 100)
      : 0;

  const statistics = [
    {
      label: "Total Volunteers",
      value: totalVolunteers,
      description: "All registered volunteers",
    },
    {
      label: "Active Volunteers",
      value: activeVolunteers,
      description: "Currently active",
    },
    {
      label: "Inactive Volunteers",
      value: inactiveVolunteers,
      description: "Currently inactive",
    },
    {
      label: "Completed Sessions",
      value: completedSessions,
      description: "Successfully completed",
    },
    {
      label: "Pending Leaves",
      value: pendingLeaveApplications,
      description: "Awaiting review",
    },
    {
      label: "Total Evaluations",
      value: totalEvaluations,
      description: "Generated evaluations",
    },
    {
      label: "Present Records",
      value: presentRecords,
      description: "Recorded attendance",
    },
    {
      label: "Attendance Rate",
      value: `${attendancePercentage}%`,
      description: "Present out of all records",
    },
  ];

  const performanceCategories = [
    {
      label: "Excellent",
      value: excellentCount,
      color: "border-green-200 bg-green-50 text-green-800",
    },
    {
      label: "Good",
      value: goodCount,
      color: "border-blue-200 bg-blue-50 text-blue-800",
    },
    {
      label: "Average",
      value: averageCount,
      color: "border-yellow-200 bg-yellow-50 text-yellow-800",
    },
    {
      label: "Needs Improvement",
      value: needsImprovementCount,
      color: "border-orange-200 bg-orange-50 text-orange-800",
    },
    {
      label: "Critical",
      value: criticalCount,
      color: "border-red-200 bg-red-50 text-red-800",
    },
  ];

  const navigationCards = [
    {
      title: "Recruitment",
      description:
        "Create recruitment periods and manage application status.",
      href: "/admin/recruitment",
      label: "Manage recruitment",
    },
    {
      title: "Volunteer Management",
      description:
        "Manage selected applicants and registered volunteers.",
      href: "/admin/volunteers",
      label: "Manage volunteers",
    },
    {
      title: "Attendance",
      description:
        "Create sessions and manage volunteer attendance.",
      href: "/admin/attendance",
      label: "Manage attendance",
    },
    {
      title: "Leave Management",
      description:
        "Review and manage volunteer leave applications.",
      href: "/admin/volunteers/leaves",
      label: "Manage leaves",
    },
    {
      title: "Evaluations",
      description:
        "Generate and review weekly and monthly evaluations.",
      href: "/admin/evaluations",
      label: "Manage evaluations",
    },
    {
      title: "Justifications",
      description:
        "Review volunteer absence justifications and provide feedback.",
      href: "/admin/justifications",
      label: "Manage justifications",
    },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-surface px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Dashboard Header */}
        <header className="rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Administration</p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                Welcome, {profile.full_name}!
              </p>

              <p className="mt-1 text-xs text-muted/70">
                Manage volunteers, activities and organizational performance.
              </p>
            </div>

            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Notifications */}
        <NotificationList profileId={user.id} />

        {/* Dashboard Statistics */}
        <section
          aria-labelledby="statistics-heading"
          className="mt-10"
        >
          <div className="mb-5">
            <p className="eyebrow">At a glance</p>

            <h2
              id="statistics-heading"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              Dashboard Overview
            </h2>

            <p className="mt-1 text-sm text-muted">
              A summary of volunteer activities and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((statistic) => (
              <article
                key={statistic.label}
                className="rounded-2xl border border-line bg-cream p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-5 text-muted">
                    {statistic.label}
                  </p>

                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
                  />
                </div>

                <p className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {statistic.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted/70">
                  {statistic.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Volunteer Performance Overview */}
        <section
          aria-labelledby="performance-heading"
          className="mt-10 rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-7"
        >
          <div>
            <p className="eyebrow">Volunteer quality</p>

            <h2
              id="performance-heading"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              Performance Overview
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Distribution of volunteers based on generated evaluations.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {performanceCategories.map((category) => (
              <article
                key={category.label}
                className={`rounded-xl border p-4 ${category.color}`}
              >
                <p className="text-sm font-medium leading-5">
                  {category.label}
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {category.value}
                </p>

                <p className="mt-1 text-xs opacity-75">
                  Evaluations
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Management Navigation */}
        <section
          aria-labelledby="management-heading"
          className="mt-10"
        >
          <div className="mb-5">
            <p className="eyebrow">Quick access</p>

            <h2
              id="management-heading"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              Management Center
            </h2>

            <p className="mt-1 text-sm text-muted">
              Access the main administration sections.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {navigationCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                aria-label={card.label}
                className="group flex min-h-40 flex-col rounded-2xl border border-line bg-cream p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink">
                    {card.title}
                  </h3>

                  <span
                    aria-hidden="true"
                    className="text-xl text-accent-strong transition-transform group-hover:translate-x-1"
                  >
                    &#8594;
                  </span>
                </div>

                <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                  {card.description}
                </p>

                <span className="mt-5 text-xs font-semibold text-accent-strong">
                  Open section
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-12 border-t border-line py-6">
          <p className="text-center text-xs leading-5 text-muted/70">
            Tori School Administration &#183; Volunteer Management System
          </p>
        </footer>
      </div>
    </main>
  );
}
