import { NextRequest, NextResponse } from 'next/server';
import { updateShortlist } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { shortlisted } = body;

    if (typeof shortlisted !== 'boolean') {
      return NextResponse.json(
        { error: 'shortlisted must be a boolean' },
        { status: 400 }
      );
    }

    await updateShortlist(id, shortlisted);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Shortlist error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
