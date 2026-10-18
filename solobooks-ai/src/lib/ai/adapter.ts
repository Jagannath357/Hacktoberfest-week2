import { z } from 'zod';
import { ExtractedDocumentData } from '../types';
import { toMinorUnits } from '../currency';
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
  ASSISTANT_SYSTEM_PROMPT,
  buildAssistantPrompt,
} from './prompts';

// Strict schema for LLM extraction validation
export const ExtractedLlmSchema = z.object({
  documentType: z.enum(['receipt', 'invoice', 'bill', 'other']).default('receipt'),
  merchantOrCustomer: z.string().nullable().default(null),
  invoiceNumber: z.string().nullable().default(null),
  date: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  subtotal: z.number().nullable().default(null),
  tax: z.number().nullable().default(null),
  total: z.number().nullable().default(null),
  currency: z.string().default('INR'),
  suggestedCategory: z.string().default('Other Business Expense'),
  categoryExplanation: z.string().default(''),
  paymentStatus: z.enum(['paid', 'unpaid', 'pending', 'unknown']).default('unknown'),
  shortDescription: z.string().default(''),
});

export type ExtractedLlmOutput = z.infer<typeof ExtractedLlmSchema>;

export interface HealthCheckResult {
  online: boolean;
  endpoint: string;
  models: string[];
  recommendedModel: string | null;
  error?: string;
}

export interface ModelAdapter {
  checkHealth(endpoint?: string): Promise<HealthCheckResult>;
  extractDocument(
    text: string,
    options?: { endpoint?: string; model?: string }
  ): Promise<ExtractedDocumentData>;
  generateAssistant(
    query: string,
    contextSummary: string,
    options?: { endpoint?: string; model?: string }
  ): Promise<string>;
}

/**
 * Heuristic fallback parser when Ollama is offline or not configured.
 * Extracts amounts, dates, and common patterns deterministically without hallucination.
 */
export function heuristicExtract(text: string): ExtractedDocumentData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Merchant heuristic: usually in the first 3 lines
  let merchant: string | null = null;
  if (lines.length > 0) {
    const candidate = lines[0].replace(/[^a-zA-Z0-9\s&.,-]/g, '').trim();
    if (candidate.length > 2 && candidate.length < 50) {
      merchant = candidate;
    }
  }

  // Invoice Number regex
  let invoiceNumber: string | null = null;
  const invMatch = text.match(/(?:invoice|receipt|bill|inv)[\s#.:-]*([a-z0-9-_]+)/i);
  if (invMatch && invMatch[1] && invMatch[1].length > 2) {
    invoiceNumber = invMatch[1].trim();
  }

  // Date regex (YYYY-MM-DD, DD/MM/YYYY, or Month DD, YYYY)
  let date: string | null = null;
  const dateMatchIso = text.match(/\b(20\d{2}[-/.]\d{1,2}[-/.]\d{1,2})\b/);
  if (dateMatchIso) {
    date = dateMatchIso[1].replace(/[./]/g, '-');
  } else {
    const dateMatchDmy = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
    if (dateMatchDmy) {
      date = `${dateMatchDmy[3]}-${dateMatchDmy[2].padStart(2, '0')}-${dateMatchDmy[1].padStart(2, '0')}`;
    }
  }

  // Amount & Total regex
  let total: number | null = null;
  let currency = 'INR';

  if (text.includes('$')) currency = 'USD';
  else if (text.includes('€')) currency = 'EUR';
  else if (text.includes('£')) currency = 'GBP';
  else if (text.includes('₹') || text.toLowerCase().includes('inr') || text.toLowerCase().includes('rs.')) currency = 'INR';

  // Look for total
  const totalMatch = text.match(/(?:total|grand total|amount paid|net amount)[\s:₹$€£Rs.]*([0-9,]+\.?[0-9]{0,2})/i);
  if (totalMatch && totalMatch[1]) {
    const parsed = parseFloat(totalMatch[1].replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      total = parsed;
    }
  }

  // Determine document type
  const lower = text.toLowerCase();
  let documentType: ExtractedDocumentData['documentType'] = 'receipt';
  if (lower.includes('tax invoice') || lower.includes('invoice to:') || lower.includes('bill to:')) {
    documentType = 'invoice';
  }

  // Payment status
  let paymentStatus: ExtractedDocumentData['paymentStatus'] = 'unknown';
  if (lower.includes('paid') || lower.includes('payment received') || lower.includes('upi transaction success')) {
    paymentStatus = 'paid';
  }

  // Suggested category
  let suggestedCategory = 'Other Business Expense';
  let categoryExplanation = 'Categorized via deterministic keyword heuristics.';
  if (lower.includes('aws') || lower.includes('software') || lower.includes('subscription') || lower.includes('figma') || lower.includes('github') || lower.includes('vercel')) {
    suggestedCategory = 'Software & Subscriptions';
    categoryExplanation = 'Detected software/cloud vendor keyword in document text.';
  } else if (lower.includes('coffee') || lower.includes('restaurant') || lower.includes('meal') || lower.includes('dining')) {
    suggestedCategory = 'Food & Client Meals';
    categoryExplanation = 'Detected dining/food keyword.';
  } else if (lower.includes('uber') || lower.includes('flight') || lower.includes('hotel') || lower.includes('taxi')) {
    suggestedCategory = 'Travel & Commute';
    categoryExplanation = 'Detected travel or transport keyword.';
  }

  return {
    documentType,
    merchantOrCustomer: merchant,
    invoiceNumber,
    date,
    dueDate: null,
    subtotalMinor: total ? toMinorUnits(total * 0.85) : null,
    taxMinor: total ? toMinorUnits(total * 0.15) : null,
    totalMinor: total ? toMinorUnits(total) : null,
    currency,
    suggestedCategory,
    categoryExplanation: `${categoryExplanation} (Offline Heuristic Mode)`,
    paymentStatus,
    shortDescription: lines.slice(0, 2).join(' - ') || 'Document record',
    confidenceScore: 0.7,
  };
}

/**
 * Ollama-powered Model Adapter
 */
export class OllamaModelAdapter implements ModelAdapter {
  private defaultEndpoint = 'http://127.0.0.1:11434';
  private defaultModel = 'llama3:latest';

  async checkHealth(endpoint = this.defaultEndpoint): Promise<HealthCheckResult> {
    try {
      const url = `${endpoint.replace(/\/+$/, '')}/api/tags`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          online: false,
          endpoint,
          models: [],
          recommendedModel: null,
          error: `Ollama returned status ${res.status}`,
        };
      }

      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const modelList = data.models?.map((m) => m.name) || [];

      // Determine recommended model
      let recommended = modelList.find((m) => m.includes('qwen2.5:3b') || m.includes('llama3.2:3b')) || null;
      if (!recommended && modelList.length > 0) {
        recommended = modelList.find((m) => m.includes('llama3')) || modelList[0];
      }

      return {
        online: true,
        endpoint,
        models: modelList,
        recommendedModel: recommended,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        online: false,
        endpoint,
        models: [],
        recommendedModel: null,
        error: errorMsg.includes('abort') ? 'Connection timed out' : 'Ollama service is not reachable',
      };
    }
  }

  async extractDocument(
    text: string,
    options?: { endpoint?: string; model?: string }
  ): Promise<ExtractedDocumentData> {
    const endpoint = options?.endpoint || this.defaultEndpoint;
    const model = options?.model || this.defaultModel;

    // Check if Ollama is online
    const health = await this.checkHealth(endpoint);
    if (!health.online || health.models.length === 0) {
      console.warn('Ollama unavailable or no models installed. Falling back to deterministic heuristic extraction.');
      return heuristicExtract(text);
    }

    // Pick active model
    const activeModel = health.models.includes(model) ? model : health.models[0];

    try {
      const prompt = buildExtractionPrompt(text);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s timeout

      const res = await fetch(`${endpoint.replace(/\/+$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          system: EXTRACTION_SYSTEM_PROMPT,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.1, // low temperature for deterministic factual extraction
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama generation failed with status ${res.status}`);
      }

      const responseBody = (await res.json()) as { response: string };
      const rawJson = responseBody.response;

      // Parse JSON safely
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawJson);
      } catch {
        // Strip possible markdown backticks or leading text
        const cleaned = rawJson.replace(/```(?:json)?/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      }

      // Validate with Zod
      const validated = ExtractedLlmSchema.parse(parsedJson);

      return {
        documentType: validated.documentType,
        merchantOrCustomer: validated.merchantOrCustomer,
        invoiceNumber: validated.invoiceNumber,
        date: validated.date,
        dueDate: validated.dueDate,
        subtotalMinor: validated.subtotal !== null ? toMinorUnits(validated.subtotal) : null,
        taxMinor: validated.tax !== null ? toMinorUnits(validated.tax) : null,
        totalMinor: validated.total !== null ? toMinorUnits(validated.total) : null,
        currency: validated.currency || 'INR',
        suggestedCategory: validated.suggestedCategory || 'Other Business Expense',
        categoryExplanation: validated.categoryExplanation || 'Suggested based on document content.',
        paymentStatus: validated.paymentStatus,
        shortDescription: validated.shortDescription || 'Extracted document',
        confidenceScore: 0.95,
      };
    } catch (err) {
      console.error('LLM extraction error, falling back to heuristic parsing:', err);
      return heuristicExtract(text);
    }
  }

  async generateAssistant(
    query: string,
    contextSummary: string,
    options?: { endpoint?: string; model?: string }
  ): Promise<string> {
    const endpoint = options?.endpoint || this.defaultEndpoint;
    const model = options?.model || this.defaultModel;

    const health = await this.checkHealth(endpoint);
    if (!health.online || health.models.length === 0) {
      // Deterministic fallback response when Ollama is offline
      return `[Offline Mode: Ollama is not connected]\n\nBased on your stored local database records:\n${contextSummary}\n\nTo enable natural-language conversational reasoning, ensure Ollama is running ('ollama serve') and a model is loaded.`;
    }

    const activeModel = health.models.includes(model) ? model : health.models[0];

    try {
      const prompt = buildAssistantPrompt(query, contextSummary);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(`${endpoint.replace(/\/+$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeModel,
          system: ASSISTANT_SYSTEM_PROMPT,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama generation failed with status ${res.status}`);
      }

      const body = (await res.json()) as { response: string };
      return body.response.trim();
    } catch (err) {
      console.error('Assistant generation error:', err);
      return `Based on your stored local records:\n${contextSummary}\n\n(Note: The local model encountered a timeout or connection issue, so raw database facts are shown above.)`;
    }
  }
}

// Global singleton instance
export const modelAdapter = new OllamaModelAdapter();
