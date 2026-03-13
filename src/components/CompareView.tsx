'use client';

interface Candidate {
  id: string;
  fullName: string | null;
  currentTitle: string | null;
  overallScore: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  matchReasons: string[];
}

interface CompareViewProps {
  candidates: Candidate[];
  onClose: () => void;
}

export function CompareView({ candidates, onClose }: CompareViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3">
          <h2 className="font-semibold text-surface-900">Compare candidates</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-surface-500 hover:text-surface-700"
          >
            Close
          </button>
        </div>
        <div className="grid gap-px bg-surface-200 p-4" style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
          {candidates.map((c) => (
            <div key={c.id} className="flex flex-col gap-4 bg-white p-4">
              <div>
                <p className="font-medium text-surface-900">{c.fullName ?? 'Unknown'}</p>
                {c.currentTitle && (
                  <p className="text-sm text-surface-600">{c.currentTitle}</p>
                )}
                <span className="mt-1 inline-block rounded bg-surface-100 px-2 py-0.5 text-sm font-medium text-surface-700">
                  {c.overallScore}/100
                </span>
              </div>
              {c.summary && (
                <div>
                  <p className="text-xs font-medium uppercase text-surface-500">Summary</p>
                  <p className="mt-1 text-sm text-surface-700">{c.summary}</p>
                </div>
              )}
              {c.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-surface-500">Strengths</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-surface-700">
                    {c.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.weaknesses?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-surface-500">Weaknesses</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-surface-700">
                    {c.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.matchReasons?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase text-green-700">Match reasons</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-surface-700">
                    {c.matchReasons.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
