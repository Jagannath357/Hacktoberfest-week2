import { describe, it, expect } from 'vitest';
import {
  validateDocumentFile,
  MAX_FILE_SIZE_BYTES,
} from '../src/lib/document/parser';

describe('Document File Validation and Security Suite', () => {
  it('accepts valid PDF, PNG, and JPEG documents', () => {
    const pdfRes = validateDocumentFile({
      name: 'invoice_october.pdf',
      size: 500 * 1024,
      type: 'application/pdf',
    });
    expect(pdfRes.valid).toBe(true);
    expect(pdfRes.sanitizedName).toBe('invoice_october.pdf');

    const pngRes = validateDocumentFile({
      name: 'coffee_receipt.png',
      size: 200 * 1024,
      type: 'image/png',
    });
    expect(pngRes.valid).toBe(true);

    const jpegRes = validateDocumentFile({
      name: 'hardware_bill.jpeg',
      size: 800 * 1024,
      type: 'image/jpeg',
    });
    expect(jpegRes.valid).toBe(true);
  });

  it('rejects oversized files exceeding 15 MB limit', () => {
    const res = validateDocumentFile({
      name: 'huge_archive.pdf',
      size: MAX_FILE_SIZE_BYTES + 1024,
      type: 'application/pdf',
    });
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds the 15 MB limit');
  });

  it('rejects disallowed and potentially malicious file types', () => {
    const resScript = validateDocumentFile({
      name: 'exploit.sh',
      size: 1024,
      type: 'text/x-shellscript',
    });
    expect(resScript.valid).toBe(false);

    const resExe = validateDocumentFile({
      name: 'malware.exe',
      size: 2048,
      type: 'application/x-msdownload',
    });
    expect(resExe.valid).toBe(false);
  });

  it('sanitizes dangerous characters to prevent path traversal', () => {
    const res = validateDocumentFile({
      name: '../../../etc/passwd.pdf',
      size: 1024,
      type: 'application/pdf',
    });
    expect(res.valid).toBe(true);
    // Path traversal components should be stripped/sanitized
    expect(res.sanitizedName).not.toContain('..');
    expect(res.sanitizedName).not.toContain('/');
    expect(res.sanitizedName).not.toContain('\\');
  });
});
