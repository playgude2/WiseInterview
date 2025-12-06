"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { JobPost, JobApplication } from "@/types/jobPost";
import JobPostService from "@/services/jobPost.service";
import JobApplicationService from "@/services/jobApplication.service";
import { logger } from "@/lib/logger";

type JobPostContextType = {
  jobPosts: JobPost[];
  selectedJobPost: JobPost | null;
  applications: JobApplication[];
  setSelectedJobPost: (jobPost: JobPost | null) => void;
  fetchJobPosts: () => Promise<void>;
  fetchApplications: (jobPostId: string) => Promise<void>;
  createJobPost: (data: any) => Promise<JobPost | null>;
  updateJobPost: (id: string, data: any) => Promise<JobPost | null>;
  deleteJobPost: (id: string) => Promise<boolean>;
  archiveJobPost: (id: string) => Promise<JobPost | null>;
  shortlistApplication: (applicationId: string) => Promise<void>;
  isLoading: boolean;
};

const JobPostContext = createContext<JobPostContextType | undefined>(
  undefined,
);

export function JobPostProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobPosts = async () => {
    try {
      setIsLoading(true);
      const posts = await JobPostService.getAllJobPosts(
        user?.id,
        organization?.id,
      );
      setJobPosts(posts);
    } catch (error) {
      logger.error("Error fetching job posts:", error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async (jobPostId: string) => {
    try {
      setIsLoading(true);
      const apps = await JobApplicationService.getApplicationsByJobPost(
        jobPostId,
      );
      setApplications(apps);
    } catch (error) {
      logger.error("Error fetching applications:", error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createJobPost = async (data: any) => {
    try {
      const response = await fetch("/api/create-job-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId: organization?.id,
          organizationName: organization?.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error("Error creating job post:", error as Error);

        return null;
      }

      const result = await response.json();
      await fetchJobPosts();

      return result.response;
    } catch (error) {
      logger.error("Error in createJobPost:", error as Error);

      return null;
    }
  };

  const updateJobPost = async (id: string, data: any) => {
    try {
      const updated = await JobPostService.updateJobPost(id, data);
      if (updated) {
        await fetchJobPosts();
      }
      
return updated;
    } catch (error) {
      logger.error("Error updating job post:", error as Error);
      
return null;
    }
  };

  const deleteJobPost = async (id: string) => {
    try {
      const deleted = await JobPostService.deleteJobPost(id);
      if (deleted) {
        await fetchJobPosts();
      }
      
return deleted;
    } catch (error) {
      logger.error("Error deleting job post:", error as Error);
      
return false;
    }
  };

  const archiveJobPost = async (id: string) => {
    try {
      const archived = await JobPostService.archiveJobPost(id);
      if (archived) {
        await fetchJobPosts();
      }
      
return archived;
    } catch (error) {
      logger.error("Error archiving job post:", error as Error);
      
return null;
    }
  };

  const shortlistApplication = async (applicationId: string) => {
    try {
      const response = await fetch("/api/shortlist-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        logger.error("Error shortlisting candidate:", error);
        
return;
      }

      // Refresh applications
      if (selectedJobPost) {
        await fetchApplications(selectedJobPost.id);
      }
    } catch (error) {
      logger.error("Error in shortlistApplication:", error as Error);
    }
  };

  useEffect(() => {
    if (organization?.id || user?.id) {
      fetchJobPosts();
    }
  }, [organization?.id, user?.id]);

  return (
    <JobPostContext.Provider
      value={{
        jobPosts,
        selectedJobPost,
        applications,
        setSelectedJobPost,
        fetchJobPosts,
        fetchApplications,
        createJobPost,
        updateJobPost,
        deleteJobPost,
        archiveJobPost,
        shortlistApplication,
        isLoading,
      }}
    >
      {children}
    </JobPostContext.Provider>
  );
}

export function useJobPosts() {
  const context = useContext(JobPostContext);
  if (context === undefined) {
    throw new Error("useJobPosts must be used within a JobPostProvider");
  }
  
return context;
}
