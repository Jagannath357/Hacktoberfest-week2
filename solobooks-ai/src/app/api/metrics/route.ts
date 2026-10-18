import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics, getSettings } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const settings = await getSettings();
    const currency = searchParams.get('currency') || settings.defaultCurrency || 'INR';

    const metrics = await getDashboardMetrics(currency);
    return NextResponse.json(metrics);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
