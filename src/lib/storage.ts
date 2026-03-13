const STORAGE_KEY = 'recruiter_analyses';
const MAX_SESSIONS = 20;

export interface StoredSession {
  id: string;
  jobDescription: string;
  createdAt: string;
  candidates: StoredCandidate[];
}

export interface StoredCandidate {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  companies: string[];
  yearsExperience: number | null;
  skills: string[];
  education: string[];
  location: string | null;
  overallScore: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  matchReasons: string[];
  mismatchReasons: string[];
  outreachMessage: string | null;
  shortlisted: boolean;
  sourceFile: string | null;
}

function getSessions(): StoredSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: StoredSession[]) {
  if (typeof window === 'undefined') return;
  const trimmed = sessions.slice(-MAX_SESSIONS);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function saveSession(session: StoredSession) {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== session.id);
  saveSessions([...filtered, session]);
}

export function getSession(id: string): StoredSession | null {
  return getSessions().find((s) => s.id === id) ?? null;
}

export function listSessions(): { id: string; jobDescription: string; createdAt: string; candidateCount: number }[] {
  return getSessions().map((s) => ({
    id: s.id,
    jobDescription: s.jobDescription,
    createdAt: s.createdAt,
    candidateCount: s.candidates.length,
  }));
}
