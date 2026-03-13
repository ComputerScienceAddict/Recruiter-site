'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-surface-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-medium tracking-tight text-surface-900"
        >
          Screen
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-surface-600 hover:text-surface-900"
          >
            New Analysis
          </Link>
          <Link
            href="/sessions"
            className="text-sm text-surface-600 hover:text-surface-900"
          >
            Sessions
          </Link>
        </div>
      </div>
    </nav>
  );
}
