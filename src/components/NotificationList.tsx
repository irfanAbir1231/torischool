import { createClient } from "@/lib/supabase/server";
import MarkAsReadButton from "@/components/MarkAsReadButton";

type NotificationListProps = {
  profileId: string;
};

export default async function NotificationList({
  profileId,
}: NotificationListProps) {
  const supabase = await createClient();

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, title, message, notification_type, is_read, created_at")
    .eq("profile_id", profileId)
    .eq("channel", "IN_APP")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Notification fetch error:", error);

    return (
      <section
        aria-labelledby="notifications-heading"
        className="mt-8 rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-6"
      >
        <h2
          id="notifications-heading"
          className="text-xl font-semibold text-ink"
        >
          Notifications
        </h2>

        <p role="alert" className="mt-3 text-sm text-red-700">
          Failed to load notifications. Please try again later.
        </p>
      </section>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <section
      aria-labelledby="notifications-heading"
      className="mt-8 rounded-2xl border border-line bg-cream p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Updates</p>

          <h2
            id="notifications-heading"
            className="mt-2 text-xl font-semibold text-ink"
          >
            Notifications
          </h2>

          <p className="mt-1 text-sm text-muted">
            Your latest account updates and activities.
          </p>
        </div>

        <span
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-ink"
          aria-label={`${unreadCount} unread notifications`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              unreadCount > 0 ? "bg-accent-strong" : "bg-muted/40"
            }`}
          />
          {unreadCount} Unread
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-white/60 px-5 py-10 text-center">
          <p className="text-base font-semibold text-ink">
            You are all caught up!
          </p>

          <p className="mt-2 text-sm text-muted">
            You have no notifications yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border p-4 transition-colors sm:p-5 ${
                notification.is_read
                  ? "border-line bg-white"
                  : "border-accent/40 bg-accent/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.is_read
                      ? "bg-muted/30"
                      : "bg-accent-strong"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-ink">
                      {notification.title}
                    </h3>

                    {!notification.is_read && (
                      <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">
                    {notification.message}
                  </p>

                  {!notification.is_read && (
                    <MarkAsReadButton
                      notificationId={notification.id}
                    />
                  )}

                  <p className="mt-3 text-xs text-muted/70">
                    {new Date(notification.created_at).toLocaleString(
                      "en-GB",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Asia/Dhaka",
                      }
                    )}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}