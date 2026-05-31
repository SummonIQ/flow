import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_LOGO_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MAX_CURRENT_SVG_CHARS = 8000;

function buildCurrentLogoContext(
  currentSvg: unknown,
  logoPrompt: unknown,
): string {
  const prompt = typeof logoPrompt === 'string' ? logoPrompt.trim() : '';

  if (typeof currentSvg !== 'string' || currentSvg.trim().length === 0) {
    return prompt
      ? `CURRENT LOGO PROMPT:\n${prompt}\n\nNo logo SVG is available in context. If the user asks for changes, use the prompt + conversation to create a clean vector SVG.`
      : 'No logo exists yet. If the user asks for a logo, create one from scratch.';
  }

  const svg = currentSvg.trim();
  const isEmbeddedRaster =
    /data:image\/(png|jpe?g|webp);base64,/i.test(svg) ||
    /<image\b[\s\S]*?href=\"data:image\//i.test(svg) ||
    /<image\b[\s\S]*?href='data:image\//i.test(svg);

  if (isEmbeddedRaster || svg.length > MAX_CURRENT_SVG_CHARS) {
    return [
      'CURRENT LOGO NOTE:',
      '- The current logo SVG is very large and/or contains an embedded raster image (base64).',
      '- Do NOT attempt to edit embedded image pixels.',
      '- If the user asks for changes, recreate a new clean vector SVG (paths/shapes) that matches the intent and style.',
      prompt ? `- Original generation prompt:\n  ${prompt}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }

  return `CURRENT LOGO SVG:\n${svg}\n\nIf the user asks for changes, modify THIS logo.`;
}

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      currentSvg,
      logoPrompt,
      colors,
      projectName,
      model,
      style = 'modern',
      mood = 'professional',
      complexity = 'medium',
    } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 },
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const modelName =
      typeof model === 'string' && model.trim().length > 0
        ? model
        : OPENAI_LOGO_CHAT_MODEL_DEFAULT;

    // Build context about the project and current state
    const colorInfo =
      colors && colors.length > 0
        ? `\n\nBrand Colors: ${colors.join(', ')}`
        : '';

    const currentLogoContext = buildCurrentLogoContext(currentSvg, logoPrompt);

    const systemPrompt = `You are an expert logo mark designer and SVG engineer.

PROJECT CONTEXT:
- Project: ${projectName}
- Style: ${style}
- Mood: ${mood}
- Complexity: ${complexity}${colorInfo}

PRIMARY GOAL:
Help the user arrive at a high-quality, iconic SVG logo symbol (not clip-art). Strong silhouette, clean geometry, professional proportions.

CRITICAL OUTPUT RULES:
- When generating/modifying a logo: output ONLY raw SVG (no markdown, no backticks, no explanations).
- The SVG must start with <svg and end with </svg>.
- Use <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">.

QUALITY RULES:
- Icon/symbol only. NO text elements unless the user explicitly requests text.
- Avoid noise: no filters, no blur, no drop shadows, no complex patterns.
- Prefer one clear idea:
  - simple: 1-2 shapes
  - medium: 2-4 shapes
  - complex: 4-6 shapes
- Use consistent strokes if used: stroke-width 10-16, stroke-linecap/linejoin round.
- Keep ~20px padding from edges; nothing touches the bounds.
- Flat design: solid fills preferred. Gradients are optional and must be subtle (2 stops max).

COLOR RULES:
- If brand colors are provided, use at most 2 of them + optional neutral (#0B0F19 or #FFFFFF).
- Do not invent many new colors.

CONVERSATION RULES:
- When the user asks for changes, modify the CURRENT LOGO SVG if present.
- When not generating/modifying, you may respond normally, but keep responses concise.

${currentLogoContext}`;

    // Prepare messages for the API
    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const result = await generateText({
      model: openai(modelName),
      messages: apiMessages,
      temperature: 0.4,
    });

    const responseText = result.text;

    // Extract SVG from response if present
    const svgMatch = responseText.match(/<svg[\s\S]*?<\/svg>/i);
    const newSvg = svgMatch ? svgMatch[0] : null;

    return NextResponse.json({
      message: responseText,
      svg: newSvg,
    });
  } catch (error) {
    console.error('Error in logo chat:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to process chat',
      },
      { status: 500 },
    );
  }
}



