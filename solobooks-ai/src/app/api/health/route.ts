import { NextResponse } from 'next/server';
import { modelAdapter } from '@/lib/ai/adapter';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    const aiHealth = await modelAdapter.checkHealth(settings.ollamaEndpoint);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ai: {
        online: aiHealth.online,
        endpoint: aiHealth.endpoint,
        availableModels: aiHealth.models,
        selectedModel: settings.selectedModel,
        recommendedModel: aiHealth.recommendedModel,
        error: aiHealth.error || null,
      },
      settings: {
        defaultCurrency: settings.defaultCurrency,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: 'error',
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
