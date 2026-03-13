'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';

interface Session {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateCount: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions ?? []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-surface-900">
          Past sessions
        </h1>
        <p className="mt-2 text-sm text-surface-600">
          Reopen a previous analysis to review candidates and export shortlists.
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-300 border-t-surface-700" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-12 rounded-lg border border-dashed border-surface-300 py-16 text-center">
            <p className="text-sm text-surface-500">No sessions yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-surface-900 hover:underline"
            >
              Start your first analysis →
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/results/${s.id}`}
                  className="block rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-surface-300 hover:bg-surface-50/50"
                >
                  <p className="text-sm text-surface-900">{s.jobDescription}</p>
                  <p className="mt-1 text-xs text-surface-500">
                    {s.candidateCount} candidates · {new Date(s.createdAt).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
