// Job Post Types
export type JobPostBase = {
  user_id: string;
  organization_id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location?: string;
  employment_type?: "full-time" | "part-time" | "contract";
  salary_range?: string;
  interview_id?: string;
};

export type JobPost = JobPostBase & {
  id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_archived: boolean;
  application_count: number;
  view_count: number;
  readable_slug: string;
};

// Job Application Types
export type ATSAnalysis = {
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
    qualifications_found: string[];
    match_status: string;
  };
  keyword_relevance: {
    keywords_matched: string[];
    keyword_density: number;
  };
  overall_fit: string;
  strengths: string[];
  gaps: string[];
  final_score: number;
};

export type JobApplicationBase = {
  job_post_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  cv_text: string;
  cover_letter?: string;
  linkedin_url?: string;
};

export type JobApplication = JobApplicationBase & {
  id: string;
  created_at: string;
  ats_score: number;
  ats_analysis?: ATSAnalysis;
  status: "submitted" | "shortlisted" | "rejected" | "interviewed";
  shortlist_date?: string;
  is_shortlisted: boolean;
};

export type JobApplicationEmailSent = {
  id: string;
  created_at: string;
  job_application_id: string;
  email_type: "shortlist_notification" | "rejection";
  sent_at: string;
};
