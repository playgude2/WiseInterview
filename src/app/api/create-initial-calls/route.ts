import { logger } from '@/lib/logger';
import InitialCallsService from '@/services/initialCalls.service';
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    logger.info('create-initial-calls request received');

    const body = await req.json();

    const {
      job_post_id,
      job_applications,
      agent_id,
      agent_name,
      from_number,
      user_id,
      organization_id,
      job_title,
      organization_name,
      greeting_text,
      call_script,
    } = body;

    if (!job_post_id || !job_applications || job_applications.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 },
      );
    }

    const createdCalls = [];

    for (const application of job_applications) {
      const initialCall = await InitialCallsService.createInitialCall({
        job_post_id,
        job_application_id: application.id,
        user_id,
        organization_id,
        agent_id,
        agent_name,
      });

      if (!initialCall) {
        continue;
      }

      try {
        // Get agent details to get the Retell agent_id
        const agent = await InitialCallsService.getInitialCallAgentById(agent_id);

        if (!agent) {
          logger.error('Agent not found', { agent_id });
          createdCalls.push(initialCall);

          continue;
        }

        // Format phone numbers to E.164 format (remove parentheses, spaces, dashes)
        const candidatePhone = application.candidate_phone || '';
        const formattedToNumber = candidatePhone.startsWith('+')
          ? candidatePhone.replace(/\D/g, '').replace(/^/, '+')
          : `+91${candidatePhone.replace(/\D/g, '')}`;

        // Format from_number to E.164 format
        const formattedFromNumber = from_number.replace(/\D/g, '').replace(/^/, '+');

        // Format screening questions for the prompt
        const formattedScreeningQuestions = call_script
          ? call_script
              .map((q: any, index: number) => `${index + 1}. ${q.question}`)
              .join('\n')
          : 'Ask about candidate experience, availability, and salary expectations';

        logger.info('Attempting to create call with Retell', {
          agent_id: agent.agent_id,
          from_number: formattedFromNumber,
          to_number: formattedToNumber,
          candidate_name: application.candidate_name,
        });

        // Make outbound phone call with Retell
        const callResponse = await (retellClient.call as any).createPhoneCall({
          agent_id: agent.agent_id,
          from_number: formattedFromNumber,
          to_number: formattedToNumber,
          retell_llm_dynamic_variables: {
            candidate_name: application.candidate_name,
            organization_name: organization_name || 'Your Organization',
            job_title: job_title || 'Job Position',
            agent_name: agent_name || 'Recruiter',
            greeting_text: greeting_text || `Hello {{candidate_name}}, this is a call from {{organization_name}} and my name is {{agent_name}}. Is it a great time to talk?`,
            screening_questions: formattedScreeningQuestions,
          },
        });

        logger.info('Phone call initiated with Retell', {
          call_id: callResponse.call_id,
          to_number: formattedToNumber,
          initial_call_id: initialCall.id,
        });

        // Update initial call with call_id and in_progress status
        const updatedCall = await InitialCallsService.updateInitialCall(
          initialCall.id,
          {
            call_id: callResponse.call_id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
          } as any,
        );

        if (updatedCall) {
          createdCalls.push(updatedCall);
        } else {
          createdCalls.push(initialCall);
        }
      } catch (callError) {
        const errorMessage = callError instanceof Error ? callError.message : JSON.stringify(callError);
        logger.error('Error initiating phone call:', errorMessage);

        if (callError instanceof Error) {
          logger.error('Call error details:', {
            message: callError.message,
            stack: callError.stack,
          });
        }

        // Still include the call record even if phone call initiation failed
        createdCalls.push(initialCall);
      }
    }

    if (createdCalls.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create initial calls' },
        { status: 500 },
      );
    }

    logger.info('Initial calls created successfully', {
      count: createdCalls.length,
    });

    return NextResponse.json(
      {
        success: true,
        calls: createdCalls,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error creating initial calls:', (error as Error).message);

    return NextResponse.json(
      { error: 'Failed to create initial calls' },
      { status: 500 },
    );
  }
}
