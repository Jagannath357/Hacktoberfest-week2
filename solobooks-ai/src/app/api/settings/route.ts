import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSetting } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { defaultCurrency, ollamaEndpoint, selectedModel, theme } = body;

    if (defaultCurrency) {
      await updateSetting('default_currency', defaultCurrency);
    }
    if (ollamaEndpoint) {
      await updateSetting('ollama_endpoint', ollamaEndpoint.trim());
    }
    if (selectedModel) {
      await updateSetting('selected_model', selectedModel.trim());
    }
    if (theme) {
      await updateSetting('theme', theme);
    }

    const updated = await getSettings();
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
