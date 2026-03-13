'use client';

import { useState } from 'react';

interface Candidate {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  companies: string[];
  yearsExperience: number | null;
  skills: string[];
  education: string[];
  location: string | null;
  overallScore: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  matchReasons: string[];
  mismatchReasons: string[];
  outreachMessage: string | null;
  shortlisted: boolean;
}

interface CandidateDetailProps {
  candidate: Candidate;
  onShortlist: (value: boolean) => void;
  onClose: () => void;
}

export function CandidateDetail({ candidate, onShortlist, onClose }: CandidateDetailProps) {
  const [outreach, setOutreach] = useState(candidate.outreachMessage ?? '');
  const [copied, setCopied] = useState(false);

  const copyOutreach = () => {
    navigator.clipboard.writeText(outreach || candidate.outreachMessage || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const companies = Array.isArray(candidate.companies)
    ? candidate.companies
    : typeof candidate.companies === 'string'
      ? [candidate.companies]
      : [];

  return (
    <div className="animate-fade-in rounded-md bg-white ring-1 ring-surface-200/80">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-medium text-surface-900">{candidate.fullName ?? 'Unknown'}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-surface-400 hover:text-surface-600"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto border-t border-surface-100 px-4 py-4">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-surface-500">{candidate.overallScore} fit</span>
            <button
              type="button"
              onClick={() => onShortlist(!candidate.shortlisted)}
              className={`
                text-[13px]
                ${candidate.shortlisted ? 'text-surface-500' : 'text-surface-400 hover:text-surface-600'}
              `}
            >
              {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
          </div>

          {candidate.currentTitle && (
            <div>
              <p className="text-[12px] text-surface-400">Role</p>
              <p className="mt-0.5 text-[13px] text-surface-800">{candidate.currentTitle}</p>
            </div>
          )}

          {(candidate.email || candidate.phone || candidate.location) && (
            <div>
              <p className="text-[12px] text-surface-400">Contact</p>
              <p className="mt-0.5 text-[13px] text-surface-600">
                {[candidate.email, candidate.phone, candidate.location].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          {companies.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Companies</p>
              <p className="mt-0.5 text-[13px] text-surface-600">
                {companies.join(', ')}
              </p>
            </div>
          )}

          {candidate.yearsExperience != null && (
            <div>
              <p className="text-[12px] text-surface-400">Experience</p>
              <p className="mt-0.5 text-[13px] text-surface-600">{candidate.yearsExperience} years</p>
            </div>
          )}

          {candidate.skills?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Skills</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {candidate.skills.slice(0, 10).map((s, i) => (
                  <span key={i} className="rounded bg-surface-100/80 px-1.5 py-0.5 text-[12px] text-surface-600">
                    {s}
                  </span>
                ))}
                {candidate.skills.length > 10 && (
                  <span className="text-[12px] text-surface-400">+{candidate.skills.length - 10}</span>
                )}
              </div>
            </div>
          )}

          {candidate.education?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Education</p>
              <p className="mt-0.5 text-[13px] text-surface-600">
                {Array.isArray(candidate.education) ? candidate.education.join('; ') : candidate.education}
              </p>
            </div>
          )}

          {candidate.summary && (
            <div>
              <p className="text-[12px] text-surface-400">Summary</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-surface-700">{candidate.summary}</p>
            </div>
          )}

          {candidate.strengths?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Strengths</p>
              <ul className="mt-1 space-y-0.5 text-[13px] text-surface-700">
                {candidate.strengths.map((s, i) => (
                  <li key={i} className="leading-relaxed">· {s}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.weaknesses?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Weaknesses</p>
              <ul className="mt-1 space-y-0.5 text-[13px] text-surface-700">
                {candidate.weaknesses.map((w, i) => (
                  <li key={i} className="leading-relaxed">· {w}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.redFlags?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Concerns</p>
              <ul className="mt-1 space-y-0.5 text-[13px] text-surface-700">
                {candidate.redFlags.map((r, i) => (
                  <li key={i} className="leading-relaxed">· {r}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.matchReasons?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Why they match</p>
              <ul className="mt-1 space-y-0.5 text-[13px] text-surface-700">
                {candidate.matchReasons.map((m, i) => (
                  <li key={i} className="leading-relaxed">· {m}</li>
                ))}
              </ul>
            </div>
          )}

          {candidate.mismatchReasons?.length > 0 && (
            <div>
              <p className="text-[12px] text-surface-400">Gaps</p>
              <ul className="mt-1 space-y-0.5 text-[13px] text-surface-700">
                {candidate.mismatchReasons.map((m, i) => (
                  <li key={i} className="leading-relaxed">· {m}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-[12px] text-surface-400">Outreach</p>
            <textarea
              value={outreach}
              onChange={(e) => setOutreach(e.target.value)}
              rows={5}
              className="mt-1.5 w-full resize-y rounded border-0 bg-surface-50/80 px-3 py-2.5 text-[13px] text-surface-700 placeholder:text-surface-400 focus:ring-1 focus:ring-surface-300"
              placeholder="Personalized message..."
            />
            <button
              type="button"
              onClick={copyOutreach}
              className="mt-2 text-[12px] text-surface-500 hover:text-surface-700"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
