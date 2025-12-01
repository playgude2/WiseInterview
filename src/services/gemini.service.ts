import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

interface Message {
  role: "user" | "system";
  content: string;
}

/**
 * Call Google Gemini API with messages and return JSON response
 * System role content is prepended to the first user message
 */
export async function callGeminiJSON(
  messages: Message[],
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert system + user messages to Gemini format
    let systemPrompt = "";
    const userMessages: Message[] = [];

    messages.forEach((msg) => {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        userMessages.push(msg);
      }
    });

    // Combine system prompt with first user message
    let finalContent = userMessages[0]?.content || "";
    if (systemPrompt) {
      finalContent = `${systemPrompt}\n\n${finalContent}`;
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: finalContent,
            },
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

/**
 * Helper to extract JSON from Gemini response
 * Handles cases where JSON might be wrapped in markdown code blocks
 */
export function extractJSONFromResponse(response: string): string {
  // Try to find JSON block in markdown code fence
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // If no code fence, try to find JSON object directly
  const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    return jsonObjectMatch[0];
  }

  // Return as-is if no JSON found
  return response;
}
