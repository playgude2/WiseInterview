import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { JobPost, JobPostBase } from "@/types/jobPost";
import { logger } from "@/lib/logger";

const JobPostService = {
  // Get all job posts for an organization (for dashboard)
  async getAllJobPosts(
    userId: string | undefined,
    organizationId: string | undefined,
  ): Promise<JobPost[]> {
    try {
      const supabase = createClientComponentClient();

      if (!organizationId && !userId) {
        return [];
      }

      const query = supabase
        .from("job_post")
        .select("*")
        .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching job posts:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getAllJobPosts:", error as Error);

      return [];
    }
  },

  // Get all public job posts (for careers page)
  async getPublicJobPosts(): Promise<JobPost[]> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .select("*")
        .eq("is_active", true)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching public job posts:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getPublicJobPosts:", error as Error);

      return [];
    }
  },

  // Get single job post by ID
  async getJobPostById(id: string): Promise<JobPost | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching job post by ID:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in getJobPostById:", error as Error);

      return null;
    }
  },

  // Get job post by readable slug
  async getJobPostBySlug(slug: string): Promise<JobPost | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .select("*")
        .eq("readable_slug", slug)
        .eq("is_active", true)
        .eq("is_archived", false)
        .single();

      if (error) {
        logger.error("Error fetching job post by slug:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in getJobPostBySlug:", error as Error);

      return null;
    }
  },

  // Create new job post
  async createJobPost(
    id: string,
    payload: JobPostBase & { readable_slug: string },
  ): Promise<JobPost | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .insert({
          id,
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          is_archived: false,
          application_count: 0,
          view_count: 0,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating job post:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in createJobPost:", error as Error);

      return null;
    }
  },

  // Update job post
  async updateJobPost(
    id: string,
    payload: Partial<JobPostBase>,
  ): Promise<JobPost | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating job post:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in updateJobPost:", error as Error);

      return null;
    }
  },

  // Delete job post
  async deleteJobPost(id: string): Promise<boolean> {
    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase.from("job_post").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting job post:", error as Error);

        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error in deleteJobPost:", error as Error);

      return false;
    }
  },

  // Archive job post (soft delete)
  async archiveJobPost(id: string): Promise<JobPost | null> {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_post")
        .update({
          is_archived: true,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error archiving job post:", error as Error);

        return null;
      }

      return data || null;
    } catch (error) {
      logger.error("Error in archiveJobPost:", error as Error);

      return null;
    }
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<boolean> {
    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase.rpc("increment_job_post_views", {
        job_post_id: id,
      });

      if (error) {
        logger.error("Error incrementing view count:", error as Error);

        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error in incrementViewCount:", error as Error);

      return false;
    }
  },

  // Increment application count
  async incrementApplicationCount(id: string): Promise<boolean> {
    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase.rpc(
        "increment_job_post_applications",
        {
          job_post_id: id,
        },
      );

      if (error) {
        logger.error("Error incrementing application count:", error as Error);

        return false;
      }

      return true;
    } catch (error) {
      logger.error("Error in incrementApplicationCount:", error as Error);

      return false;
    }
  },

  // Get all applications for a job post
  async getJobPostApplications(jobPostId: string) {
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("job_application")
        .select("*")
        .eq("job_post_id", jobPostId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching job post applications:", error as Error);

        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getJobPostApplications:", error as Error);

      return [];
    }
  },
};

export default JobPostService;
