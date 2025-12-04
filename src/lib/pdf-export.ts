import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface AnalysisPDFData {
  candidateName: string;
  interviewName: string;
  interviewerName: string;
  respondentEmail?: string;
  respondentPhone?: string;
  overallScore: number;
  communicationScore: number;
  overallFeedback: string;
  communicationFeedback: string;
  questions?: Array<{
    question: string;
    summary: string;
  }>;
  softSkillSummary?: string;
  createdAt?: string;
  organizationName?: string;
  organizationLogo?: string;
}

export const generateAnalysisPDF = async (
  data: AnalysisPDFData,
  fileName: string = "interview-analysis.pdf",
) => {
  try {
    const element = document.createElement("div");
    element.innerHTML = generatePDFHTML(data);
    element.style.width = "800px";
    element.style.padding = "20px";
    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    document.body.removeChild(element);

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const generatePDFHTML = (data: AnalysisPDFData): string => {
  const scoreColor =
    data.overallScore >= 50
      ? "#22c55e"
      : data.overallScore >= 36
        ? "#f59e0b"
        : "#ef4444";

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <!-- Main Content -->
        <!-- Organization Header -->
        ${
          data.organizationName || data.organizationLogo
            ? `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
              ${
                data.organizationLogo
                  ? `<img src="${data.organizationLogo}" alt="Organization Logo" style="height: 40px; max-width: 150px; object-fit: contain;" />`
                  : ""
              }
              <div>
                ${data.organizationName ? `<p style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">${data.organizationName}</p>` : ""}
                <p style="margin: 0; font-size: 12px; color: #666;">Interview Analysis Report</p>
              </div>
            </div>
            `
            : ""
        }

        <!-- Header -->
        <div style="border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0 0 10px 0; color: #4F46E5; font-size: 24px;">
            Interview Analysis Report
          </h1>
          <p style="margin: 0; color: #666; font-size: 12px;">
            ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </p>
        </div>

      <!-- Candidate Information -->
      <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Candidate Information</h2>
        <table style="width: 100%; font-size: 13px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 30%; font-weight: bold;">Name</td>
            <td style="padding: 8px 0; color: #333;">${data.candidateName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Interview</td>
            <td style="padding: 8px 0; color: #333;">${data.interviewName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Interviewer</td>
            <td style="padding: 8px 0; color: #333;">${data.interviewerName}</td>
          </tr>
          ${data.respondentEmail ? `<tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Email</td>
            <td style="padding: 8px 0; color: #333;">${data.respondentEmail}</td>
          </tr>` : ""}
          ${data.createdAt ? `<tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Date</td>
            <td style="padding: 8px 0; color: #333;">${new Date(data.createdAt).toLocaleDateString()}</td>
          </tr>` : ""}
        </table>
      </div>

      <!-- Scores Section -->
      <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Performance Scores</h2>

        <!-- Overall Score -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: bold; color: #333; font-size: 14px;">Overall Score</span>
            <span style="font-size: 24px; font-weight: bold; color: ${scoreColor};">
              ${Math.round(data.overallScore)}/100
            </span>
          </div>
          <div style="width: 100%; height: 10px; background-color: #e5e7eb; border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${Math.min(data.overallScore, 100)}%; background-color: ${scoreColor}; border-radius: 5px;"></div>
          </div>
        </div>

        <!-- Communication Score -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: bold; color: #333; font-size: 14px;">Communication Score</span>
            <span style="font-size: 18px; font-weight: bold; color: ${scoreColor};">
              ${Math.round(data.communicationScore)}/10
            </span>
          </div>
          <div style="width: 100%; height: 10px; background-color: #e5e7eb; border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${Math.min(data.communicationScore * 10, 100)}%; background-color: ${scoreColor}; border-radius: 5px;"></div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Overall Feedback</h2>
        <p style="margin: 0; line-height: 1.6; color: #555; font-size: 13px; text-align: justify;">
          ${data.overallFeedback}
        </p>
      </div>

      <!-- Communication Feedback -->
      <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Communication Feedback</h2>
        <p style="margin: 0; line-height: 1.6; color: #555; font-size: 13px; text-align: justify;">
          ${data.communicationFeedback}
        </p>
      </div>

      ${
        data.softSkillSummary
          ? `
      <div style="background-color: #f9fafb; padding: 15px; margin-bottom: 25px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Soft Skills Summary</h2>
        <p style="margin: 0; line-height: 1.6; color: #555; font-size: 13px; text-align: justify;">
          ${data.softSkillSummary}
        </p>
      </div>
      `
          : ""
      }

      ${
        data.questions && data.questions.length > 0
          ? `
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Question Analysis</h2>
        ${data.questions
          .map(
            (q, idx) => `
          <div style="margin-bottom: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 13px; font-weight: bold;">
              Q${idx + 1}: ${q.question}
            </h3>
            <p style="margin: 0; line-height: 1.5; color: #555; font-size: 12px;">
              ${q.summary}
            </p>
          </div>
        `,
          )
          .join("")}
      </div>
      `
          : ""
      }

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #999;">
          <p>This is a confidential interview analysis report.</p>
          <p>Generated by WiseInterview © ${new Date().getFullYear()}</p>
        </div>
    </div>
  `;
};

export const downloadAnalysisPDF = async (
  element: HTMLElement,
  fileName: string = "interview-analysis.pdf",
) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};
