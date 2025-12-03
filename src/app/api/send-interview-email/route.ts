import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    if (!resend) {

      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { candidateName, candidateEmail, interviewLink, interviewName } =
      body;

    if (!candidateName || !candidateEmail || !interviewLink) {

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract base URL from interview link
    const baseUrl = process.env.NEXT_PUBLIC_LIVE_URL;
    const fullLink = `${baseUrl}${interviewLink}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; }
            .button:hover { background: #4338ca; }
            .link-box { background: #f3f4f6; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .highlight { color: #4f46e5; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited to an Interview</h1>
            </div>
            <div class="content">
              <p>Hello <span class="highlight">${candidateName}</span>,</p>

              <p>We're excited to invite you to participate in an interview for the following position:</p>

              <p style="background: #f0f4ff; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px; margin: 20px 0;">
                <strong>${interviewName}</strong>
              </p>

              <p>Please click the button below to access your interview:</p>

              <div style="text-align: center;">
                <a href="${fullLink}" class="button">Start Interview</a>
              </div>

              <p>Or copy and paste this link in your browser:</p>
              <div class="link-box">${fullLink}</div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Interview Details:</strong><br>
                • Position: ${interviewName}<br>
                • This interview can be completed at your convenience<br>
                • Make sure you have a quiet environment and working microphone
              </p>

              <p style="margin-top: 20px; font-size: 13px; color: #999;">
                If you have any questions or encounter any issues, please don't hesitate to reach out.
              </p>

              <div class="footer">
                <p>© 2024 Wise Interview. All rights reserved.</p>
                <p>This is an automated email. Please do not reply directly to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: candidateEmail,
      subject: `Interview Invitation - ${interviewName}`,
      html: emailHtml,
    });

    if (response.error) {
      console.error("Resend error:", response.error);

      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
