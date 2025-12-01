import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";
import { callGeminiJSON, extractJSONFromResponse } from "@/services/gemini.service";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("generate-interview-questions request received");
  const body = await req.json();

  try {
    const geminiResponse = await callGeminiJSON([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: generateQuestionsPrompt(body),
      },
    ]);

    const jsonContent = extractJSONFromResponse(geminiResponse);

    logger.info("Interview questions generated successfully");

    return NextResponse.json(
      {
        response: jsonContent,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error generating interview questions");

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
