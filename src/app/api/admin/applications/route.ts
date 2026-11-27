import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // 1. Verify the logged-in user
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Check the user's role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 3. Fetch applications using the admin client
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("volunteer_applications")
      .select(`
        id,
        full_name,
        email,
        phone,
        institution,
        department,
        motivation,
        experience,
        status,
        created_at,
        recruitment_period_id
      `)
      .eq("status", "SELECTED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Applications fetch error:", error.message);

      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // 4. Return the data
    return NextResponse.json({ applications: data });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}