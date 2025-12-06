import { createClient } from '@supabase/supabase-js';
import {
  InitialCall,
  InitialCallConfig,
  InitialCallAgent,
  CreateInitialCallPayload,
  CreateInitialCallConfigPayload,
} from '@/types/initialCall';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class InitialCallsService {
  // Initial Call CRUD Operations
  async createInitialCall(
    payload: CreateInitialCallPayload,
  ): Promise<InitialCall | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .insert([
          {
            job_post_id: payload.job_post_id,
            job_application_id: payload.job_application_id,
            user_id: payload.user_id,
            organization_id: payload.organization_id,
            agent_id: payload.agent_id,
            agent_name: payload.agent_name,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        logger.error('Error creating initial call:', error);

        return null;
      }

      return data as InitialCall;
    } catch (error) {
      logger.error('Error creating initial call:', (error as Error).message);

      return null;
    }
  }

  async getInitialCallById(id: string): Promise<InitialCall | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching initial call:', error);

        return null;
      }

      return data as InitialCall;
    } catch (error) {
      logger.error('Error fetching initial call:', (error as Error).message);

      return null;
    }
  }

  async getInitialCallsByJobApplication(
    jobApplicationId: string,
  ): Promise<InitialCall[]> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .select('*')
        .eq('job_application_id', jobApplicationId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching initial calls:', (error as Error).message);

        return [];
      }

      return (data as InitialCall[]) || [];
    } catch (error) {
      logger.error('Error fetching initial calls:', (error as Error).message);

      return [];
    }
  }

  async getInitialCallsByJobPost(jobPostId: string): Promise<InitialCall[]> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .select('*')
        .eq('job_post_id', jobPostId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching initial calls by job post:', (error as Error).message);

        return [];
      }

      return (data as InitialCall[]) || [];
    } catch (error) {
      logger.error('Error fetching initial calls by job post:', (error as Error).message);

      return [];
    }
  }

  async getInitialCallsByOrganization(
    organizationId: string,
  ): Promise<InitialCall[]> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching initial calls by organization:', (error as Error).message);

        return [];
      }

      return (data as InitialCall[]) || [];
    } catch (error) {
      logger.error('Error fetching initial calls by organization:', (error as Error).message);

      return [];
    }
  }

  async getInitialCallByCallId(callId: string): Promise<InitialCall | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .select('*')
        .eq('call_id', callId)
        .single();

      if (error) {
        logger.error('Error fetching initial call by call_id:', (error as Error).message);

        return null;
      }

      return (data as InitialCall) || null;
    } catch (error) {
      logger.error('Error fetching initial call by call_id:', (error as Error).message);

      return null;
    }
  }

  async updateInitialCall(
    id: string,
    payload: Partial<InitialCall>,
  ): Promise<InitialCall | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating initial call:', (error as Error).message);

        return null;
      }

      return data as InitialCall;
    } catch (error) {
      logger.error('Error updating initial call:', (error as Error).message);

      return null;
    }
  }

  async updateCallWithResult(
    id: string,
    callId: string,
    callTranscript: string,
    summaryReport: any,
    candidateResponses: any,
  ): Promise<InitialCall | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call')
        .update({
          call_id: callId,
          call_transcript: callTranscript,
          summary_report: summaryReport,
          candidate_responses: candidateResponses,
          is_analysed: true,
          is_ended: true,
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating initial call with result:', (error as Error).message);

        return null;
      }

      return data as InitialCall;
    } catch (error) {
      logger.error('Error updating initial call with result:', (error as Error).message);

      return null;
    }
  }

  async deleteInitialCall(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('initial_call')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting initial call:', (error as Error).message);

        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting initial call:', (error as Error).message);

      return false;
    }
  }

  // Initial Call Config CRUD Operations
  async createInitialCallConfig(
    payload: CreateInitialCallConfigPayload,
  ): Promise<InitialCallConfig | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call_config')
        .insert([payload])
        .select()
        .single();

      if (error) {
        logger.error('Error creating initial call config:', (error as Error).message);

        return null;
      }

      return data as InitialCallConfig;
    } catch (error) {
      logger.error('Error creating initial call config:', (error as Error).message);

      return null;
    }
  }

  async getInitialCallConfigByJobPost(
    jobPostId: string,
  ): Promise<InitialCallConfig | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call_config')
        .select('*')
        .eq('job_post_id', jobPostId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching initial call config:', (error as Error).message);
      }

      return (data as InitialCallConfig) || null;
    } catch (error) {
      logger.error('Error fetching initial call config:', (error as Error).message);

      return null;
    }
  }

  async updateInitialCallConfig(
    id: string,
    payload: Partial<InitialCallConfig>,
  ): Promise<InitialCallConfig | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call_config')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating initial call config:', (error as Error).message);

        return null;
      }

      return data as InitialCallConfig;
    } catch (error) {
      logger.error('Error updating initial call config:', (error as Error).message);

      return null;
    }
  }

  // Initial Call Agent Operations
  async getInitialCallAgents(
    organizationId?: string,
  ): Promise<InitialCallAgent[]> {
    try {
      let query = supabase
        .from('initial_call_agent')
        .select('*')
        .eq('is_active', true);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching initial call agents:', (error as Error).message);

        return [];
      }

      return (data as InitialCallAgent[]) || [];
    } catch (error) {
      logger.error('Error fetching initial call agents:', (error as Error).message);

      return [];
    }
  }

  async getInitialCallAgentById(id: number): Promise<InitialCallAgent | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call_agent')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching initial call agent:', (error as Error).message);

        return null;
      }

      return data as InitialCallAgent;
    } catch (error) {
      logger.error('Error fetching initial call agent:', (error as Error).message);

      return null;
    }
  }

  async createInitialCallAgent(
    payload: Omit<InitialCallAgent, 'id' | 'created_at'>,
  ): Promise<InitialCallAgent | null> {
    try {
      const { data, error } = await supabase
        .from('initial_call_agent')
        .insert([payload])
        .select()
        .single();

      if (error) {
        logger.error('Error creating initial call agent:', (error as Error).message);

        return null;
      }

      return data as InitialCallAgent;
    } catch (error) {
      logger.error('Error creating initial call agent:', (error as Error).message);

      return null;
    }
  }
}

const initialCallsService = new InitialCallsService();

export default initialCallsService;
