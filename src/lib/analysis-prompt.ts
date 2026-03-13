import type { RoleFilters } from '@/types';

export function buildAnalysisPrompt(
  jobDescription: string,
  candidateText: string,
  filters?: RoleFilters,
  ruleBasedScore?: number
): string {
  const filtersSection = filters
    ? `
Structured filters to consider:
- Required skills: ${filters.requiredSkills?.join(', ') || 'None specified'}
- Preferred skills: ${filters.preferredSkills?.join(', ') || 'None specified'}
- Years of experience: ${filters.yearsExperience?.min != null ? `min ${filters.yearsExperience.min}` : ''} ${filters.yearsExperience?.max != null ? `max ${filters.yearsExperience.max}` : ''}
- Location: ${filters.location || 'Not specified'}
- Education: ${filters.education?.join(', ') || 'Not specified'}
- Industry: ${filters.industry?.join(', ') || 'Not specified'}
- Seniority: ${filters.seniority?.join(', ') || 'Not specified'}
- Dealbreakers: ${filters.dealbreakers?.join(', ') || 'None'}
`
    : '';

  const ruleScoreNote =
    ruleBasedScore != null
      ? `\nA rule-based preliminary score for this candidate is ${ruleBasedScore}/100. Use this as a signal but apply your own judgment.\n`
      : '';

  return `You are an expert recruiter evaluating a candidate against a job description. Analyze the candidate's resume and return a structured JSON object.

JOB DESCRIPTION / WHAT THE RECRUITER IS LOOKING FOR:
${jobDescription}
${filtersSection}
${ruleScoreNote}

CANDIDATE RESUME/CV (text extracted):
---
${candidateText}
---

Return ONLY valid JSON with this exact structure. No markdown, no code fences, no extra text:
{
  "fullName": "string - candidate's full name",
  "email": "string or null",
  "phone": "string or null",
  "currentTitle": "string or null - current or most recent job title",
  "companies": ["array of notable companies"],
  "yearsExperience": number or null,
  "skills": ["array of skills detected"],
  "education": ["array of education entries"],
  "location": "string or null",
  "overallScore": number 0-100,
  "summary": "2-3 sentence summary of the candidate",
  "strengths": ["array of top 3-5 strengths for this role"],
  "weaknesses": ["array of 2-4 weaknesses or gaps"],
  "redFlags": ["array of possible concerns, empty if none"],
  "matchReasons": ["array of why they match the role"],
  "mismatchReasons": ["array of why they may not match"],
  "outreachMessage": "A natural, personalized outreach message (2-4 sentences) to this candidate. Reference their specific background and why they seem relevant. Sound human, not robotic. Do not use clichés like 'I hope this finds you well.'"
}`;
}
