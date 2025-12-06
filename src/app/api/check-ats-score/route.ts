import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";
import { generateATSScorePrompt } from "@/lib/prompts/ats-score";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    logger.info("check-ats-score request received");

    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const cvFile = formData.get("cvFile") as File;
    const jobDescription = formData.get("jobDescription") as string;

    // Validate required fields
    if (!cvFile || !jobDescription) {
      return NextResponse.json(
        {
          error: "Missing required fields (cvFile, jobDescription)",
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
        }
      }

      logger.info("PDF extraction complete", { textLength: cvText.length });
    } catch (pdfError) {
      logger.warn("PDF extraction encountered an error:", pdfError as Error);
      // Non-fatal error - proceed with empty CV text
    }

    if (!cvText.trim()) {
      return NextResponse.json(
        { error: "Failed to extract text from PDF. Please ensure the PDF is readable and contains text." },
        { status: 400 },
      );
    }

    // Generate ATS scoring prompt with just job description (no specific requirements/responsibilities)
    // Parse job description to extract some structure
    const atsPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the CV provided against the job posting and provide a detailed scoring.

JOB POSTING:
${jobDescription}

CANDIDATE CV:
${cvText}

---

Now analyze this CV against the job requirements and provide a detailed JSON response with the following structure. Be objective and thorough in your analysis:

{
  "skills_match": {
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "match_percentage": 75
  },
  "experience_fit": {
    "years_of_experience": 5,
    "experience_match": "meets"
  },
  "qualification_match": {
    "relevant_qualifications": ["Bachelor's in Computer Science", "AWS Certification"],
    "missing_qualifications": ["Master's degree"],
    "match_percentage": 70
  },
  "keyword_relevance": {
    "job_specific_keywords": ["Python", "React", "Docker"],
    "missing_keywords": ["Kubernetes"],
    "relevance_score": 85
  },
  "strengths": ["Strong Python background", "React expertise", "Leadership experience"],
  "gaps": ["Limited Kubernetes experience", "No mentioned DevOps background"],
  "final_score": 82
}

IMPORTANT SCORING RULES:
- Skills Match: Compare candidate's skills with job requirements (35% weight of final score)
- Experience Fit: Check if candidate has required years of experience (25% weight)
- Qualification Match: Verify educational requirements and certifications (20% weight)
- Keyword Relevance: Check job description keywords present in CV (15% weight)
- Bonus: Up to 5 points for exceptional fit or specialized knowledge
- Final Score MUST be 0-100

Calculate the final_score as follows:
final_score = (skills_match.match_percentage × 0.35) + (experience_fit × 25) + (qualification_match × 20) + (keyword_relevance × 0.15) + bonus

Return ONLY valid JSON, no additional text.`;

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

    // Create analysis object
    const analysis = {
      score: finalScore,
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
        relevant_qualifications:
          analysisData.qualification_match?.relevant_qualifications || [],
        missing_qualifications:
          analysisData.qualification_match?.missing_qualifications || [],
        match_percentage: analysisData.qualification_match?.match_percentage || 0,
      },
      keyword_relevance: {
        job_specific_keywords:
          analysisData.keyword_relevance?.job_specific_keywords || [],
        missing_keywords:
          analysisData.keyword_relevance?.missing_keywords || [],
        relevance_score: analysisData.keyword_relevance?.relevance_score || 0,
      },
      strengths: analysisData.strengths || [],
      gaps: analysisData.gaps || [],
      final_score: finalScore,
    };

    logger.info("ATS scoring completed for manual check", {
      score: finalScore,
    });

    return NextResponse.json(
      {
        analysis,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in check-ats-score route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
