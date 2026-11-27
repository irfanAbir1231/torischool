"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRecruitment(formData: FormData) {
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

  // 3. Get form data
  const title = String(formData.get("title") ?? "").trim();
  const opensAtInput = String(formData.get("opens_at") ?? "");
  const closesAtInput = String(formData.get("closes_at") ?? "");

  if (!title || !opensAtInput || !closesAtInput) {
    redirect("/admin/recruitment?error=missing_fields");
  }

  // 4. Interpret datetime-local values as Bangladesh time (UTC+6)
  const opensAt = new Date(`${opensAtInput}:00+06:00`);
  const closesAt = new Date(`${closesAtInput}:00+06:00`);

  if (
    Number.isNaN(opensAt.getTime()) ||
    Number.isNaN(closesAt.getTime()) ||
    closesAt <= opensAt
  ) {
    redirect("/admin/recruitment?error=invalid_dates");
  }

  // 5. Determine initial status
  const now = new Date();

  let status: "UPCOMING" | "OPEN" | "CLOSED";

  if (now < opensAt) {
    status = "UPCOMING";
  } else if (now >= closesAt) {
    status = "CLOSED";
  } else {
    status = "OPEN";
  }

  // 6. Insert into Supabase
  const { error } = await supabase
    .from("recruitment_periods")
    .insert({
      title,
      opens_at: opensAt.toISOString(),
      closes_at: closesAt.toISOString(),
      status,
    });

  if (error) {
    console.error("Recruitment creation error:", error.message);
    redirect("/admin/recruitment?error=creation_failed");
  }

  // 7. Refresh recruitment page
  revalidatePath("/admin/recruitment");

  redirect("/admin/recruitment?created=1");
}

export async function updateRecruitmentStatus(formData: FormData) {
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

  // 3. Get form data
  const recruitmentId = String(formData.get("recruitment_id") ?? "");
  const newStatus = String(formData.get("status") ?? "");

  if (!recruitmentId || !["OPEN", "CLOSED"].includes(newStatus)) {
    redirect("/admin/recruitment?error=invalid_status");
  }

  // 4. Fetch recruitment period
  const { data: recruitment, error: fetchError } = await supabase
    .from("recruitment_periods")
    .select("opens_at, closes_at")
    .eq("id", recruitmentId)
    .single();

  if (fetchError || !recruitment) {
    redirect("/admin/recruitment?error=recruitment_not_found");
  }

  // 5. Validate opening time
  const now = new Date();
  const opensAt = new Date(recruitment.opens_at);
  const closesAt = new Date(recruitment.closes_at);

  if (newStatus === "OPEN" && (now < opensAt || now >= closesAt)) {
    redirect("/admin/recruitment?error=outside_recruitment_dates");
  }

  // 6. Update status
  const { error: updateError } = await supabase
    .from("recruitment_periods")
    .update({ status: newStatus })
    .eq("id", recruitmentId);

  if (updateError) {
    console.error("Recruitment status update error:", updateError.message);
    redirect("/admin/recruitment?error=status_update_failed");
  }

  // 7. Refresh relevant pages
  revalidatePath("/admin/recruitment");
  revalidatePath("/");

  redirect("/admin/recruitment?updated=1");
}