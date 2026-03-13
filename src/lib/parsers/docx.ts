import mammoth from 'mammoth';
import type { ParsedCandidate } from '@/types';

export async function parseDocx(buffer: Buffer, filename?: string): Promise<ParsedCandidate> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    rawText: result.value,
    sourceFile: filename,
  };
}
