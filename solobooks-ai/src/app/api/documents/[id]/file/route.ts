import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/db';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doc = await getDocumentById(id);
    if (!doc || !doc.filePath || !fs.existsSync(doc.filePath)) {
      return NextResponse.json({ error: 'Document file not found on disk' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(doc.filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
