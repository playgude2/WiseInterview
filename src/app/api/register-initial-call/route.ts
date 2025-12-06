import { logger } from '@/lib/logger';
import InitialCallsService from '@/services/initialCalls.service';
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    logger.info('register-initial-call request received');

    const body = await req.json();

    const {
      initial_call_id,
      agent_id,
      candidate_name,
      organization_name,
      job_title,
      agent_name,
    } = body;

    // Get agent details
    const agent = await InitialCallsService.getInitialCallAgentById(agent_id);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 },
      );
    }

    // Create web call with Retell
    const registerCallResponse = await retellClient.call.createWebCall({
      agent_id: agent.agent_id,
      retell_llm_dynamic_variables: {
        candidate_name,
        organization_name,
        job_title,
        agent_name,
      },
    });

    logger.info('Initial call registered successfully', {
      call_id: registerCallResponse.call_id,
    });

    // Update initial call with call_id and status
    await InitialCallsService.updateInitialCall(initial_call_id, {
      call_id: registerCallResponse.call_id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    } as any);

    return NextResponse.json(
      {
        success: true,
        registerCallResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error registering initial call:', (error as Error).message);

    return NextResponse.json(
      { error: 'Failed to register call' },
      { status: 500 },
    );
  }
}
