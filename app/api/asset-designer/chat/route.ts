import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_ASSET_DESIGNER_MODEL_DEFAULT } from '@/lib/openai/config';

const ALLOWED_MODELS = new Set([
  'gpt-5',
  'o1-pro',
  'o3',
  'o4-mini',
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
]);

const SceneNodeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['factory', 'warehouse', 'truck', 'store']),
  label: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
});

const SceneEdgeSchema = z.object({
  id: z.string().min(1).optional(),
  source: z.string().min(1),
  target: z.string().min(1),
});

const SceneSchema = z.object({
  nodes: z.array(SceneNodeSchema),
  edges: z.array(SceneEdgeSchema),
});

function extractSceneBlock(text: string): {
  message: string;
  scene: unknown | null;
} {
  const match = text.match(/---SCENE---\s*([\s\S]*?)\s*---END---/);
  if (!match) {
    return { message: text.trim(), scene: null };
  }

  const raw = match[1]?.trim();
  let scene: unknown = null;
  try {
    scene = raw ? JSON.parse(raw) : null;
  } catch {
    scene = null;
  }

  const message = text.replace(/---SCENE---[\s\S]*---END---/, '').trim();
  return { message, scene };
}

export async function POST(req: Request) {
  try {
    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const body = await req.json();
    const message = body?.message;
    const history = body?.history;
    const scene = body?.scene;
    const requestedModel = body?.model;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const fallbackModelName = OPENAI_ASSET_DESIGNER_MODEL_DEFAULT;
    const modelName =
      typeof requestedModel === 'string' && ALLOWED_MODELS.has(requestedModel)
        ? requestedModel
        : fallbackModelName;

    const historyText = Array.isArray(history)
      ? history
          .slice(-12)
          .map((msg: { role: string; content: string }) => {
            const role = msg?.role === 'user' ? 'User' : 'Assistant';
            const content = typeof msg?.content === 'string' ? msg.content : '';
            return `${role}: ${content}`;
          })
          .join('\n')
      : '';

    const sceneText = scene
      ? JSON.stringify(scene)
      : JSON.stringify({ nodes: [], edges: [] });

    const promptText = `You are an isometric asset/animation designer for supply-chain scenes.

You will help the user iterate on an isometric 3D-style illustration and simple animation plan.

CURRENT SCENE (JSON):
${sceneText}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ''}

USER MESSAGE: ${message}

OUTPUT RULES:
- Always respond with helpful text.
- If the user is asking to add/remove/rearrange items in the scene, include a SCENE JSON block at the end.
- SCENE JSON must match:
  {
    "nodes": [{"id": string, "kind": "factory"|"warehouse"|"truck"|"store", "label": string, "position": {"x": number, "y": number}}],
    "edges": [{"id"?: string, "source": string, "target": string}]
  }
- Keep node ids stable when possible; only create new ids for new nodes.

Include the scene block exactly like this (only when changing the scene):
---SCENE---
{...json...}
---END---
`;

    let text: string;
    try {
      const result = await generateText({
        model: openai(modelName),
        prompt: promptText,
      });
      text = result.text;
    } catch (err) {
      if (modelName !== fallbackModelName) {
        const retry = await generateText({
          model: openai(fallbackModelName),
          prompt: promptText,
        });
        text = retry.text;
      } else {
        throw err;
      }
    }

    const extracted = extractSceneBlock(text);

    let validatedScene: z.infer<typeof SceneSchema> | null = null;
    if (extracted.scene) {
      const parsed = SceneSchema.safeParse(extracted.scene);
      if (parsed.success) {
        validatedScene = parsed.data;
      }
    }

    return NextResponse.json({
      message: extracted.message,
      scene: validatedScene,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process chat',
      },
      { status: 500 },
    );
  }
}
