"use server";

import { createClient } from "@/lib/supabase/server";

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("profile_id", user.id)
    .eq("channel", "IN_APP");

  if (error) {
    console.error("Mark notification as read failed:", error);
    throw new Error("Failed to mark notification as read");
  }

  return { success: true };
}