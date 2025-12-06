export function generateATSScorePrompt(
  jobTitle: string,
  jobDescription: string,
  requirements: string[],
  responsibilities: string[],
  cvText: string,
): string {
  const requirementsStr = requirements.join("\n- ");
  const responsibilitiesStr = responsibilities.join("\n- ");

  return `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the CV provided against the job posting and provide a detailed scoring.

JOB POSTING:
Title: ${jobTitle}

Description:
${jobDescription}

Key Requirements:
- ${requirementsStr}

Responsibilities:
- ${responsibilitiesStr}

CANDIDATE CV:
${cvText}

---

Now analyze this CV against the job requirements and provide a detailed JSON response with the following structure. Be objective and thorough in your analysis:

{
  "skills_match": {
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "match_percentage": 75
  },
  "experience_fit": {
    "years_of_experience": 5,
    "experience_match": "meets"
  },
  "qualification_match": {
    "qualifications_found": ["Bachelor's in Computer Science", "AWS Certification"],
    "match_status": "meets most requirements"
  },
  "keyword_relevance": {
    "keywords_matched": ["Python", "React", "Docker"],
    "keyword_density": 85
  },
  "overall_fit": "The candidate has strong technical skills and relevant experience. Missing some specialized tools mentioned in the requirements.",
  "strengths": ["Strong Python background", "React expertise", "Leadership experience"],
  "gaps": ["Limited Kubernetes experience", "No mentioned DevOps background"],
  "final_score": 82
}

IMPORTANT SCORING RULES:
- Skills Match: Compare candidate's skills with job requirements (35% weight of final score)
- Experience Fit: Check if candidate has required years of experience (25% weight)
- Qualification Match: Verify educational requirements and certifications (20% weight)
- Keyword Relevance: Check job description keywords present in CV (15% weight)
- Bonus: Up to 5 points for exceptional fit or specialized knowledge
- Final Score MUST be 0-100

Calculate the final_score as follows:
final_score = (skills_match.match_percentage × 0.35) + (experience_fit × 25) + (qualification_match × 20) + (keyword_relevance × 0.15) + bonus

Return ONLY valid JSON, no additional text.`;
}
