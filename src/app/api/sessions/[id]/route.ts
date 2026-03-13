import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithCandidates } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionWithCandidates(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const safeParseArray = (s: string | null): string[] => {
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === 'string' && x !== 'Array')
          : [];
      } catch {
        return [];
      }
    };

    const candidates = session.candidates.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      currentTitle: c.currentTitle,
      companies: safeParseArray(c.companies),
      yearsExperience: c.yearsExperience,
      skills: safeParseArray(c.skills),
      education: safeParseArray(c.education),
      location: c.location,
      overallScore: c.overallScore,
      summary: c.summary,
      strengths: safeParseArray(c.strengths),
      weaknesses: safeParseArray(c.weaknesses),
      redFlags: safeParseArray(c.redFlags),
      matchReasons: safeParseArray(c.matchReasons),
      mismatchReasons: safeParseArray(c.mismatchReasons),
      outreachMessage: c.outreachMessage,
      shortlisted: c.shortlisted,
      sourceFile: c.sourceFile,
    }));

    return NextResponse.json({
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      jobDescription: session.jobDescription,
      filters: session.filters ? JSON.parse(session.filters) : null,
      candidates,
    });
  } catch (e) {
    console.error('Session fetch error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
