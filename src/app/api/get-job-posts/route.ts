import { NextResponse } from "next/server";
import JobPostService from "@/services/jobPost.service";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    logger.info("get-job-posts request received");

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const type = searchParams.get("type") || "public"; // "public" or "org"

    if (type === "public") {
      // Get all public job posts
      const jobPosts = await JobPostService.getPublicJobPosts();

      return NextResponse.json(
        { response: jobPosts },
        { status: 200 },
      );
    } else if (type === "org" && organizationId) {
      // Get organization's job posts (requires org context)
      const jobPosts = await JobPostService.getAllJobPosts(
        undefined,
        organizationId,
      );

      return NextResponse.json(
        { response: jobPosts },
        { status: 200 },
      );
    } else {

      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }
  } catch (error) {
    logger.error("Error in get-job-posts route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
