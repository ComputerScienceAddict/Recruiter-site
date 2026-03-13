import pdf from 'pdf-parse';
import type { ParsedCandidate } from '@/types';

export async function parsePdf(buffer: Buffer, filename?: string): Promise<ParsedCandidate> {
  const data = await pdf(buffer);
  return {
    rawText: data.text,
    sourceFile: filename,
  };
}
