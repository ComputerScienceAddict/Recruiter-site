import { NextResponse } from 'next/server';
import { listSessions } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await listSessions(30);
    const formatted = sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      jobDescription: s.jobDescription.slice(0, 150) + (s.jobDescription.length > 150 ? '...' : ''),
      candidateCount: s._count.candidates,
    }));
    return NextResponse.json({ sessions: formatted });
  } catch (e) {
    console.error('Sessions error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
