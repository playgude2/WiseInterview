import { logger } from '@/lib/logger';
import InitialCallsService from '@/services/initialCalls.service';
import { callGeminiJSON, extractJSONFromResponse } from '@/services/gemini.service';
import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { generateInitialCallAnalysisPrompt } from '@/lib/prompts/initial-call-script';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    logger.info('get-initial-call request received');

    const body = await req.json();
    const { initial_call_id } = body;

    // Get initial call details
    const initialCall = await InitialCallsService.getInitialCallById(
      initial_call_id,
    );

    if (!initialCall) {
      return NextResponse.json(
        { error: 'Initial call not found' },
        { status: 404 },
      );
    }

    // If already analyzed, return cached result
    if (initialCall.is_analysed && initialCall.summary_report) {
      return NextResponse.json(
        {
          success: true,
          initialCall,
        },
        { status: 200 },
      );
    }

    // Retrieve call from Retell
    if (!initialCall.call_id) {
      return NextResponse.json(
        { error: 'Call ID not found' },
        { status: 400 },
      );
    }

    const callDetails = await retellClient.call.retrieve(initialCall.call_id);

    if (!callDetails.transcript) {
      return NextResponse.json(
        { error: 'No transcript available for this call' },
        { status: 400 },
      );
    }

    // Calculate duration
    const duration = Math.round(
      ((callDetails.end_timestamp || 0) - (callDetails.start_timestamp || 0)) / 1000,
    );

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
      initial_call_id,
      initialCall.call_id,
      callDetails.transcript,
      summaryReport,
      analysis.responses,
    );

    logger.info('Initial call analyzed successfully', {
      initial_call_id,
      fit_score: analysis.summary.fit_score,
    });

    return NextResponse.json(
      {
        success: true,
        initialCall: updatedCall,
        analysis: summaryReport,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Error getting initial call:', (error as Error).message);

    return NextResponse.json(
      { error: 'Failed to get initial call details' },
      { status: 500 },
    );
  }
}
