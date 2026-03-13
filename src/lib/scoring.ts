import type { ParsedCandidate, RoleFilters } from '@/types';

const SKILL_WEIGHT = 0.25;
const EXPERIENCE_WEIGHT = 0.2;
const SENIORITY_WEIGHT = 0.15;
const EDUCATION_WEIGHT = 0.1;
const INDUSTRY_WEIGHT = 0.1;
const LOCATION_WEIGHT = 0.1;
const BASE_SCORE = 50;

function normalizeSkill(s: string): string {
  return s.toLowerCase().trim();
}

function skillMatch(candidateSkills: string[], required: string[], preferred: string[]): number {
  const normalized = new Set(candidateSkills.map(normalizeSkill));
  let score = 0;
  const normalizedArr = Array.from(normalized);
  const requiredMatch = required.filter((r) =>
    normalizedArr.some((c) => c.includes(normalizeSkill(r)) || normalizeSkill(r).includes(c))
  ).length;
  const preferredMatch = preferred.filter((p) =>
    normalizedArr.some((c) => c.includes(normalizeSkill(p)) || normalizeSkill(p).includes(c))
  ).length;
  const requiredWeight = required.length > 0 ? (requiredMatch / required.length) * 50 : 25;
  const preferredWeight = preferred.length > 0 ? (preferredMatch / preferred.length) * 25 : 25;
  return Math.min(100, requiredWeight + preferredWeight);
}

function experienceMatch(
  candidateYears: number | undefined,
  filter?: { min?: number; max?: number }
): number {
  if (!filter || (filter.min == null && filter.max == null)) return 75;
  const years = candidateYears ?? 0;
  if (filter.min != null && years < filter.min) return Math.max(0, 75 - (filter.min - years) * 10);
  if (filter.max != null && years > filter.max) return Math.max(0, 75 - (years - filter.max) * 5);
  return 100;
}

function locationMatch(candidate: string | undefined, filter?: string): number {
  if (!filter) return 75;
  if (!candidate) return 30;
  const c = candidate.toLowerCase();
  const f = filter.toLowerCase();
  if (c.includes(f) || f.includes(c)) return 100;
  return 50;
}

export function computeRuleBasedScore(
  candidate: ParsedCandidate,
  filters?: RoleFilters
): number {
  const skills = candidate.skills ?? [];
  const skillsFromText = candidate.rawText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) ?? [];
  const allSkills = Array.from(new Set([...skills, ...skillsFromText]));

  const skillScore = skillMatch(
    allSkills,
    filters?.requiredSkills ?? [],
    filters?.preferredSkills ?? []
  );

  const expScore = experienceMatch(candidate.yearsExperience, filters?.yearsExperience);
  const locScore = locationMatch(candidate.location, filters?.location);
  const eduScore = filters?.education?.length
    ? candidate.education?.length
      ? 90
      : 40
    : 75;

  const weights = [
    skillScore * SKILL_WEIGHT,
    expScore * EXPERIENCE_WEIGHT,
    locScore * LOCATION_WEIGHT,
    eduScore * EDUCATION_WEIGHT,
  ];

  const total = weights.reduce((a, b) => a + b, 0) / (SKILL_WEIGHT + EXPERIENCE_WEIGHT + LOCATION_WEIGHT + EDUCATION_WEIGHT);
  return Math.round(Math.min(100, Math.max(0, total)));
}
