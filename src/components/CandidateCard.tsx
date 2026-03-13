'use client';

interface Candidate {
  id: string;
  fullName: string | null;
  currentTitle: string | null;
  overallScore: number;
  summary: string | null;
  shortlisted: boolean;
}

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
  onShortlist: (value: boolean) => void;
}

export function CandidateCard({ candidate, isSelected, onSelect, onShortlist }: CandidateCardProps) {
  return (
    <article
      onClick={onSelect}
      className={`
        cursor-pointer rounded-md bg-white px-4 py-3 transition-colors
        ${isSelected ? 'ring-1 ring-surface-400 ring-offset-2' : 'ring-1 ring-surface-200/80 hover:ring-surface-300'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-surface-900">{candidate.fullName ?? 'Unknown'}</span>
            <span className="text-[13px] text-surface-400">{candidate.overallScore}</span>
            {candidate.shortlisted && (
              <span className="text-[11px] text-surface-500">· shortlisted</span>
            )}
          </div>
          {candidate.currentTitle && (
            <p className="mt-0.5 text-[13px] text-surface-500">{candidate.currentTitle}</p>
          )}
          {candidate.summary && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-surface-600">
              {candidate.summary}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onShortlist(!candidate.shortlisted);
          }}
          className={`
            shrink-0 rounded px-2 py-1 text-[12px]
            ${candidate.shortlisted ? 'text-surface-500' : 'text-surface-400 hover:text-surface-600'}
          `}
        >
          {candidate.shortlisted ? '✓' : 'Shortlist'}
        </button>
      </div>
    </article>
  );
}
