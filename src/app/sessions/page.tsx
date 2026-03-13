'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { listSessions } from '@/lib/storage';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<{ id: string; jobDescription: string; createdAt: string; candidateCount: number }[]>([]);

  useEffect(() => {
    setSessions(listSessions().reverse());
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-surface-900">
          Past sessions
        </h1>
        <p className="mt-2 text-sm text-surface-600">
          Reopen a previous analysis (stored in this browser session).
        </p>

        {sessions.length === 0 ? (
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
                  <p className="text-sm text-surface-900">{s.jobDescription.slice(0, 150)}{s.jobDescription.length > 150 ? '…' : ''}</p>
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
