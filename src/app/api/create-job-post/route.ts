import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import JobPostService from "@/services/jobPost.service";
import { logger } from "@/lib/logger";

function generateSlug(organizationName: string, jobTitle: string): string {
  const slug = `${organizationName}-${jobTitle}`
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug;
}

export async function POST(req: Request) {
  try {
    logger.info("create-job-post request received");

    const { userId } = auth();

    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      organizationName,
      organizationId,
      title,
      description,
      requirements,
      responsibilities,
      location,
      employmentType,
      salaryRange,
      interviewId,
    } = body;

    // Validate required fields
    if (
      !organizationId ||
      !title ||
      !description ||
      !requirements ||
      !responsibilities
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate ID and slug
    const jobPostId = nanoid();
    const readableSlug = generateSlug(organizationName || "job", title);

    // Create job post
    const jobPost = await JobPostService.createJobPost(jobPostId, {
      user_id: userId,
      organization_id: organizationId,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : [responsibilities],
      location,
      employment_type: employmentType,
      salary_range: salaryRange,
      interview_id: interviewId,
      readable_slug: readableSlug,
    });

    if (!jobPost) {

      return NextResponse.json(
        { error: "Failed to create job post" },
        { status: 500 },
      );
    }

    logger.info("Job post created successfully", { id: jobPostId });

    return NextResponse.json(
      { response: jobPost },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in create-job-post route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
