import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import JobApplicationService from "@/services/jobApplication.service";
import JobPostService from "@/services/jobPost.service";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logger.info("apply-for-job request received");

    const formData = await req.formData();

    const jobPostId = formData.get("jobPostId") as string;
    const candidateName = formData.get("candidateName") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const candidatePhone = formData.get("candidatePhone") as string;
    const cvFile = formData.get("cvFile") as File;
    const coverLetter = formData.get("coverLetter") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;

    // Validate required fields
    if (!jobPostId || !candidateName || !candidateEmail || !cvFile) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (jobPostId, candidateName, candidateEmail, cvFile)",
        },
        { status: 400 },
      );
    }

    // Validate file type
    if (cvFile.type !== "application/pdf") {

      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (cvFile.size > MAX_FILE_SIZE) {

      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    // Extract PDF text
    let cvText = "";
    try {
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Try to extract text using pdf-parse
      try {
        // eslint-disable-next-line global-require
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");
        const pdfData = await pdfParse(buffer);
        cvText = (pdfData.text || "").trim();
      } catch (parseError) {
        logger.warn(
          "Primary PDF parsing method failed, attempting fallback:",
          parseError as Error,
        );

        // Fallback: Try alternative pdf-parse
        try {
          // eslint-disable-next-line global-require
          const pdf = require("pdf-parse");
          const result = await pdf(buffer);
          cvText = (result.text || "").trim();
        } catch (fallbackError) {
          logger.warn(
            "Fallback PDF parsing also failed:",
            fallbackError as Error,
          );
          // If both methods fail, proceed with empty CV text
          // The application will be created but ATS analysis will be limited
        }
      }

      // If we have CV text, great. If not, we'll proceed with empty text
      // This allows applications to go through even if PDF parsing fails
      logger.info("PDF extraction complete", { textLength: cvText.length });
    } catch (pdfError) {
      logger.warn("PDF extraction encountered an error:", pdfError as Error);
      // Non-fatal error - proceed with empty CV text
    }

    // Check if email already applied for this job
    const existingApplications = await JobApplicationService.getApplicationsByJobPost(jobPostId);
    const emailLower = candidateEmail.trim().toLowerCase();
    const emailAlreadyApplied = existingApplications.some(
      (app) => app.candidate_email?.toLowerCase() === emailLower,
    );

    if (emailAlreadyApplied) {
      return NextResponse.json(
        { error: "This email has already applied for this position" },
        { status: 409 },
      );
    }

    // Create application record
    const applicationId = nanoid();
    const application = await JobApplicationService.createApplication(
      applicationId,
      {
        job_post_id: jobPostId,
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail.trim().toLowerCase(),
        candidate_phone: candidatePhone?.trim(),
        cv_text: cvText,
        cover_letter: coverLetter?.trim(),
        linkedin_url: linkedinUrl?.trim(),
      },
    );

    if (!application) {

      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 },
      );
    }

    // Increment application count for the job post
    await JobPostService.incrementApplicationCount(jobPostId);

    // Trigger ATS scoring in background (don't wait for it)
    const baseUrl =
      process.env.NEXT_PUBLIC_LIVE_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/ats-score-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: applicationId,
        jobPostId: jobPostId,
      }),
    }).catch((error) => {
      logger.error("Error triggering ATS scoring:", error as Error);
    });

    logger.info("Job application created successfully", {
      id: applicationId,
    });

    return NextResponse.json(
      {
        response: {
          id: applicationId,
          message: "Application submitted successfully",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in apply-for-job route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
