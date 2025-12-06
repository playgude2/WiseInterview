"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, X, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ATSResult {
  score: number;
  skills_match: {
    matched_skills: string[];
    missing_skills: string[];
    match_percentage: number;
  };
  experience_fit: {
    years_of_experience: number;
    experience_match: "below" | "meets" | "exceeds";
  };
  qualification_match: {
    relevant_qualifications: string[];
    missing_qualifications: string[];
    match_percentage: number;
  };
  keyword_relevance: {
    job_specific_keywords: string[];
    missing_keywords: string[];
    relevance_score: number;
  };
  strengths: string[];
  gaps: string[];
  final_score: number;
}

export default function ATSCheckPage() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted");

        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");

        return;
      }

      setCvFile(file);
      toast.success("CV uploaded successfully");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleCheckATS = async () => {
    if (!cvFile) {
      toast.error("Please upload your CV");

      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");

      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("cvFile", cvFile);
      formData.append("jobDescription", jobDescription.trim());

      const response = await axios.post("/api/check-ats-score", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data.analysis);
      toast.success("ATS analysis completed!");
    } catch (error: any) {
      console.error("Error checking ATS score:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to analyze resume";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) {
      return "bg-green-100 text-green-800";
    }
    if (score >= 70) {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-indigo-600" size={32} />
          <h1 className="text-4xl font-bold text-gray-900">ATS Check</h1>
        </div>
        <p className="text-gray-600">
          Upload your resume and job description to get an instant ATS score
          and detailed analysis
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Upload Your Resume
            </h2>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-600 transition-colors"
              style={{
                pointerEvents: isLoading ? "none" : "auto",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <input {...getInputProps()} disabled={isLoading} />
              {cvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-green-600 font-medium">✓</span>
                  <span className="text-gray-700">{cvFile.name}</span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCvFile(null);
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-700 font-medium">
                    Drag and drop your resume here or click to select
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    PDF format, max 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              placeholder="Paste the job description here. Include job requirements, responsibilities, and desired qualifications..."
              disabled={isLoading}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <Button
            disabled={isLoading || !cvFile || !jobDescription.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3"
            onClick={handleCheckATS}
          >
            {isLoading ? "Analyzing..." : "Check ATS Score"}
          </Button>
        </div>

        {result && (
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  ATS Score
                </p>
                <div className={`px-4 py-3 rounded-lg font-bold text-center ${getScoreColor(result.final_score)}`}>
                  <div className="text-3xl">{Math.round(result.final_score)}%</div>
                  <div className="text-xs mt-1">Overall Match</div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Skills Match
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${result.skills_match?.match_percentage || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.skills_match?.match_percentage || 0}%
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Qualifications Match
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${result.qualification_match?.match_percentage || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.qualification_match?.match_percentage || 0}%
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Keyword Relevance
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${result.keyword_relevance?.relevance_score || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.keyword_relevance?.relevance_score || 0}%
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Experience Fit
                  </p>
                  <p className="text-sm capitalize text-gray-900 font-medium">
                    {result.experience_fit?.experience_match || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {result.experience_fit?.years_of_experience || 0} years detected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {result.skills_match?.matched_skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills_match.matched_skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.skills_match?.missing_skills?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills_match.missing_skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800 font-medium"
                    >
                      ✗ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.qualification_match?.relevant_qualifications?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Relevant Qualifications
              </h3>
              <ul className="space-y-2">
                {result.qualification_match.relevant_qualifications.map(
                  (qual: string) => (
                    <li
                      key={qual}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      {qual}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {result.qualification_match?.missing_qualifications?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Missing Qualifications
              </h3>
              <ul className="space-y-2">
                {result.qualification_match.missing_qualifications.map(
                  (qual: string) => (
                    <li
                      key={qual}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-red-600 font-bold mt-1">✗</span>
                      {qual}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {result.strengths?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength: string) => (
                    <li
                      key={strength}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-indigo-600 font-bold mt-1">→</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.gaps?.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {result.gaps.map((gap: string) => (
                    <li
                      key={gap}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-yellow-600 font-bold mt-1">!</span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {result.keyword_relevance?.job_specific_keywords?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detected Keywords from Job Description
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keyword_relevance.job_specific_keywords.map(
                  (keyword: string) => (
                    <span
                      key={keyword}
                      className="rounded bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                    >
                      {keyword}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
