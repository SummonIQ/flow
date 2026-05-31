const DEFAULT_OPENAI_TIMEOUT_MS = 50_000;
const DEFAULT_OPENAI_MAX_RETRIES = 2;

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const OPENAI_CHAT_MODEL_DEFAULT =
  process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini';
export const OPENAI_EMBEDDING_MODEL_DEFAULT =
  process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';

export const OPENAI_ASSISTANT_MODEL_DEFAULT =
  process.env.OPENAI_ASSISTANT_MODEL ?? 'gpt-4-turbo-preview';
export const OPENAI_COMPONENT_REVISION_MODEL_DEFAULT =
  process.env.OPENAI_COMPONENT_REVISION_MODEL ?? 'gpt-4-turbo-preview';
export const OPENAI_SUMMARY_MODEL_DEFAULT =
  process.env.OPENAI_SUMMARY_MODEL ?? 'gpt-4o-mini';
export const OPENAI_AGENT_MODEL_DEFAULT =
  process.env.OPENAI_AGENT_MODEL ?? 'gpt-4';
export const OPENAI_SUGGEST_PROMPT_MODEL_DEFAULT =
  process.env.OPENAI_SUGGEST_PROMPT_MODEL ?? 'gpt-4-turbo';
export const OPENAI_EVENT_HANDLER_MODEL_DEFAULT =
  process.env.OPENAI_EVENT_HANDLER_MODEL ?? 'gpt-4o';
export const OPENAI_GENERATE_MODEL_DEFAULT =
  process.env.OPENAI_GENERATE_MODEL ?? 'gpt-4o';
export const OPENAI_CHAT_DESIGN_MODEL_DEFAULT =
  process.env.OPENAI_CHAT_DESIGN_MODEL ?? 'gpt-4o';
export const OPENAI_ASSET_DESIGNER_MODEL_DEFAULT =
  process.env.OPENAI_ASSET_DESIGNER_MODEL ?? 'gpt-4o-mini';
export const OPENAI_LOGO_CHAT_MODEL_DEFAULT =
  process.env.OPENAI_LOGO_CHAT_MODEL ?? 'gpt-4-turbo';

export const OPENAI_TIMEOUT_MS = parseNumber(
  process.env.OPENAI_TIMEOUT_MS,
  DEFAULT_OPENAI_TIMEOUT_MS,
);

export const OPENAI_MAX_RETRIES = parseNumber(
  process.env.OPENAI_MAX_RETRIES,
  DEFAULT_OPENAI_MAX_RETRIES,
);
