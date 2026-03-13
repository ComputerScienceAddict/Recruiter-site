import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parsers';
import type { ParsedCandidate } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files?.length) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const allCandidates: ParsedCandidate[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!file.size) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name;
      const mimeType = file.type;

      try {
        const parsed = await parseFile(buffer, filename, mimeType);
        allCandidates.push(...parsed);
      } catch (e) {
        errors.push(`${filename}: ${(e as Error).message}`);
      }
    }

    return NextResponse.json({
      candidates: allCandidates,
      total: allCandidates.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (e) {
    console.error('Parse error:', e);
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
