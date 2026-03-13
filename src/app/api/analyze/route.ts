import { NextRequest, NextResponse } from 'next/server';
import { analyzeCandidate } from '@/lib/analysis-pipeline';
import type { ParsedCandidate, RoleFilters } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      filters,
      candidates: rawCandidates,
    }: {
      jobDescription: string;
      filters?: RoleFilters;
      candidates: ParsedCandidate[];
    } = body;

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!rawCandidates?.length) {
      return NextResponse.json(
        { error: 'At least one candidate is required' },
        { status: 400 }
      );
    }

    const analyses = [];

    for (let i = 0; i < rawCandidates.length; i++) {
      const c = rawCandidates[i];
      try {
        const result = await analyzeCandidate(c, jobDescription, filters);
        analyses.push(result);
      } catch (e) {
        console.error(`Analysis failed for candidate ${i}:`, e);
        analyses.push({
          fullName: c.fullName ?? 'Unknown',
          email: c.email,
          phone: c.phone,
          currentTitle: c.currentTitle,
          companies: c.companies ?? [],
          yearsExperience: c.yearsExperience,
          skills: c.skills ?? [],
          education: c.education ?? [],
          location: c.location,
          overallScore: 0,
          summary: `Analysis failed: ${(e as Error).message}`,
          strengths: [],
          weaknesses: [],
          redFlags: [],
          matchReasons: [],
          mismatchReasons: [],
          outreachMessage: '',
        });
      }
    }

    analyses.sort((a, b) => b.overallScore - a.overallScore);

    const sessionId = uuidv4();
    const sourceFiles: Record<number, string> = {};
    rawCandidates.forEach((c, i) => {
      if (c.sourceFile) sourceFiles[i] = c.sourceFile;
    });
    const candidates = analyses.map((r, i) => ({
      id: uuidv4(),
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      currentTitle: r.currentTitle,
      companies: r.companies ?? [],
      yearsExperience: r.yearsExperience,
      skills: r.skills ?? [],
      education: r.education ?? [],
      location: r.location,
      overallScore: r.overallScore,
      summary: r.summary,
      strengths: r.strengths ?? [],
      weaknesses: r.weaknesses ?? [],
      redFlags: r.redFlags ?? [],
      matchReasons: r.matchReasons ?? [],
      mismatchReasons: r.mismatchReasons ?? [],
      outreachMessage: r.outreachMessage,
      shortlisted: false,
      sourceFile: sourceFiles[i] ?? null,
    }));

    return NextResponse.json({
      sessionId,
      candidates,
      total: candidates.length,
      jobDescription,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Analyze error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
