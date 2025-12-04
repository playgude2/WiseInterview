import { logger } from "@/lib/logger";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";
import { Question } from "@/types/interview";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  logger.info("reanalyze-response request received");

  try {
    const body = await req.json();
    const { callId, interviewId } = body;

    if (!callId || !interviewId) {
      return NextResponse.json(
        { error: "callId and interviewId are required" },
        { status: 400 },
      );
    }

    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (!response || !interview) {
      return NextResponse.json(
        { error: "Response or interview not found" },
        { status: 404 },
      );
    }

    const transcript = response.details?.transcript;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 400 },
      );
    }

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const prompt = getInterviewAnalyticsPrompt(
      transcript,
      mainInterviewQuestions,
    );

    const geminiResponse = await callGeminiJSON([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const jsonContent = extractJSONFromResponse(geminiResponse);
    const analyticsResponse = JSON.parse(jsonContent);

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    // Update the response with new analytics
    await ResponseService.saveResponse(
      {
        analytics: analyticsResponse,
      },
      callId,
    );

    logger.info("Response re-analyzed successfully");

    return NextResponse.json(
      {
        success: true,
        analytics: analyticsResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(
      `Error re-analyzing response: ${error instanceof Error ? error.message : String(error)}`,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
