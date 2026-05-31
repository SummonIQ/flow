import { getOpenAIClient } from './client';
import { OPENAI_EMBEDDING_MODEL_DEFAULT } from './config';

export async function createEmbeddingVector(
  input: string,
  model: string = OPENAI_EMBEDDING_MODEL_DEFAULT,
): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model,
    input,
  });
  const vector = response.data?.[0]?.embedding;
  if (!vector) {
    throw new Error('OpenAI embedding response missing data.');
  }
  return vector;
}

export async function createEmbeddingVectors(
  input: string[],
  model: string = OPENAI_EMBEDDING_MODEL_DEFAULT,
): Promise<number[][]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model,
    input,
  });
  const vectors = response.data?.map(item => item.embedding) ?? [];
  if (vectors.length !== input.length) {
    throw new Error('OpenAI embedding response size mismatch.');
  }
  return vectors;
}
