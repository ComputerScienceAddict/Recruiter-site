import Papa from 'papaparse';
import type { ParsedCandidate } from '@/types';

// LinkedIn Recruiter CSV columns vary; common ones include:
// First Name, Last Name, Full Name, Email, Phone, Current Company, Current Title,
// Skills, Experience, Education, Location, Profile URL, etc.
const COMMON_COLUMNS: Record<string, string> = {
  'first name': 'firstName',
  'last name': 'lastName',
  'full name': 'fullName',
  'name': 'fullName',
  'email': 'email',
  'email address': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'current company': 'currentCompany',
  'current title': 'currentTitle',
  'job title': 'currentTitle',
  'title': 'currentTitle',
  'skills': 'skills',
  'experience': 'experience',
  'education': 'education',
  'location': 'location',
  'profile url': 'profileUrl',
  'linkedin url': 'profileUrl',
  'headline': 'headline',
  'summary': 'summary',
};

function normalizeColumnName(name: string): string {
  return COMMON_COLUMNS[name.toLowerCase().trim()] || name;
}

function buildRawText(row: Record<string, string>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === 'string') {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.join('\n\n');
}

export function parseLinkedInCsv(csvContent: string): ParsedCandidate[] {
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.errors.some((e) => e.type === 'Quotes')) {
    // Retry with different options for malformed CSV
    const retry = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });
    return processRows(retry.data);
  }

  return processRows(parsed.data);
}

function processRows(rows: Record<string, string>[]): ParsedCandidate[] {
  const candidates: ParsedCandidate[] = [];

  for (const row of rows) {
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const norm = normalizeColumnName(key);
      if (value !== undefined && value !== null && String(value).trim()) {
        mapped[norm] = String(value).trim();
      }
    }

    const fullName =
      mapped.fullName ||
      [mapped.firstName, mapped.lastName].filter(Boolean).join(' ') ||
      row[Object.keys(row)[0]]; // fallback to first column

    const skillsStr = mapped.skills;
    const skills = skillsStr
      ? skillsStr.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
      : undefined;

    const education = mapped.education ? [mapped.education] : undefined;

    const rawText = buildRawText(row);

    candidates.push({
      rawText,
      sourceFile: 'linkedin_export.csv',
      fullName: fullName || 'Unknown',
      email: mapped.email,
      phone: mapped.phone,
      currentTitle: mapped.currentTitle || mapped.headline,
      companies: mapped.currentCompany ? [mapped.currentCompany] : undefined,
      skills,
      education,
      location: mapped.location,
    });
  }

  return candidates;
}
