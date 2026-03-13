'use client';

import { useCallback, useState } from 'react';
import type { ParsedCandidate } from '@/types';

const ACCEPT = '.pdf,.docx,.txt,.csv';
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface FileUploadProps {
  onParseComplete: (candidates: ParsedCandidate[]) => void;
  disabled?: boolean;
}

export function FileUpload({ onParseComplete, disabled }: FileUploadProps) {
  const [status, setStatus] = useState<'idle' | 'dragging' | 'uploading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid = arr.filter((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'docx', 'txt', 'csv'].includes(ext || '')) return false;
        if (f.size > MAX_SIZE) return false;
        return true;
      });

      if (valid.length === 0) {
        setStatus('error');
        setMessage('No valid files. Use PDF, DOCX, TXT, or CSV (max 20MB each).');
        return;
      }

      setStatus('uploading');
      setMessage(`Parsing ${valid.length} file(s)...`);
      setFileNames(valid.map((f) => f.name));

      const formData = new FormData();
      valid.forEach((f) => formData.append('files', f));

      try {
        const res = await fetch('/api/upload/parse', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Parse failed');
        }

        onParseComplete(data.candidates as ParsedCandidate[]);
        setStatus('done');
        setMessage(`${data.total} candidate(s) extracted.`);
      } catch (e) {
        setStatus('error');
        setMessage((e as Error).message);
      }
    },
    [onParseComplete]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setStatus('idle');
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setStatus('dragging');
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setStatus('idle');
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      setStatus('idle');
      handleFiles(files);
      e.target.value = '';
    },
    [handleFiles]
  );

  const clear = useCallback(() => {
    setStatus('idle');
    setMessage('');
    setFileNames([]);
    onParseComplete([]);
  }, [onParseComplete]);

  const isActive = status === 'dragging' || status === 'uploading';

  return (
    <div className="space-y-2">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
          ${isActive ? 'border-surface-400 bg-surface-100' : 'border-surface-300 bg-white'}
          ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-surface-400'}
          transition-colors
        `}
      >
        <input
          type="file"
          accept={ACCEPT}
          multiple
          onChange={onInputChange}
          disabled={disabled}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {status === 'uploading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-300 border-t-surface-700" />
          </div>
        )}
        {status !== 'uploading' && (
          <div className="text-center">
            <p className="text-sm font-medium text-surface-700">
              {status === 'dragging'
                ? 'Drop files here'
                : 'Drag resumes or CSV here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-surface-500">
              PDF, DOCX, TXT, or LinkedIn CSV
            </p>
          </div>
        )}
      </div>
      {fileNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {fileNames.map((n) => (
            <span
              key={n}
              className="rounded bg-surface-100 px-2 py-1 text-xs text-surface-600"
            >
              {n}
            </span>
          ))}
          <button
            type="button"
            onClick={clear}
            className="text-xs text-surface-500 hover:text-surface-800"
          >
            Clear
          </button>
        </div>
      )}
      {message && (
        <p
          className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-surface-600'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
