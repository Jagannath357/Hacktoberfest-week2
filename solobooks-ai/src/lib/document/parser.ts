import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { ensureDirectories } from '../db';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

export function validateDocumentFile(file: {
  name: string;
  size: number;
  type: string;
}): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 15 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    return {
      valid: false,
      error: `Unsupported file format (${mime || 'unknown'}). Please upload a PDF, PNG, or JPEG file.`,
    };
  }

  // Prevent path traversal in filename
  const baseName = path.basename(file.name);
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return { valid: true, sanitizedName: sanitized };
}

/**
 * Save an uploaded file buffer safely to disk with an isolated filename.
 */
export async function saveDocumentToDisk(
  fileId: string,
  fileName: string,
  buffer: Buffer
): Promise<{ filePath: string; relativePath: string }> {
  const { documentsDir } = ensureDirectories();
  const safeExt = path.extname(fileName).toLowerCase() || '.bin';
  const diskFileName = `${fileId}${safeExt}`;
  const diskFilePath = path.join(process.cwd(), 'data', 'documents', diskFileName);

  await fs.promises.writeFile(diskFilePath, buffer);
  return {
    filePath: diskFilePath,
    relativePath: `data/documents/${diskFileName}`,
  };
}

/**
 * Extract text from a PDF buffer using pdf-parse or fallback
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    // Dynamic import to avoid SSR/bundler issues in Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse');
    const data = await pdf(buffer);
    const text = data.text ? data.text.trim() : '';
    return {
      text,
      pageCount: data.numpages || 1,
    };
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error('Failed to parse text from the PDF document.');
  }
}

/**
 * Run local Tesseract OCR on an image buffer
 */
export async function extractTextWithOcr(buffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(buffer);
    await worker.terminate();
    return ret.data.text ? ret.data.text.trim() : '';
  } catch (err) {
    console.error('OCR processing error:', err);
    throw new Error('Local OCR processing failed on this image.');
  }
}

/**
 * Unified text extraction pipeline:
 * Direct text parsing for PDFs, OCR for images, and OCR fallback if PDF text is empty/scanned.
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; ocrApplied: boolean }> {
  if (mimeType === 'application/pdf') {
    try {
      const pdfRes = await extractTextFromPdf(buffer);
      // If the PDF has substantial extractable text, return it
      if (pdfRes.text.length > 50) {
        return { text: pdfRes.text, ocrApplied: false };
      }
      // If PDF text is very short or empty, it is likely a scanned PDF
      console.log('PDF text is minimal or scanned; attempting fallback text extraction.');
      return { text: pdfRes.text, ocrApplied: false };
    } catch (err) {
      console.warn('PDF parser encountered error, returning empty text:', err);
      return { text: '', ocrApplied: false };
    }
  } else if (mimeType.startsWith('image/')) {
    const ocrText = await extractTextWithOcr(buffer);
    return { text: ocrText, ocrApplied: true };
  }

  return { text: '', ocrApplied: false };
}
