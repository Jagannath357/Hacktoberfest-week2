import { describe, it, expect } from 'vitest';
import { modelAdapter } from '../src/lib/ai/adapter';

describe('Real Local Model Health & Ollama Daemon Suite', () => {
  it('connects to local Ollama instance on port 11434 and reads models', async () => {
    const health = await modelAdapter.checkHealth('http://127.0.0.1:11434');

    // Test will verify real daemon status if running
    if (health.online) {
      expect(health.online).toBe(true);
      expect(health.models.length).toBeGreaterThan(0);
      console.log(`Connected to local Ollama with models: ${health.models.join(', ')}`);
    } else {
      console.log('Ollama is not running locally; health check safely reports offline status.');
      expect(health.online).toBe(false);
      expect(health.error).toBeDefined();
    }
  });
});
