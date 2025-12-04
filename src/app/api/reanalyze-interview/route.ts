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
  logger.info("reanalyze-interview request received");

  try {
    const body = await req.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId is required" },
        { status: 400 },
      );
    }

    const allResponses = await ResponseService.getAllResponses(interviewId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 },
      );
    }

    if (!allResponses || allResponses.length === 0) {
      return NextResponse.json(
        { message: "No responses found for this interview", reanalyzedCount: 0 },
        { status: 200 },
      );
    }

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    let reanalyzedCount = 0;
    const reanalyzedResponses = [];

    for (const response of allResponses) {
      try {
        const transcript = response.details?.transcript;

        if (!transcript) {
          logger.warn(`Skipping response ${response.call_id}: no transcript`);
          continue;
        }

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
          response.call_id,
        );

        reanalyzedCount++;
        reanalyzedResponses.push({
          callId: response.call_id,
          name: response.name,
          newScore: analyticsResponse.overallScore,
        });

        logger.info(
          `Response ${response.call_id} re-analyzed with new score: ${analyticsResponse.overallScore}`,
        );
      } catch (error) {
        logger.error(
          `Error re-analyzing response ${response.call_id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    logger.info(`Re-analyzed ${reanalyzedCount} responses for interview ${interviewId}`);

    return NextResponse.json(
      {
        success: true,
        reanalyzedCount,
        reanalyzedResponses,
        message: `Successfully re-analyzed ${reanalyzedCount} responses with new scoring validation rules`,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(
      `Error re-analyzing interview: ${error instanceof Error ? error.message : String(error)}`,
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
