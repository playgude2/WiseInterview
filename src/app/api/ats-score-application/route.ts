import { NextResponse } from "next/server";
import JobApplicationService from "@/services/jobApplication.service";
import JobPostService from "@/services/jobPost.service";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";
import { generateATSScorePrompt } from "@/lib/prompts/ats-score";
import { logger } from "@/lib/logger";
import { ATSAnalysis } from "@/types/jobPost";

export async function POST(req: Request) {
  try {
    logger.info("ats-score-application request received");

    const body = await req.json();

    const { applicationId, jobPostId } = body;

    // Validate required fields
    if (!applicationId || !jobPostId) {
      return NextResponse.json(
        { error: "Missing required fields (applicationId, jobPostId)" },
        { status: 400 },
      );
    }

    // Fetch application and job post
    const application =
      await JobApplicationService.getApplicationById(applicationId);
    const jobPost = await JobPostService.getJobPostById(jobPostId);

    if (!application || !jobPost) {

      return NextResponse.json(
        { error: "Application or job post not found" },
        { status: 404 },
      );
    }

    // Generate ATS scoring prompt
    const atsPrompt = generateATSScorePrompt(
      jobPost.title,
      jobPost.description,
      jobPost.requirements,
      jobPost.responsibilities,
      application.cv_text,
    );

    // Call Gemini API for ATS scoring
    const geminiResponse = await callGeminiJSON([
      {
        role: "user",
        content: atsPrompt,
      },
    ]);

    // Extract JSON from response
    const jsonStr = extractJSONFromResponse(geminiResponse);
    const analysisData = JSON.parse(jsonStr);

    // Ensure final_score is a number
    const finalScore = Math.round(analysisData.final_score || 0);

    // Create proper ATSAnalysis object
    const atsAnalysis: ATSAnalysis = {
      skills_match: {
        matched_skills: analysisData.skills_match?.matched_skills || [],
        missing_skills: analysisData.skills_match?.missing_skills || [],
        match_percentage: analysisData.skills_match?.match_percentage || 0,
      },
      experience_fit: {
        years_of_experience:
          analysisData.experience_fit?.years_of_experience || 0,
        experience_match: analysisData.experience_fit?.experience_match || "unknown",
      },
      qualification_match: {
        qualifications_found:
          analysisData.qualification_match?.qualifications_found || [],
        match_status: analysisData.qualification_match?.match_status || "",
      },
      keyword_relevance: {
        keywords_matched:
          analysisData.keyword_relevance?.keywords_matched || [],
        keyword_density: analysisData.keyword_relevance?.keyword_density || 0,
      },
      overall_fit: analysisData.overall_fit || "",
      strengths: analysisData.strengths || [],
      gaps: analysisData.gaps || [],
      final_score: finalScore,
    };

    // Update application with ATS score and analysis
    const updatedApplication =
      await JobApplicationService.updateATSScore(
        applicationId,
        finalScore,
        atsAnalysis,
      );

    if (!updatedApplication) {

      return NextResponse.json(
        { error: "Failed to update application with ATS score" },
        { status: 500 },
      );
    }

    // If auto-shortlisted (score >= 85), send email
    if (finalScore >= 85 && updatedApplication.is_shortlisted) {
      const baseUrl =
        process.env.NEXT_PUBLIC_LIVE_URL || "http://localhost:3000";
      fetch(`${baseUrl}/api/send-shortlist-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: application.candidate_name,
          candidateEmail: application.candidate_email,
          jobTitle: jobPost.title,
          applicationId: applicationId,
          atsScore: finalScore,
        }),
      }).catch((error) => {
        logger.error("Error sending shortlist email:", error as Error);
      });
    }

    logger.info("ATS scoring completed", {
      applicationId,
      score: finalScore,
    });

    return NextResponse.json(
      {
        response: {
          score: finalScore,
          analysis: atsAnalysis,
          isShortlisted: updatedApplication.is_shortlisted,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in ats-score-application route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
