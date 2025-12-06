import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import JobPostService from "@/services/jobPost.service";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";
import { generateATSScorePrompt } from "@/lib/prompts/ats-score";
import { logger } from "@/lib/logger";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { ATSAnalysis } from "@/types/jobPost";

export async function POST(req: Request) {
  try {
    logger.info("manual-ats-check request received");

    const { userId } = auth();

    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const jobPostId = formData.get("jobPostId") as string;
    const cvFile = formData.get("cvFile") as File;

    // Validate required fields
    if (!jobPostId || !cvFile) {
      return NextResponse.json(
        { error: "Missing required fields (jobPostId, cvFile)" },
        { status: 400 },
      );
    }

    // Fetch job post
    const jobPost = await JobPostService.getJobPostById(jobPostId);

    if (!jobPost || jobPost.user_id !== userId) {

      return NextResponse.json(
        { error: "Unauthorized to perform ATS check for this job" },
        { status: 403 },
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
      const loader = new PDFLoader(cvFile);
      const docs = await loader.load();
      cvText = docs.map((doc) => doc.pageContent).join("\n");

      if (!cvText.trim()) {

        return NextResponse.json(
          { error: "Could not extract text from PDF" },
          { status: 400 },
        );
      }
    } catch (pdfError) {
      logger.error("Error parsing PDF:", pdfError as Error);

      return NextResponse.json(
        { error: "Failed to parse PDF file" },
        { status: 400 },
      );
    }

    // Generate ATS scoring prompt
    const atsPrompt = generateATSScorePrompt(
      jobPost.title,
      jobPost.description,
      jobPost.requirements,
      jobPost.responsibilities,
      cvText,
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

    logger.info("Manual ATS check completed", {
      jobPostId,
      score: finalScore,
    });

    return NextResponse.json(
      {
        response: {
          score: finalScore,
          analysis: atsAnalysis,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in manual-ats-check route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
