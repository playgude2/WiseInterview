import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import JobApplicationService from "@/services/jobApplication.service";
import JobPostService from "@/services/jobPost.service";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logger.info("get-job-applications request received");

    const { userId } = auth();

    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { jobPostId, organizationId } = body;

    if (!jobPostId && !organizationId) {
      return NextResponse.json(
        { error: "Missing required parameters (jobPostId or organizationId)" },
        { status: 400 },
      );
    }

    let applications: any[] = [];

    if (jobPostId) {
      // Verify ownership of job post
      const jobPost = await JobPostService.getJobPostById(jobPostId);

      if (!jobPost || jobPost.user_id !== userId) {

        return NextResponse.json(
          { error: "Unauthorized to access this job post" },
          { status: 403 },
        );
      }

      // Get applications for this job post
      applications =
        await JobApplicationService.getApplicationsByJobPost(jobPostId);
    } else if (organizationId) {
      // Get all applications for organization
      applications =
        await JobApplicationService.getApplicationsByOrganization(
          organizationId,
        );
    }

    logger.info("Job applications retrieved", {
      count: applications.length,
    });

    return NextResponse.json(
      { applications },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in get-job-applications route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
