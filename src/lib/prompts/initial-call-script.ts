import { InitialCallQuestion } from '@/types/initialCall';

export const SYSTEM_PROMPT =
  'You are an expert recruiter and call script designer who creates engaging and professional initial call scripts for candidate screening. Your scripts should be conversational, natural, and cover all important information gathering points.';

export const generateInitialCallScriptPrompt = (data: {
  jobTitle: string;
  organizationName: string;
  agentName: string;
  candidateName: string;
  jobDescription: string;
  jobRequirements: string;
}): string => `You are creating an initial screening call script for a recruiter named ${data.agentName} from ${data.organizationName}.

Job Details:
- Position: ${data.jobTitle}
- Candidate Name: ${data.candidateName}
- Organization: ${data.organizationName}

Job Description:
${data.jobDescription}

Job Requirements:
${data.jobRequirements}

Generate a structured call script with the following sections:

1. **Opening/Greeting**: A warm, professional greeting that includes the candidate's name, organization name, agent name, and confirmation of availability.

2. **Job Introduction**: Brief introduction to the position and why the candidate was selected.

3. **Questions**: Create 10-12 key questions covering these areas:
   - Experience in the field and relevant technologies
   - Best time to schedule interview (this week)
   - Current availability
   - Years of experience in relevant domain
   - Current salary expectations
   - Last working day (if applicable)
   - Notice period status
   - Salary expectations
   - Willingness to relocate and timeline
   - Office preference (remote, 3 days/week, or full-time office)

4. **Closing**: Professional closing statement with next steps.

For each question, provide:
- The actual question text (natural, conversational)
- Category (experience, availability, salary, relocation, or general)
- Expected response type

Make the script feel like a natural conversation, not robotic. Use a professional yet friendly tone.

Output ONLY a valid JSON object with this structure:
{
  "opening": "greeting text here",
  "jobIntroduction": "intro text here",
  "questions": [
    {
      "id": "q1",
      "question": "question text",
      "category": "category_name",
      "order": 1
    }
  ],
  "closing": "closing text here"
}`;

export const generateInitialCallAnalysisPrompt = (data: {
  candidateName: string;
  callTranscript: string;
  questions: InitialCallQuestion[];
}): string => `You are an expert HR analyst tasked with analyzing an initial screening call transcript.

Candidate Name: ${data.candidateName}
Transcript:
${data.callTranscript}

Original Questions Asked:
${data.questions.map((q) => `- ${q.question} (Category: ${q.category})`).join('\n')}

Please analyze this call transcript and extract:

1. **Candidate Responses**: For each question asked, extract the candidate's response
2. **Experience Assessment**: Evaluate candidate's experience level (junior/mid/senior)
3. **Technology Stack**: List technologies they mentioned working with
4. **Availability**: Their preferred interview timing and current availability
5. **Salary Info**: Current salary and salary expectations (if mentioned)
6. **Notice Period**: Current employment status and notice period
7. **Relocation**: Willingness to relocate and preferred timeline
8. **Office Preference**: Their preference for remote/hybrid/office work
9. **Strengths**: Key strengths based on their responses
10. **Concerns**: Any concerns or red flags noted
11. **Overall Fit**: Assessment of fit for the role (1-10)
12. **Recommendation**: Recommendation to proceed (yes/maybe/no) with reasoning

Output ONLY a valid JSON object with this structure:
{
  "candidate_name": "name",
  "responses": {
    "experience": "response text",
    "technologies": "tech stack",
    "best_time_for_interview": "timing",
    "availability": "availability details",
    "years_of_experience": "years",
    "current_salary": "salary range",
    "last_working_day": "date or N/A",
    "on_notice_period": true/false,
    "salary_expectations": "expected range",
    "willing_to_relocate": true/false,
    "relocation_timeline": "timeline or N/A",
    "office_preference": "remote/3_days_week/full_office"
  },
  "summary": {
    "experience_level": "junior/mid/senior",
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"],
    "fit_score": 7,
    "recommendation": "yes/maybe/no",
    "recommendation_reason": "detailed reason"
  }
}`;
