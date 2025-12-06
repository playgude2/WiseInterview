import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organizationId" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const { data, error } = await supabase
      .from("organization")
      .select("id, name, image_url")
      .eq("id", organizationId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { organization: data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching organization:", error);

    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 },
    );
  }
}
