import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import NotificationList from "@/components/NotificationList";
import { volunteerCheckIn } from "@/app/volunteer/attendance/actions";

function getDhakaDateTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

export default async function VolunteerDashboard() {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify volunteer role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "VOLUNTEER") {
    redirect("/login");
  }

  // 3. Get volunteer record
  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id, status")
    .eq("profile_id", user.id)
    .single();

  // 4. Get current Dhaka date and time
  const dhaka = getDhakaDateTime();

  // 5. Get today's scheduled sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, session_type, session_date, start_time, end_time, location")
    .eq("session_date", dhaka.date)
    .eq("status", "SCHEDULED")
    .order("start_time");

  // 6. Get existing attendance records
  const { data: attendanceRecords } = volunteer
    ? await supabase
        .from("attendance")
        .select("session_id, status")
        .eq("volunteer_id", volunteer.id)
    : { data: [] };

  const attendanceMap = new Map(
    (attendanceRecords ?? []).map((record) => [
      record.session_id,
      record.status,
    ])
  );

  // 7. Get approved leave for today
  const { data: approvedLeaves } = volunteer
    ? await supabase
        .from("volunteer_leaves")
        .select("id")
        .eq("volunteer_id", volunteer.id)
        .eq("status", "APPROVED")
        .lte("start_date", dhaka.date)
        .gte("end_date", dhaka.date)
    : { data: [] };

  const isOnLeave = (approvedLeaves?.length ?? 0) > 0;

  // 8. Check which sessions are open for check-in
  const availableSessions = (sessions ?? []).map((session) => {
    const [hours, minutes] = session.start_time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;

    const isOpen =
      dhaka.minutes >= startMinutes &&
      dhaka.minutes < startMinutes + 360;

    return {
      ...session,
      isOpen,
      attendanceStatus: attendanceMap.get(session.id) ?? null,
    };
  });

  // 9. Dashboard cards
  const dashboardCards = [
    {
      title: "My Attendance",
      description: "View your attendance records.",
      href: "/volunteer/attendance",
      action: "View Attendance",
    },
    {
      title: "My Justifications",
      description: "Submit and track absence justifications.",
      href: "/volunteer/justifications",
      action: "View Justifications",
    },
    {
      title: "My Evaluations",
      description: "View your weekly and monthly performance evaluations.",
      href: "/volunteer/evaluations",
      action: "View Evaluations",
    },
    {
      title: "My Leave Applications",
      description: "Apply for leave and track your application status.",
      href: "/volunteer/leaves",
      action: "View Applications",
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
              <p className="eyebrow">Volunteer Portal</p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Volunteer Dashboard
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                Welcome, {profile.full_name}!
              </p>

              <p className="mt-1 text-xs text-muted/70">
                Stay updated with your activities and volunteer journey.
              </p>
            </div>

            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Notifications */}
        <NotificationList profileId={user.id} />

        {/* Today's Attendance Check-in */}
        <section
          aria-labelledby="checkin-heading"
          className="mt-8 rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-7"
        >
          <p className="eyebrow">Today's Session</p>

          <h2
            id="checkin-heading"
            className="mt-2 text-2xl font-semibold text-ink"
          >
            Attendance Check-in
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            If you are attending today's session, check in with one click.
          </p>

          {!volunteer || volunteer.status !== "ACTIVE" ? (
            <p className="mt-5 text-sm text-muted">
              Your active volunteer account is required for check-in.
            </p>
          ) : availableSessions.length === 0 ? (
            <p className="mt-5 rounded-xl bg-surface p-4 text-sm text-muted">
              No scheduled sessions today.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {availableSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-ink">
                        {session.session_type === "REGULAR"
                          ? "Regular Session"
                          : "Education Camp"}
                      </h3>

                      <p className="mt-1 text-sm text-muted">
                        {session.start_time.slice(0, 5)} –{" "}
                        {session.end_time.slice(0, 5)}
                      </p>

                      {session.location && (
                        <p className="mt-1 text-xs text-muted">
                          {session.location}
                        </p>
                      )}
                    </div>

                    {session.attendanceStatus === "PRESENT" ? (
                      <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                        You're checked in
                      </span>
                    ) : session.attendanceStatus === "ABSENT" ? (
                      <span className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800">
                        Attendance marked absent
                      </span>
                    ) : isOnLeave ? (
                      <span className="text-sm text-muted">
                        Approved leave
                      </span>
                    ) : session.isOpen ? (
                      <form action={volunteerCheckIn}>
                        <input
                          type="hidden"
                          name="session_id"
                          value={session.id}
                        />

                        <button
                          type="submit"
                          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                        >
                          I'm Here Today
                        </button>
                      </form>
                    ) : (
                      <span className="text-sm text-muted">
                        Check-in is not available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-muted/70">
            Check-in is available for six hours from the session start time.
          </p>
        </section>

        {/* Volunteer Services */}
        <section
          aria-labelledby="services-heading"
          className="mt-10"
        >
          <div className="mb-5">
            <p className="eyebrow">Your workspace</p>

            <h2
              id="services-heading"
              className="mt-2 text-2xl font-semibold text-ink"
            >
              My Activities
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Access your attendance, justifications and personal records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                aria-label={card.action}
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
                  {card.action}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-line py-6">
          <p className="text-center text-xs leading-5 text-muted/70">
            Tori School Volunteer Portal &#183; Volunteer Management System
          </p>
        </footer>
      </div>
    </main>
  );
}