'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { FileUpload } from '@/components/FileUpload';
import { FiltersSection } from '@/components/FiltersSection';
import { OllamaStatus } from '@/components/OllamaStatus';
import type { ParsedCandidate, RoleFilters } from '@/types';

const defaultFilters: RoleFilters = {
  requiredSkills: [],
  preferredSkills: [],
};

export default function HomePage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [filters, setFilters] = useState<RoleFilters>(defaultFilters);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Enter a job description.');
      return;
    }
    if (candidates.length === 0) {
      setError('Upload at least one resume or CSV.');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          filters: filters.requiredSkills?.length || filters.preferredSkills?.length ? filters : undefined,
          candidates,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      router.push(`/results/${data.sessionId}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-surface-900">
          New candidate analysis
        </h1>
        <p className="mt-2 text-sm text-surface-600">
          Describe the role, upload resumes or a LinkedIn CSV, and analyze candidates with your local Ollama model.
        </p>
        <OllamaStatus className="mt-3" />

        <section className="mt-10 space-y-6">
          <div>
            <label htmlFor="jd" className="block text-sm font-medium text-surface-700">
              Job description / What you&apos;re looking for
            </label>
            <textarea
              id="jd"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or write exactly what you're looking for in a candidate..."
              rows={6}
              className="mt-2 w-full resize-y rounded-lg border border-surface-200 px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiltersSection filters={filters} onChange={setFilters} />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700">
              Upload resumes or CSV
            </label>
            <div className="mt-2">
              <FileUpload
                onParseComplete={setCandidates}
                disabled={analyzing}
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !jobDescription.trim() || candidates.length === 0}
            className="rounded-lg bg-surface-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? 'Analyzing…' : `Analyze ${candidates.length} candidate(s)`}
          </button>
          {analyzing && (
            <p className="text-sm text-surface-500">
              This may take a few minutes. Each candidate is evaluated locally.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
