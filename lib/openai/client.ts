import OpenAI from 'openai';
import { OPENAI_MAX_RETRIES, OPENAI_TIMEOUT_MS } from './config';

export const OPENAI_API_KEY_ERROR =
  'OPENAI_API_KEY not configured. Add it to your .env file.';

export function getOpenAIKey(): string | null {
  const raw = process.env.OPENAI_API_KEY;
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function requireOpenAIKey(): string {
  const key = getOpenAIKey();
  if (!key) {
    throw new Error(OPENAI_API_KEY_ERROR);
  }
  return key;
}

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = requireOpenAIKey();
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: OPENAI_MAX_RETRIES,
    });
  }
  return cachedClient;
}
