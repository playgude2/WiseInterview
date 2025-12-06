import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import JobApplicationService from "@/services/jobApplication.service";
import JobPostService from "@/services/jobPost.service";
import { logger } from "@/lib/logger";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function generateShortlistEmailHTML(
  candidateName: string,
  jobTitle: string,
  atsScore: number,
  organizationName?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .congratulations { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
          .score-badge { background: #10b981; color: white; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .score-badge .score-number { font-size: 32px; font-weight: bold; }
          .score-badge .score-text { font-size: 14px; opacity: 0.9; }
          .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .next-steps h3 { margin-top: 0; color: #1f2937; }
          .next-steps ul { margin: 0; padding-left: 20px; }
          .next-steps li { margin: 10px 0; color: #4b5563; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Great News! 🎉</h1>
            <p>Your application has been shortlisted</p>
          </div>
          <div class="content">
            <p class="congratulations">Hi <strong>${candidateName}</strong>,</p>
            <p>We're excited to inform you that your application for the <strong>${jobTitle}</strong> position${organizationName ? ` at <strong>${organizationName}</strong>` : ""} has impressed our team!</p>

            <div class="score-badge">
              <div class="score-text">Your Application Score</div>
              <div class="score-number">${atsScore}%</div>
              <div class="score-text">Strong Match</div>
            </div>

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ul>
                <li>A member of our recruitment team will contact you within 2-3 business days</li>
                <li>We'll discuss the role details and answer any questions you may have</li>
                <li>If everything looks good, we'll move forward with the interview process</li>
              </ul>
            </div>

            <p>In the meantime, feel free to explore more about the role and our company. We're looking forward to speaking with you soon!</p>

            <p>Best regards,<br>The Recruitment Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${organizationName || "WiseInterview"}. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(req: Request) {
  try {
    logger.info("shortlist-candidate request received");

    const { userId } = auth();

    if (!userId) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Missing required field (applicationId)" },
        { status: 400 },
      );
    }

    // Fetch application
    const application =
      await JobApplicationService.getApplicationById(applicationId);

    if (!application) {

      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Fetch job post to verify ownership
    const jobPost = await JobPostService.getJobPostById(
      application.job_post_id,
    );

    if (!jobPost || jobPost.user_id !== userId) {

      return NextResponse.json(
        { error: "Unauthorized to shortlist this application" },
        { status: 403 },
      );
    }

    // Mark as shortlisted
    const updatedApplication =
      await JobApplicationService.shortlistApplication(applicationId);

    if (!updatedApplication) {

      return NextResponse.json(
        { error: "Failed to shortlist application" },
        { status: 500 },
      );
    }

    // Send shortlist email
    if (resend) {
      const emailContent = generateShortlistEmailHTML(
        application.candidate_name,
        jobPost.title,
        application.ats_score || 0,
        jobPost.organization_id,
      );

      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: application.candidate_email,
          subject: `Great News: You've Been Shortlisted for ${jobPost.title}`,
          html: emailContent,
        });

        logger.info("Shortlist email sent", {
          applicationId,
          email: application.candidate_email,
        });
      } catch (emailError) {
        logger.error("Error sending shortlist email:", emailError as Error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      {
        response: {
          message: "Candidate shortlisted successfully",
          application: updatedApplication,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error in shortlist-candidate route:", error as Error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
