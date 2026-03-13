const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export interface OllamaGenerateOptions {
  model?: string;
  prompt: string;
  stream?: boolean;
  format?: 'json';
}

export interface OllamaResponse {
  response: string;
  done: boolean;
}

export async function ollamaGenerate(options: OllamaGenerateOptions): Promise<string> {
  const { model = DEFAULT_MODEL, prompt, stream = false, format } = options;
  const url = `${OLLAMA_BASE}/api/generate`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream,
      format,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama request failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as OllamaResponse & { response?: string };
  return data.response || '';
}

export async function checkOllamaHealth(): Promise<{ ok: boolean; models?: string[] }> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { method: 'GET' });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { models?: { name: string }[] };
    const models = data.models?.map((m) => m.name) ?? [];
    return { ok: true, models };
  } catch {
    return { ok: false };
  }
}

export function getDefaultModel(): string {
  return DEFAULT_MODEL;
}
