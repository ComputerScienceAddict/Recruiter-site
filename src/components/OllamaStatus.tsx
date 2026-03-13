'use client';

import { useEffect, useState } from 'react';

interface OllamaStatusProps {
  className?: string;
}

export function OllamaStatus({ className = '' }: OllamaStatusProps) {
  const [status, setStatus] = useState<{ ok: boolean; models?: string[] } | null>(null);

  useEffect(() => {
    fetch('/api/ollama/health')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ ok: false }));
  }, []);

  if (!status) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs ${className}`}
      title={status.ok ? `Models: ${status.models?.join(', ') ?? 'N/A'}` : 'Ollama not running'}
    >
      <span
        className={`h-2 w-2 rounded-full ${status.ok ? 'bg-green-500' : 'bg-amber-500'}`}
      />
      <span className={status.ok ? 'text-surface-500' : 'text-amber-600'}>
        {status.ok ? 'Ollama connected' : 'Ollama not detected — start it locally'}
      </span>
    </div>
  );
}
