import { logger } from '@/lib/logger';
import InitialCallsService from '@/services/initialCalls.service';
import { NextResponse } from 'next/server';
import { callGeminiJSON, extractJSONFromResponse } from '@/services/gemini.service';
import { generateInitialCallAnalysisPrompt } from '@/lib/prompts/initial-call-script';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    logger.info('webhook-call-completed request received');

    const body = await req.json();
    const { call_id } = body;

    if (!call_id) {
      return NextResponse.json(
        { error: 'Missing call_id' },
        { status: 400 },
      );
    }

    // Find the initial call by call_id
    const initialCall = await InitialCallsService.getInitialCallByCallId(
      call_id,
    );

    if (!initialCall) {
      logger.warn('Initial call not found for call_id', { call_id });

      return NextResponse.json(
        { success: true },
        { status: 200 },
      );
    }

    logger.info('Processing completed call', { initial_call_id: initialCall.id });

    // Retrieve call details from Retell
    const callDetails = await retellClient.call.retrieve(call_id);

    if (!callDetails.transcript) {
      logger.warn('No transcript available for call', { call_id });
      // Update status to completed without analysis
      await InitialCallsService.updateInitialCall(initialCall.id, {
        status: 'completed',
        ended_at: new Date().toISOString(),
        is_ended: true,
      } as any);

      return NextResponse.json(
        { success: true },
        { status: 200 },
      );
    }

    // Get initial call config to retrieve questions
    const config = await InitialCallsService.getInitialCallConfigByJobPost(
      initialCall.job_post_id,
    );

    const questions = config?.call_script || [];

    // Analyze transcript using Gemini
    const prompt = generateInitialCallAnalysisPrompt({
      candidateName: initialCall.summary_report?.candidate_name || 'Candidate',
      callTranscript: callDetails.transcript,
      questions,
    });

    const geminiResponse = await callGeminiJSON([
      {
        role: 'system',
        content:
          'You are an expert HR analyst skilled in evaluating candidate responses from screening calls. Provide comprehensive analysis in valid JSON format only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const analysisJson = extractJSONFromResponse(geminiResponse);
    const analysis = JSON.parse(analysisJson);

    // Calculate duration
    const duration = Math.round(
      ((callDetails.end_timestamp || 0) - (callDetails.start_timestamp || 0)) / 1000,
    );

    // Create summary report
    const summaryReport = {
      candidate_name: analysis.candidate_name,
      candidate_email: initialCall.summary_report?.candidate_email || '',
      job_title: initialCall.summary_report?.job_title || '',
      organization_name: initialCall.summary_report?.organization_name || '',
      call_duration: duration,
      call_date: new Date(callDetails.start_timestamp || Date.now()).toISOString(),
      responses: analysis.responses,
      summary: {
        strengths: analysis.summary.strengths,
        concerns: analysis.summary.concerns,
        recommendation: analysis.summary.recommendation,
        fit_score: analysis.summary.fit_score,
      },
    };

    // Update initial call with results
    const updatedCall = await InitialCallsService.updateCallWithResult(
      initialCall.id,
      call_id,
      callDetails.transcript,
      summaryReport,
      analysis.responses,
    );

    logger.info('Initial call analyzed via webhook', {
      initial_call_id: initialCall.id,
      fit_score: analysis.summary.fit_score,
    });

    return NextResponse.json(
      {
        success: true,
        initialCall: updatedCall,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error in webhook-call-completed:', (error as Error).message);

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    );
  }
}
