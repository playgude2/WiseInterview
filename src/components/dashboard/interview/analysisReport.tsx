"use client";

import React from "react";
import { AnalysisPDFData } from "@/lib/pdf-export";

interface AnalysisReportProps {
  data: AnalysisPDFData;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

export const AnalysisReport = React.forwardRef<HTMLDivElement, AnalysisReportProps>(
  ({ data }, ref) => {
    const scoreColor =
      data.overallScore >= 50
        ? "#22c55e"
        : data.overallScore >= 36
          ? "#f59e0b"
          : "#ef4444";

    return (
      <div
        ref={ref}
        className="w-full bg-white p-8 text-gray-900"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="border-b-4 border-indigo-600 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">
            Interview Analysis Report
          </h1>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Candidate Information */}
        <div className="bg-gray-50 p-4 mb-8 rounded-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Candidate Information
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2 pr-4 text-gray-600 font-bold w-1/3">Name</td>
                <td className="py-2 text-gray-900">{data.candidateName}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-gray-600 font-bold">Interview</td>
                <td className="py-2 text-gray-900">{data.interviewName}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-gray-600 font-bold">Interviewer</td>
                <td className="py-2 text-gray-900">{data.interviewerName}</td>
              </tr>
              {data.respondentEmail && (
                <tr>
                  <td className="py-2 pr-4 text-gray-600 font-bold">Email</td>
                  <td className="py-2 text-gray-900">{data.respondentEmail}</td>
                </tr>
              )}
              {data.createdAt && (
                <tr>
                  <td className="py-2 pr-4 text-gray-600 font-bold">Date</td>
                  <td className="py-2 text-gray-900">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scores Section */}
        <div className="bg-gray-50 p-4 mb-8 rounded-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Performance Scores
          </h2>

          {/* Overall Score */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">Overall Score</span>
              <span
                className="text-2xl font-bold"
                style={{ color: scoreColor }}
              >
                {Math.round(data.overallScore)}/100
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(data.overallScore, 100)}%`,
                  backgroundColor: scoreColor,
                }}
              />
            </div>
          </div>

          {/* Communication Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">Communication Score</span>
              <span
                className="text-xl font-bold"
                style={{ color: scoreColor }}
              >
                {Math.round(data.communicationScore)}/10
              </span>
            </div>
            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(data.communicationScore * 10, 100)}%`,
                  backgroundColor: scoreColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-gray-50 p-4 mb-8 rounded-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Overall Feedback
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 text-justify">
            {data.overallFeedback}
          </p>
        </div>

        {/* Communication Feedback */}
        <div className="bg-gray-50 p-4 mb-8 rounded-lg">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Communication Feedback
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 text-justify">
            {data.communicationFeedback}
          </p>
        </div>

        {/* Soft Skills Summary */}
        {data.softSkillSummary && (
          <div className="bg-gray-50 p-4 mb-8 rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Soft Skills Summary
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 text-justify">
              {data.softSkillSummary}
            </p>
          </div>
        )}

        {/* Question Analysis */}
        {data.questions && data.questions.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Question Analysis
            </h2>
            <div className="space-y-6">
              {data.questions.map((q, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">
                    Q{idx + 1}: {q.question}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600">
                    {q.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 mt-8 pt-4 text-center text-xs text-gray-500">
          <p>This is a confidential interview analysis report.</p>
          <p>Generated by WiseInterview © {new Date().getFullYear()}</p>
        </div>
      </div>
    );
  },
);

AnalysisReport.displayName = "AnalysisReport";

export default AnalysisReport;
