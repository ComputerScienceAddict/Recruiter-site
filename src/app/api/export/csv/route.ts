import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithCandidates } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { searchParams }: { searchParams: Promise<{ sessionId?: string; shortlistedOnly?: string }> }
) {
  try {
    const params = await searchParams;
    const sessionId = params?.sessionId;
    const shortlistedOnly = params?.shortlistedOnly;
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await getSessionWithCandidates(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    let candidates = session.candidates;
    if (shortlistedOnly === 'true') {
      candidates = candidates.filter((c) => c.shortlisted);
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Title',
      'Companies',
      'Years Exp',
      'Skills',
      'Education',
      'Location',
      'Score',
      'Summary',
      'Strengths',
      'Weaknesses',
      'Match Reasons',
      'Outreach',
    ];

    const rows = candidates.map((c) => [
      c.fullName ?? '',
      c.email ?? '',
      c.phone ?? '',
      c.currentTitle ?? '',
      c.companies ?? '[]',
      c.yearsExperience ?? '',
      c.skills ?? '[]',
      c.education ?? '[]',
      c.location ?? '',
      c.overallScore ?? '',
      c.summary ?? '',
      c.strengths ?? '[]',
      c.weaknesses ?? '[]',
      c.matchReasons ?? '[]',
      c.outreachMessage ?? '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="candidates-${sessionId}.csv"`,
      },
    });
  } catch (e) {
    console.error('Export error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
