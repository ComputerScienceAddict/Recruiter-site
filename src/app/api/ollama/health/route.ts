import { NextResponse } from 'next/server';
import { checkOllamaHealth, getDefaultModel } from '@/lib/ollama';

export async function GET() {
  try {
    const { ok, models } = await checkOllamaHealth();
    return NextResponse.json({
      ok,
      models: models ?? [],
      defaultModel: getDefaultModel(),
    });
  } catch {
    return NextResponse.json({
      ok: false,
      models: [],
      defaultModel: getDefaultModel(),
    });
  }
}
