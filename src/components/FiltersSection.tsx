'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoleFilters } from '@/types';

interface FiltersSectionProps {
  filters: RoleFilters;
  onChange: (filters: RoleFilters) => void;
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded bg-surface-50/80 px-2 py-1.5">
      {value.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[12px] ring-1 ring-surface-200/80"
        >
          {v}
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-surface-400 hover:text-surface-600"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-[80px] flex-1 border-0 bg-transparent p-0.5 text-[12px] outline-none placeholder:text-surface-400"
      />
    </div>
  );
}

export function FiltersSection({ filters, onChange }: FiltersSectionProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<RoleFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const activeCount = [
    (filters.requiredSkills?.length ?? 0) > 0,
    (filters.preferredSkills?.length ?? 0) > 0,
    !!filters.location?.trim(),
    filters.yearsExperience?.min != null || filters.yearsExperience?.max != null,
    (filters.education?.length ?? 0) > 0,
    (filters.industry?.length ?? 0) > 0,
    (filters.seniority?.length ?? 0) > 0,
    (filters.dealbreakers?.length ?? 0) > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[13px] text-surface-500 hover:text-surface-700"
      >
        {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''}` : 'Add filters'}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-80 rounded-md bg-white py-3 px-3 shadow-lg ring-1 ring-surface-200">
          <div className="space-y-3 text-[12px]">
            <div>
              <p className="mb-1 text-surface-400">Required skills</p>
              <TagsInput
                value={filters.requiredSkills || []}
                onChange={(v) => update({ requiredSkills: v })}
                placeholder="Add"
              />
            </div>
            <div>
              <p className="mb-1 text-surface-400">Preferred skills</p>
              <TagsInput
                value={filters.preferredSkills || []}
                onChange={(v) => update({ preferredSkills: v })}
                placeholder="Add"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-surface-400">Exp min</p>
                <input
                  type="number"
                  min={0}
                  value={filters.yearsExperience?.min ?? ''}
                  onChange={(e) =>
                    update({
                      yearsExperience: {
                        ...filters.yearsExperience,
                        min: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      },
                    })
                  }
                  placeholder="—"
                  className="w-full rounded bg-surface-50/80 px-2 py-1 text-[12px] ring-1 ring-surface-200/80"
                />
              </div>
              <div>
                <p className="mb-1 text-surface-400">Exp max</p>
                <input
                  type="number"
                  min={0}
                  value={filters.yearsExperience?.max ?? ''}
                  onChange={(e) =>
                    update({
                      yearsExperience: {
                        ...filters.yearsExperience,
                        max: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      },
                    })
                  }
                  placeholder="—"
                  className="w-full rounded bg-surface-50/80 px-2 py-1 text-[12px] ring-1 ring-surface-200/80"
                />
              </div>
            </div>
            <div>
              <p className="mb-1 text-surface-400">Location</p>
              <input
                type="text"
                value={filters.location ?? ''}
                onChange={(e) => update({ location: e.target.value || undefined })}
                placeholder="Remote, SF, etc."
                className="w-full rounded bg-surface-50/80 px-2 py-1 text-[12px] ring-1 ring-surface-200/80"
              />
            </div>
            <div>
              <p className="mb-1 text-surface-400">Education</p>
              <TagsInput
                value={filters.education || []}
                onChange={(v) => update({ education: v })}
                placeholder="Add"
              />
            </div>
            <div>
              <p className="mb-1 text-surface-400">Industry</p>
              <TagsInput
                value={filters.industry || []}
                onChange={(v) => update({ industry: v })}
                placeholder="Add"
              />
            </div>
            <div>
              <p className="mb-1 text-surface-400">Seniority</p>
              <TagsInput
                value={filters.seniority || []}
                onChange={(v) => update({ seniority: v })}
                placeholder="Add"
              />
            </div>
            <div>
              <p className="mb-1 text-surface-400">Dealbreakers</p>
              <TagsInput
                value={filters.dealbreakers || []}
                onChange={(v) => update({ dealbreakers: v })}
                placeholder="Add"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
