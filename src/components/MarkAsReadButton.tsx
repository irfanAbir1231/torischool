"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "@/app/notifications/actions";

type MarkAsReadButtonProps = {
  notificationId: string;
};

export default function MarkAsReadButton({
  notificationId,
}: MarkAsReadButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleMarkAsRead() {
    setError("");

    startTransition(async () => {
      try {
        await markNotificationAsRead(notificationId);
        router.refresh();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        setError("Could not update notification. Please try again.");
      }
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleMarkAsRead}
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex min-h-9 items-center justify-center rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Mark as Read"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}