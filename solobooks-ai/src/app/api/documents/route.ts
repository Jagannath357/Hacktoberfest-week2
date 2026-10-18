import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, insertDocument, getSettings } from '@/lib/db';
import {
  validateDocumentFile,
  saveDocumentToDisk,
  extractDocumentText,
} from '@/lib/document/parser';
import { modelAdapter } from '@/lib/ai/adapter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const documents = await getDocuments(status);
    return NextResponse.json(documents);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file provided in request.' }, { status: 400 });
    }

    // 1. Safe file validation
    const validation = validateDocumentFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const fileId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Save document binary safely to quarantined disk directory
    const { filePath } = await saveDocumentToDisk(
      fileId,
      validation.sanitizedName || file.name,
      buffer
    );

    // 3. Extract text via PDF parser or Tesseract OCR
    const extractionResult = await extractDocumentText(buffer, file.type);
    const extractedText = extractionResult.text;

    // 4. Run local model extraction on extracted text
    const settings = await getSettings();
    let extractedData = null;

    if (extractedText && extractedText.trim().length > 0) {
      extractedData = await modelAdapter.extractDocument(extractedText, {
        endpoint: settings.ollamaEndpoint,
        model: settings.selectedModel,
      });
    }

    // 5. Insert document record in SQLite with 'pending' review status
    const docRecord = await insertDocument({
      id: fileId,
      fileName: validation.sanitizedName || file.name,
      filePath,
      fileSize: file.size,
      mimeType: file.type,
      extractedText: extractedText || null,
      ocrApplied: extractionResult.ocrApplied,
      reviewStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      document: docRecord,
      extractedData,
    });
  } catch (err: unknown) {
    console.error('Document import failed:', err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
