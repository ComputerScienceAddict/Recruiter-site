'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { CandidateCard } from '@/components/CandidateCard';
import { CandidateDetail } from '@/components/CandidateDetail';
import { CompareView } from '@/components/CompareView';

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
  sourceFile: string | null;
}

interface Session {
  id: string;
  createdAt: string;
  jobDescription: string;
  filters: unknown;
  candidates: Candidate[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSession(data);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const toggleShortlist = async (candidateId: string, shortlisted: boolean) => {
    await fetch(`/api/candidates/${candidateId}/shortlist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortlisted }),
    });
    fetchSession();
  };

  const handleExport = async (shortlisted: boolean) => {
    setExporting(true);
    try {
      const url = `/api/export/csv?sessionId=${id}&shortlistedOnly=${shortlisted}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `candidates-${shortlisted ? 'shortlist' : 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setExporting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-surface-700" />
          </div>
        </main>
      </div>
    );
  }

  let candidates = session.candidates;
  if (shortlistOnly) candidates = candidates.filter((c) => c.shortlisted);
  if (sortBy === 'name') {
    candidates = [...candidates].sort((a, b) =>
      (a.fullName ?? '').localeCompare(b.fullName ?? '')
    );
  } else {
    candidates = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
  }

  const selected = session.candidates.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-surface-50/30">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-lg font-medium text-surface-900">Results</h1>
              <p className="mt-0.5 text-sm text-surface-500">
                {session.candidates.length} candidates
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'name')}
                className="rounded-md border-0 bg-white py-1.5 pl-2 pr-7 text-surface-600 ring-1 ring-surface-200 hover:ring-surface-300 focus:ring-surface-400"
              >
                <option value="score">By score</option>
                <option value="name">By name</option>
              </select>
              <label className="flex cursor-pointer items-center gap-1.5 text-surface-600">
                <input
                  type="checkbox"
                  checked={shortlistOnly}
                  onChange={(e) => setShortlistOnly(e.target.checked)}
                  className="rounded border-surface-300"
                />
                Shortlist
              </label>
              <span className="h-4 w-px bg-surface-200" />
              <button
                onClick={() => handleExport(false)}
                disabled={exporting}
                className="text-surface-600 hover:text-surface-900 disabled:opacity-40"
              >
                Export
              </button>
              <button
                onClick={() => handleExport(true)}
                disabled={exporting}
                className="text-surface-600 hover:text-surface-900 disabled:opacity-40"
              >
                Shortlist CSV
              </button>
              <button
                onClick={() => setShowCompare(true)}
                disabled={compareIds.size < 2}
                className="text-surface-600 hover:text-surface-900 disabled:opacity-40"
              >
                Compare
              </button>
            </div>
          </div>
          <div className="mt-6 rounded-md bg-white py-3 px-4 ring-1 ring-surface-200/80">
            <p className="text-[13px] leading-relaxed text-surface-600">
              {session.jobDescription.slice(0, 400)}
              {session.jobDescription.length > 400 && '…'}
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
          <div className="space-y-2">
            {candidates.length === 0 ? (
              <div className="rounded-md py-20 text-center text-sm text-surface-400">
                {shortlistOnly ? 'No shortlisted candidates' : 'No candidates'}
              </div>
            ) : (
              candidates.map((c) => (
                <div key={c.id} className="group flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={compareIds.has(c.id)}
                    onChange={(e) => {
                      const next = new Set(compareIds);
                      if (e.target.checked && next.size < 3) next.add(c.id);
                      else next.delete(c.id);
                      setCompareIds(next);
                    }}
                    className="mt-3.5 size-4 shrink-0 rounded border-surface-300 text-surface-600 opacity-60 group-hover:opacity-100"
                    title="Add to compare (max 3)"
                  />
                  <div className="min-w-0 flex-1">
                    <CandidateCard
                      candidate={c}
                      isSelected={selectedId === c.id}
                      onSelect={() => setSelectedId(c.id === selectedId ? null : c.id)}
                      onShortlist={(v) => toggleShortlist(c.id, v)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <CandidateDetail
                key={selected.id}
                candidate={selected}
                onShortlist={(v) => toggleShortlist(selected.id, v)}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="rounded-md bg-white py-16 text-center text-sm text-surface-400 ring-1 ring-surface-200/80">
                Select a candidate
              </div>
            )}
          </div>
        </div>

        {showCompare && (
          <CompareView
            candidates={session.candidates.filter((c) => compareIds.has(c.id))}
            onClose={() => setShowCompare(false)}
          />
        )}
      </main>
    </div>
  );
}
