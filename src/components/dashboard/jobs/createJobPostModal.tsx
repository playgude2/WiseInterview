"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useJobPosts } from "@/contexts/jobPost.context";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

function CreateJobPostModal({ onClose }: Props) {
  const { createJobPost } = useJobPosts();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    employmentType: "full-time",
    salaryRange: "",
  });

  const handleInputChange = (
    field: string,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Job title is required");

      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Job description is required");

      return false;
    }
    if (!formData.requirements.trim()) {
      toast.error("Requirements are required");

      return false;
    }
    if (!formData.responsibilities.trim()) {
      toast.error("Responsibilities are required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {

      return;
    }

    setIsLoading(true);
    try {
      // Split requirements and responsibilities by newlines and filter empty ones
      const requirementsArray = formData.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);

      const responsibilitiesArray = formData.responsibilities
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);

      const result = await createJobPost({
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: requirementsArray,
        responsibilities: responsibilitiesArray,
        location: formData.location.trim() || null,
        employmentType: formData.employmentType || "full-time",
        salaryRange: formData.salaryRange.trim() || null,
      });

      if (result) {
        toast.success("Job post created successfully!", {
          position: "bottom-right",
          duration: 3000,
        });
        onClose();
      } else {
        toast.error("Failed to create job post", {
          position: "bottom-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating job post:", error);
      toast.error("An error occurred while creating the job post", {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {

      setIsLoading(false);
    }
  };

  return (
    <div className="w-[38rem] max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="relative flex justify-center py-4 border-b">
        <ChevronLeft
          className="absolute left-0 opacity-50 cursor-pointer hover:opacity-100 text-gray-600 ml-4"
          size={30}
          onClick={onClose}
        />
        <h1 className="text-2xl font-semibold">Create Job Post</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              placeholder="e.g., Senior React Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              placeholder="Describe the role, team, and what you&apos;re looking for..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Enter one requirement per line
            </p>
            <textarea
              value={formData.requirements}
              placeholder="e.g., 5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with Next.js"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                handleInputChange("requirements", e.target.value)
              }
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsibilities *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Enter one responsibility per line
            </p>
            <textarea
              value={formData.responsibilities}
              placeholder="e.g., Develop and maintain React components&#10;Lead code reviews&#10;Mentor junior developers"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                handleInputChange("responsibilities", e.target.value)
              }
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              placeholder="e.g., San Francisco, CA or Remote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type
            </label>
            <select
              value={formData.employmentType}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                handleInputChange("employmentType", e.target.value)
              }
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <input
              type="text"
              value={formData.salaryRange}
              placeholder="e.g., $120,000 - $160,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                handleInputChange("salaryRange", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 border-t p-4">
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
          {isLoading ? "Creating..." : "Create Job Post"}
        </Button>
      </div>
    </div>
  );
}

export default CreateJobPostModal;
