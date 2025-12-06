"use client";

import React, { useState, useCallback } from "react";
import Modal from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import axios from "axios";

interface ApplyModalProps {
  jobPostId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyModal({
  jobPostId,
  jobTitle,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    coverLetter: "",
    linkedinUrl: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; jobTitle: string } | null>(null);
  const [emailAlreadyApplied, setEmailAlreadyApplied] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.candidateName.trim()) {
      toast.error("Name is required");

      return false;
    }

    if (!formData.candidateEmail.trim()) {
      toast.error("Email is required");

      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.candidateEmail)) {
      toast.error("Please enter a valid email address");

      return false;
    }

    if (!cvFile) {
      toast.error("Please upload your CV (PDF)");

      return false;
    }

    return true;
  };

  const checkEmailAlreadyApplied = async (): Promise<boolean> => {
    try {
      setCheckingEmail(true);
      const response = await axios.post("/api/check-email-applied", {
        jobPostId,
        candidateEmail: formData.candidateEmail.trim().toLowerCase(),
      });

      const { alreadyApplied } = response.data;

      if (alreadyApplied) {
        setEmailAlreadyApplied(true);
        setShowDuplicateModal(true);

        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      // Allow applications to proceed if email check fails (endpoint may not be available yet)
      // In production, you'd want to handle this differently

      return true;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already applied for this job
      const emailNotApplied = await checkEmailAlreadyApplied();

      if (!emailNotApplied) {
        setIsLoading(false);

        return;
      }

      const submissionFormData = new FormData();
      submissionFormData.append("jobPostId", jobPostId);
      submissionFormData.append("candidateName", formData.candidateName.trim());
      submissionFormData.append(
        "candidateEmail",
        formData.candidateEmail.trim().toLowerCase(),
      );
      submissionFormData.append("candidatePhone", formData.candidatePhone.trim());
      submissionFormData.append("coverLetter", formData.coverLetter.trim());
      submissionFormData.append("linkedinUrl", formData.linkedinUrl.trim());
      if (cvFile) {
        submissionFormData.append("cvFile", cvFile);
      }

      console.log("Submitting application...");
      const response = await axios.post("/api/apply-for-job", submissionFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Application submitted successfully:", response.data);

      // Show success modal
      const candidateName = formData.candidateName.trim();
      console.log("Setting success modal with:", { candidateName, jobTitle });

      setSubmittedData({
        name: candidateName,
        jobTitle: jobTitle,
      });

      setShowSuccessModal(true);

      // Clear form
      setFormData({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        coverLetter: "",
        linkedinUrl: "",
      });
      setCvFile(null);
    } catch (error: any) {
      console.error("Error submitting application:", error);

      // Handle duplicate email error (409 status)
      if (error.response?.status === 409) {
        setEmailAlreadyApplied(true);
        setShowDuplicateModal(true);
        setIsLoading(false);

        return;
      }

      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to submit application";
      toast.error(errorMessage, {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showDuplicateModal) {
    return (
      <Modal closeOnOutsideClick={false} open={true} onClose={onClose}>
        <div className="w-[40rem] flex flex-col items-center justify-center py-12">
          {/* Warning Icon */}
          <div className="mb-6 w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Application Already Submitted
          </h2>

          {/* Message */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 mb-8 w-full">
            <p className="text-gray-700 text-center">
              The email address <span className="font-semibold">{formData.candidateEmail.trim().toLowerCase()}</span> has already submitted an application for this position.
            </p>
            <p className="text-gray-600 text-center mt-3 text-sm">
              You can only apply once per email address per job posting.
            </p>
          </div>

          {/* Info Text */}
          <p className="text-gray-600 text-center mb-8">
            If you believe this is an error or would like to update your application, please contact us.
          </p>

          {/* Close Button */}
          <Button
            className="bg-indigo-600 hover:bg-indigo-800 w-full"
            onClick={() => {
              setShowDuplicateModal(false);
              setEmailAlreadyApplied(false);
            }}
          >
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  if (showSuccessModal && submittedData) {
    return (
      <Modal closeOnOutsideClick={false} open={true} onClose={onClose}>
        <div className="w-[40rem] flex flex-col items-center justify-center py-12">
          {/* Success Icon */}
          <div className="mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Application Submitted!
          </h2>

          {/* Details */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-8 w-full">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Candidate Name</p>
                <p className="text-lg font-semibold text-gray-900">{submittedData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Position Applied For</p>
                <p className="text-lg font-semibold text-indigo-600">{submittedData.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Job ID</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">{jobPostId}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <p className="text-gray-600 text-center mb-8">
            Thank you for your application! We&apos;ve received your submission and will review it shortly. You&apos;ll hear from us soon.
          </p>

          {/* Close Button */}
          <Button
            className="bg-indigo-600 hover:bg-indigo-800 w-full"
            onClick={() => {
              setShowSuccessModal(false);
              onClose();
              // Trigger callback after modal is dismissed to refresh job data
              if (onSuccess) {
                console.log("Calling onSuccess callback after success modal closed");
                onSuccess();
              }
            }}
          >
            Back to Career Page
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal closeOnOutsideClick={false} open={true} onClose={onClose}>
      <div className="w-[50rem] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
          <p className="text-gray-600 text-sm mt-1">{jobTitle}</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="candidateName"
              value={formData.candidateName}
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={handleInputChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="candidateEmail"
              value={formData.candidateEmail}
              placeholder="john@example.com"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={handleInputChange}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="candidatePhone"
              value={formData.candidatePhone}
              placeholder="+12024280523"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={handleInputChange}
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CV (PDF) *
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-600 transition-colors disabled:opacity-50"
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
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 font-medium">
                    Drag and drop your CV here or click to select
                  </p>
                  <p className="text-gray-500 text-sm mt-1">PDF format, max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              placeholder="Tell us why you're a great fit for this role..."
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={handleInputChange}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile (Optional)
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50"
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-800"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
