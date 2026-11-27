import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type CreateNotificationInput = {
  profileId: string;
  title: string;
  message: string;
  notificationType: string;
  dedupeKey?: string;
};

export async function createInAppNotification({
  profileId,
  title,
  message,
  notificationType,
  dedupeKey,
}: CreateNotificationInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      profile_id: profileId,
      title,
      message,
      notification_type: notificationType,
      channel: "IN_APP",
      status: "SENT",
      sent_at: new Date().toISOString(),
      dedupe_key: dedupeKey ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Check whether this notification already exists
    if (error.code === "23505" && dedupeKey) {
      const { data: existingNotification, error: lookupError } =
        await supabase
          .from("notifications")
          .select("id")
          .eq("dedupe_key", dedupeKey)
          .single();

      if (lookupError || !existingNotification) {
        console.error("Duplicate notification lookup failed:", lookupError);
        throw new Error("Failed to retrieve existing notification");
      }

      return existingNotification;
    }

    console.error("Notification creation failed:", error);
    throw new Error("Failed to create notification");
  }

  return data;
}