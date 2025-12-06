import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  JobApplication,
  JobApplicationBase,
  ATSAnalysis,
} from "@/types/jobPost";
import { logger } from "@/lib/logger";

const JobApplicationService = {
  // Create new application
  async createApplication(
    id: string,
    payload: JobApplicationBase,
  ): Promise<JobApplication | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .insert({
          id,
          ...payload,
          created_at: new Date().toISOString(),
          ats_score: 0,
          status: "submitted",
          is_shortlisted: false,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating job application:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in createApplication:", error as Error);

      return null;
    }
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<JobApplication | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching application by ID:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in getApplicationById:", error as Error);

      return null;
    }
  },

  // Get all applications for a job post
  async getApplicationsByJobPost(jobPostId: string): Promise<JobApplication[]> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .select("*")
        .eq("job_post_id", jobPostId)
        .order("ats_score", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching applications by job post:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getApplicationsByJobPost:", error as Error);

      return [];
    }
  },

  // Get all applications for an organization
  async getApplicationsByOrganization(
    organizationId: string,
  ): Promise<JobApplication[]> {
    try {
      const supabase = createClientComponentClient();

      // Join with job_post to filter by organization
      const { data, error } = await supabase
        .from("job_application")
        .select(
          `
          *,
          job_post:job_post_id(organization_id)
        `,
        )
        .eq("job_post.organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching applications by organization:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getApplicationsByOrganization:", error as Error);

      return [];
    }
  },

  // Update application status
  async updateApplicationStatus(
    id: string,
    status: "submitted" | "shortlisted" | "rejected" | "interviewed",
  ): Promise<JobApplication | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating application status:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in updateApplicationStatus:", error as Error);

      return null;
    }
  },

  // Mark application as shortlisted
  async shortlistApplication(id: string): Promise<JobApplication | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .update({
          is_shortlisted: true,
          status: "shortlisted",
          shortlist_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error shortlisting application:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in shortlistApplication:", error as Error);

      return null;
    }
  },

  // Get shortlisted applications for a job
  async getShortlistedApplications(jobPostId: string): Promise<
    JobApplication[]
  > {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .select("*")
        .eq("job_post_id", jobPostId)
        .eq("is_shortlisted", true)
        .order("ats_score", { ascending: false });

      if (error) {
        logger.error("Error fetching shortlisted applications:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getShortlistedApplications:", error as Error);

      return [];
    }
  },

  // Update ATS score and analysis
  async updateATSScore(
    id: string,
    score: number,
    analysis: ATSAnalysis,
  ): Promise<JobApplication | null> {
    try {
      const supabase = createClientComponentClient();

      // Auto-shortlist if score >= 85
      const shouldAutoShortlist = score >= 85;

      const { data, error } = await supabase
        .from("job_application")
        .update({
          ats_score: score,
          ats_analysis: analysis,
          is_shortlisted: shouldAutoShortlist,
          status: shouldAutoShortlist ? "shortlisted" : "submitted",
          shortlist_date: shouldAutoShortlist
            ? new Date().toISOString()
            : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating ATS score:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in updateATSScore:", error as Error);

      return null;
    }
  },

  // Delete application
  async deleteApplication(id: string): Promise<boolean> {
    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("job_application")
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Error deleting application:", error as Error);

        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error in deleteApplication:", error as Error);

      return false;
    }
  },
};

export default JobApplicationService;
