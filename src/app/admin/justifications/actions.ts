"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reviewJustification(formData: FormData) {
  // 1. Verify authenticated user
  const supabase = await createClient();

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

  if (profileError || !profile || profile.role !== "ADMIN") {
    redirect("/login");
  }

  // 3. Get form values
  const itemId = formData.get("item_id")?.toString() || "";
  const decision = formData.get("decision")?.toString() || "";
  const comment = formData.get("admin_comment")?.toString().trim() || "";

  const pageUrl = "/admin/justifications";

  // 4. Validate input
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)
  ) {
    redirect(`${pageUrl}?error=invalid_item`);
  }

  if (!["APPROVED", "REJECTED", "NEEDS_INFORMATION"].includes(decision)) {
    redirect(`${pageUrl}?error=invalid_decision`);
  }

  if (comment.length > 1000) {
    redirect(`${pageUrl}?error=comment_too_long`);
  }

  if (decision === "NEEDS_INFORMATION" && !comment) {
    redirect(`${pageUrl}?error=comment_required`);
  }

  // 5. Fetch justification item
  const adminClient = createAdminClient();

  const { data: item, error: itemError } = await adminClient
    .from("justification_items")
    .select(`
      id,
      status,
      justification_id,
      weekly_justifications!inner (status)
    `)
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    redirect(`${pageUrl}?error=item_not_found`);
  }

  const form = Array.isArray(item.weekly_justifications)
    ? item.weekly_justifications[0]
    : item.weekly_justifications;

  if (form?.status !== "SUBMITTED") {
    redirect(`${pageUrl}?error=not_submitted`);
  }

  if (!["PENDING", "NEEDS_INFORMATION"].includes(item.status)) {
    redirect(`${pageUrl}?error=already_reviewed`);
  }

  // 6. Insert review record
  const { error: reviewError } = await adminClient
    .from("justification_reviews")
    .insert({
      justification_item_id: itemId,
      reviewed_by: user.id,
      decision,
      admin_comment: comment || null,
    });

  if (reviewError) {
    console.error("Justification review error:", reviewError);
    redirect(`${pageUrl}?error=review_failed`);
  }

  // 7. Save feedback for the volunteer
  const { error: responseError } = await adminClient
    .from("justification_items")
    .update({
      volunteer_response: comment || null,
      response_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (responseError) {
    console.error("Justification response error:", responseError);
    redirect(`${pageUrl}?error=response_failed`);
  }

  // 8. Refresh relevant pages
  revalidatePath(pageUrl);
  revalidatePath("/volunteer/justifications");
  revalidatePath("/volunteer/dashboard");

  redirect(`${pageUrl}?reviewed=1`);
}