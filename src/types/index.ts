export interface RoleFilters {
  requiredSkills: string[];
  preferredSkills: string[];
  yearsExperience?: { min?: number; max?: number };
  location?: string;
  education?: string[];
  industry?: string[];
  seniority?: string[];
  dealbreakers?: string[];
}

export interface ParsedCandidate {
  rawText: string;
  sourceFile?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  companies?: string[];
  yearsExperience?: number;
  skills?: string[];
  education?: string[];
  location?: string;
}

export interface CandidateAnalysis {
  fullName: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  companies?: string[];
  yearsExperience?: number;
  skills?: string[];
  education?: string[];
  location?: string;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  matchReasons: string[];
  mismatchReasons: string[];
  outreachMessage: string;
}

export interface AnalysisInput {
  jobDescription: string;
  filters?: RoleFilters;
  candidates: ParsedCandidate[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: Buffer;
}
