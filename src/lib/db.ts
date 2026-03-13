import { PrismaClient } from '@prisma/client';
import type { CandidateAnalysis, RoleFilters } from '@/types';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function createSession(
  jobDescription: string,
  filters?: RoleFilters
) {
  return prisma.analysisSession.create({
    data: {
      jobDescription,
      filters: filters ? JSON.stringify(filters) : null,
    },
  });
}

export async function saveCandidates(
  sessionId: string,
  analyses: CandidateAnalysis[],
  sourceFiles?: Record<number, string>
) {
  const creates = analyses.map((a, i) =>
    prisma.candidate.create({
      data: {
        sessionId,
        rawText: [a.fullName, a.summary, a.currentTitle].filter(Boolean).join(' | ') || 'Candidate',
        sourceFile: sourceFiles?.[i],
        fullName: a.fullName,
        email: a.email ?? null,
        phone: a.phone ?? null,
        currentTitle: a.currentTitle ?? null,
        companies: a.companies ? JSON.stringify(a.companies) : null,
        yearsExperience: a.yearsExperience ?? null,
        skills: a.skills ? JSON.stringify(a.skills) : null,
        education: a.education ? JSON.stringify(a.education) : null,
        location: a.location ?? null,
        overallScore: a.overallScore,
        summary: a.summary ?? null,
        strengths: a.strengths ? JSON.stringify(a.strengths) : null,
        weaknesses: a.weaknesses ? JSON.stringify(a.weaknesses) : null,
        redFlags: a.redFlags ? JSON.stringify(a.redFlags) : null,
        matchReasons: a.matchReasons ? JSON.stringify(a.matchReasons) : null,
        mismatchReasons: a.mismatchReasons ? JSON.stringify(a.mismatchReasons) : null,
        outreachMessage: a.outreachMessage ?? null,
      },
    })
  );
  return prisma.$transaction(creates);
}

export async function getSessionWithCandidates(sessionId: string) {
  const session = await prisma.analysisSession.findUnique({
    where: { id: sessionId },
    include: { candidates: { orderBy: { overallScore: 'desc' } } },
  });
  return session;
}

export async function listSessions(limit = 20) {
  return prisma.analysisSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { candidates: true } },
    },
  });
}

export async function updateShortlist(candidateId: string, shortlisted: boolean) {
  return prisma.candidate.update({
    where: { id: candidateId },
    data: { shortlisted },
  });
}
