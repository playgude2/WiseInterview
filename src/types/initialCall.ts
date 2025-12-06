// Initial Call Types

export interface InitialCallQuestion {
  id: string;
  question: string;
  category: 'experience' | 'availability' | 'salary' | 'relocation' | 'general';
  order: number;
}

export interface CandidateResponse {
  question_id: string;
  question: string;
  category: string;
  answer: string;
  duration?: number;
}

export interface CallSummaryReport {
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  organization_name: string;
  call_duration: number;
  call_date: string;
  responses: {
    experience: string;
    technologies: string;
    best_time_for_interview: string;
    availability: string;
    years_of_experience: string;
    current_salary: string;
    last_working_day: string;
    on_notice_period: boolean;
    salary_expectations: string;
    willing_to_relocate: boolean;
    relocation_timeline: string;
    office_preference: 'full_remote' | '3_days_week' | 'full_office';
  };
  summary: {
    strengths: string[];
    concerns: string[];
    recommendation: string;
    fit_score: number;
  };
}

export interface InitialCallAgent {
  id: number;
  created_at: string;
  organization_id: string;
  name: string;
  agent_id: string;
  description?: string;
  image?: string;
  is_active: boolean;
}

export interface InitialCallConfig {
  id: string;
  created_at: string;
  job_post_id: string;
  user_id: string;
  organization_id: string;
  agent_id: number;
  agent_name: string;
  greeting_text: string;
  organization_name: string;
  job_title: string;
  call_script: InitialCallQuestion[];
  is_active: boolean;
  updated_at: string;
}

export interface InitialCall {
  id: string;
  created_at: string;
  job_post_id: string;
  job_application_id: string;
  user_id: string;
  organization_id: string;
  agent_id?: number;
  agent_name: string;
  call_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  started_at?: string;
  ended_at?: string;
  call_transcript?: string;
  summary_report?: CallSummaryReport;
  candidate_responses?: CandidateResponse[];
  is_analysed: boolean;
  is_ended: boolean;
  is_viewed: boolean;
  notes?: string;
}

export interface CreateInitialCallPayload {
  job_post_id: string;
  job_application_id: string;
  user_id: string;
  organization_id: string;
  agent_id: number;
  agent_name: string;
}

export interface CreateInitialCallConfigPayload {
  job_post_id: string;
  user_id: string;
  organization_id: string;
  agent_id: number;
  agent_name: string;
  greeting_text: string;
  organization_name: string;
  job_title: string;
  call_script: InitialCallQuestion[];
}

export interface InitialCallResponse {
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  job_title: string;
  organization_name: string;
}
