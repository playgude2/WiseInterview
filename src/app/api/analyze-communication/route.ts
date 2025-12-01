import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    const geminiResponse = await callGeminiJSON([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: getCommunicationAnalysisPrompt(transcript),
      },
    ]);

    const jsonContent = extractJSONFromResponse(geminiResponse);

    logger.info("Communication analysis completed successfully");

    return NextResponse.json(
      { analysis: JSON.parse(jsonContent || "{}") },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error analyzing communication skills");

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
