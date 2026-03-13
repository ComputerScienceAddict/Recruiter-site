import { parsePdf } from './pdf';
import { parseDocx } from './docx';
import { parseTxt } from './txt';
import { parseLinkedInCsv } from './csv';
import type { ParsedCandidate } from '@/types';

const MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'application/csv': 'csv',
};

export async function parseFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ParsedCandidate[]> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const type = mimeType ? MIME_TYPES[mimeType] : ext;

  if (type === 'csv') {
    const text = buffer.toString('utf-8');
    return parseLinkedInCsv(text);
  }

  let candidate: ParsedCandidate;

  switch (type) {
    case 'pdf':
      candidate = await parsePdf(buffer, filename);
      break;
    case 'docx':
      candidate = await parseDocx(buffer, filename);
      break;
    case 'txt':
      candidate = parseTxt(buffer, filename);
      break;
    default:
      throw new Error(`Unsupported file type: ${filename}`);
  }

  if (!candidate.rawText?.trim()) {
    throw new Error(`Could not extract text from ${filename}`);
  }

  return [candidate];
}
