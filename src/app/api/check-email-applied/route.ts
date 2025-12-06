import { NextResponse } from "next/server";
import JobApplicationService from "@/services/jobApplication.service";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logger.info("check-email-applied request received");

    const body = await req.json();
    const { jobPostId, candidateEmail } = body;

    if (!jobPostId || !candidateEmail) {
      return NextResponse.json(
        {
          error: "Missing required fields (jobPostId, candidateEmail)",
        },
        { status: 400 },
      );
    }

    // Get all applications for this job post
    const applications = await JobApplicationService.getApplicationsByJobPost(
      jobPostId,
    );

    // Check if email already applied (case-insensitive)
    const emailLower = candidateEmail.trim().toLowerCase();
    const alreadyApplied = applications.some(
      (app) => app.candidate_email?.toLowerCase() === emailLower,
    );

    logger.info("Email application check completed", {
      jobPostId,
      alreadyApplied,
    });

    return NextResponse.json(
      { alreadyApplied },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in check-email-applied route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
