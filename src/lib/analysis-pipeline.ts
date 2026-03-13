import { ollamaGenerate } from './ollama';
import { buildAnalysisPrompt } from './analysis-prompt';
import { computeRuleBasedScore } from './scoring';
import type { ParsedCandidate, RoleFilters, CandidateAnalysis } from '@/types';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;

function extractJsonFromResponse(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}') + 1;
  if (start >= 0 && end > start) {
    cleaned = cleaned.slice(start, end);
  }
  return JSON.parse(cleaned) as Record<string, unknown>;
}

function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') return val ? [val] : [];
  return [];
}

function safeString(val: unknown): string | undefined {
  if (typeof val === 'string' && val.trim()) return val.trim();
  return undefined;
}

function safeNumber(val: unknown): number | undefined {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

export async function analyzeCandidate(
  candidate: ParsedCandidate,
  jobDescription: string,
  filters?: RoleFilters
): Promise<CandidateAnalysis> {
  const ruleScore = computeRuleBasedScore(candidate, filters);
  const prompt = buildAnalysisPrompt(jobDescription, candidate.rawText, filters, ruleScore);

  const response = await ollamaGenerate({
    prompt,
    format: 'json',
  });

  const parsed = extractJsonFromResponse(response);

  const email = safeString(parsed.email) ?? candidate.email ?? extractFirst(candidate.rawText, EMAIL_REGEX);
  const phone = safeString(parsed.phone) ?? candidate.phone ?? extractFirst(candidate.rawText, PHONE_REGEX);

  const overallScore = Math.min(100, Math.max(0, safeNumber(parsed.overallScore) ?? ruleScore));
  const yearsExp = safeNumber(parsed.yearsExperience) ?? candidate.yearsExperience;

  return {
    fullName: safeString(parsed.fullName) ?? candidate.fullName ?? 'Unknown',
    email,
    phone,
    currentTitle: safeString(parsed.currentTitle) ?? candidate.currentTitle,
    companies: parsed.companies ? safeArray(parsed.companies) : candidate.companies,
    yearsExperience: yearsExp,
    skills: parsed.skills ? safeArray(parsed.skills) : candidate.skills,
    education: parsed.education ? safeArray(parsed.education) : candidate.education,
    location: safeString(parsed.location) ?? candidate.location,
    overallScore,
    summary: safeString(parsed.summary) ?? 'No summary available.',
    strengths: safeArray(parsed.strengths),
    weaknesses: safeArray(parsed.weaknesses),
    redFlags: safeArray(parsed.redFlags),
    matchReasons: safeArray(parsed.matchReasons),
    mismatchReasons: safeArray(parsed.mismatchReasons),
    outreachMessage: safeString(parsed.outreachMessage) ?? '',
  };
}

function extractFirst(text: string, regex: RegExp): string | undefined {
  const m = text.match(regex);
  return m?.[0];
}
