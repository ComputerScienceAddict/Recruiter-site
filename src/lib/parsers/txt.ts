import type { ParsedCandidate } from '@/types';

export function parseTxt(buffer: Buffer, filename?: string): ParsedCandidate {
  const text = buffer.toString('utf-8');
  return {
    rawText: text,
    sourceFile: filename,
  };
}
