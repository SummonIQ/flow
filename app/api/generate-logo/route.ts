import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { PNG } from 'pngjs';
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_LOGO_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';

function removeNearWhiteBackgroundFromPng(
  input: Buffer,
  options?: {
    hardThreshold?: number;
    softThreshold?: number;
  },
): Buffer {
  const hardThreshold = options?.hardThreshold ?? 6;
  const softThreshold = options?.softThreshold ?? 28;

  const png = PNG.sync.read(input);
  const { width, height, data } = png;
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let qh = 0;
  let qt = 0;

  const getD = (idx: number) => {
    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    return Math.max(255 - r, 255 - g, 255 - b);
  };

  const canSeed = (idx: number) => {
    const o = idx * 4;
    const a = data[o + 3];
    if (a === 0) return false;
    return getD(idx) <= softThreshold;
  };

  // Seed from border pixels
  for (let x = 0; x < width; x++) {
    const top = x;
    const bottom = (height - 1) * width + x;
    if (!visited[top] && canSeed(top)) {
      visited[top] = 1;
      queue[qt++] = top;
    }
    if (!visited[bottom] && canSeed(bottom)) {
      visited[bottom] = 1;
      queue[qt++] = bottom;
    }
  }

  for (let y = 0; y < height; y++) {
    const left = y * width;
    const right = y * width + (width - 1);
    if (!visited[left] && canSeed(left)) {
      visited[left] = 1;
      queue[qt++] = left;
    }
    if (!visited[right] && canSeed(right)) {
      visited[right] = 1;
      queue[qt++] = right;
    }
  }

  // Flood fill near-white region connected to edges
  while (qh < qt) {
    const idx = queue[qh++];
    const x = idx % width;
    const y = (idx / width) | 0;

    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x + 1 < width ? idx + 1 : -1,
      y > 0 ? idx - width : -1,
      y + 1 < height ? idx + width : -1,
    ];

    for (const n of neighbors) {
      if (n < 0 || visited[n]) continue;
      if (!canSeed(n)) continue;
      visited[n] = 1;
      queue[qt++] = n;
    }
  }

  // Apply alpha to visited pixels
  for (let idx = 0; idx < pixelCount; idx++) {
    if (!visited[idx]) continue;
    const o = idx * 4;
    const a = data[o + 3];
    if (a === 0) continue;
    const d = getD(idx);
    if (d <= hardThreshold) {
      data[o + 3] = 0;
      continue;
    }
    if (d <= softThreshold) {
      const t = (d - hardThreshold) / (softThreshold - hardThreshold);
      const factor = Math.max(0, Math.min(1, t));
      data[o + 3] = Math.round(a * factor * factor);
    }
  }

  return PNG.sync.write(png);
}

async function generateWithGeminiNanoBanana(
  model: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview',
  prompt: string,
  colors: string[],
  projectName: string,
  style: string,
  mood: string,
  complexity: string,
) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY)');
  }

  const colorInfo =
    colors && colors.length > 0
      ? ` Brand colors to use: ${colors.join(', ')}.`
      : ' Use a sophisticated color palette.';

  const promptLower = prompt.toLowerCase();
  const wantsText =
    promptLower.includes('text') ||
    promptLower.includes('name') ||
    promptLower.includes('letter') ||
    promptLower.includes('word') ||
    promptLower.includes(projectName.toLowerCase());

  const imagePrompt = `Flat vector app icon: ${prompt}

Single icon only, centered. Transparent background (PNG with alpha). No background color.
${style} style, ${mood} mood.
${colorInfo}
${complexity === 'simple' ? 'Very simple, minimal shapes' : complexity === 'complex' ? 'More detailed but still clean' : 'Moderate detail'}.
${wantsText ? `May include "${projectName}" text if essential` : 'No text or letters'}.

DO NOT include: mockups, 3D renders, photographic lighting, heavy shadows, frames, UI, multiple versions, or color swatches.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: imagePrompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Gemini image generation failed (${response.status}): ${text}`,
    );
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data: string; mimeType?: string };
        }>;
      };
    }>;
  };

  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const inlineData = parts.find(p => p.inlineData)?.inlineData;
  const base64Image = inlineData?.data;
  if (!base64Image) {
    throw new Error('No inline image returned from Gemini');
  }

  let processedBase64 = base64Image;
  try {
    const mimeType = inlineData?.mimeType;
    if (!mimeType || mimeType === 'image/png') {
      const inputPng = Buffer.from(base64Image, 'base64');
      const outputPng = removeNearWhiteBackgroundFromPng(inputPng);
      processedBase64 = outputPng.toString('base64');
    }
  } catch (error) {
    console.error('Failed to post-process Gemini PNG transparency:', error);
    // Fall back to original image
    processedBase64 = base64Image;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="200" height="200">
  <image href="data:image/png;base64,${processedBase64}" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  return NextResponse.json({ svg });
}

async function generateWithDallE(
  prompt: string,
  colors: string[],
  projectName: string,
  style: string,
  mood: string,
  complexity: string,
) {
  const openaiClient = getOpenAIClient();
  const styleDescriptions: Record<string, string> = {
    modern: 'sleek, contemporary, clean lines',
    minimalist: 'ultra-minimal, simple, lots of negative space',
    geometric: 'geometric shapes, mathematical precision, symmetrical',
    abstract: 'abstract, non-literal, artistic',
    tech: 'futuristic, digital, high-tech',
    elegant: 'refined, sophisticated, graceful',
    playful: 'fun, friendly, dynamic',
    corporate: 'professional, trustworthy, established',
  };

  const moodDescriptions: Record<string, string> = {
    professional: 'business-appropriate, serious',
    friendly: 'approachable, warm',
    bold: 'strong, confident, impactful',
    sophisticated: 'upscale, refined',
    innovative: 'cutting-edge, forward-thinking',
    trustworthy: 'reliable, stable',
    energetic: 'dynamic, vibrant',
    calm: 'peaceful, balanced',
  };

  const colorInfo =
    colors && colors.length > 0
      ? ` Brand colors to use: ${colors.join(', ')}.`
      : ' Use a sophisticated color palette.';

  // Check if the prompt explicitly asks for text/company name
  const promptLower = prompt.toLowerCase();
  const wantsText =
    promptLower.includes('text') ||
    promptLower.includes('name') ||
    promptLower.includes('letter') ||
    promptLower.includes('word') ||
    promptLower.includes(projectName.toLowerCase());

  // Frame as app icon to avoid design mockup behavior
  const dallePrompt = `App icon: ${prompt}

Flat vector icon only (clean geometric shapes, crisp edges), centered on solid white background.
${styleDescriptions[style]} style, ${moodDescriptions[mood]} mood.
${colorInfo}
${complexity === 'simple' ? 'Very simple, minimal shapes' : complexity === 'complex' ? 'Detailed, layered' : 'Moderate detail'}.
${wantsText ? `May include "${projectName}" text if essential` : 'No text or letters'}.

DO NOT include: mockups, 3D renders, gradients that look photographic, shadows, frames, presentations, UI, multiple versions, color swatches, or any text.`;

  try {
    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural', // More professional, less saturated than 'vivid'
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Create an SVG with the embedded image
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="200" height="200">
  <image href="data:image/png;base64,${base64Image}" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

    return NextResponse.json({ svg });
  } catch (error) {
    console.error('Error with DALL-E generation:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      colors,
      projectName,
      model,
      style = 'modern',
      mood = 'professional',
      complexity = 'medium',
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    const requestedModel =
      typeof model === 'string' && model.trim().length > 0
        ? model
        : OPENAI_LOGO_CHAT_MODEL_DEFAULT;

    // Gemini Nano Banana (native image generation)
    if (
      requestedModel === 'gemini-2.5-flash-image' ||
      requestedModel === 'gemini-3-pro-image-preview'
    ) {
      return await generateWithGeminiNanoBanana(
        requestedModel,
        prompt,
        colors,
        projectName,
        style,
        mood,
        complexity,
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    // If DALL-E 3 is selected, use image generation
    if (requestedModel === 'dall-e-3') {
      return await generateWithDallE(
        prompt,
        colors,
        projectName,
        style,
        mood,
        complexity,
      );
    }

    // Validate model for text-based generation
    const allowedModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'o1-preview'];
    const selectedModel = allowedModels.includes(requestedModel)
      ? requestedModel
      : OPENAI_LOGO_CHAT_MODEL_DEFAULT;

    // Check if prompt wants text
    const promptLower = prompt.toLowerCase();
    const wantsText =
      promptLower.includes('text') ||
      promptLower.includes('name') ||
      promptLower.includes('letter') ||
      promptLower.includes('word') ||
      promptLower.includes(projectName.toLowerCase());

    // Build complexity guidelines
    const complexityGuide = {
      simple:
        '1-2 primary shapes. Strong silhouette. No decoration. Clean geometry and generous negative space.',
      medium:
        '2-4 shapes max. One focal idea. Subtle internal cutouts/overlaps allowed. Keep it readable at 24px.',
      complex:
        '4-6 shapes max. Add structure via cutouts/overlaps, not extra decoration. Still must read at 24px.',
    };

    // Build style guidelines
    const styleGuide = {
      modern:
        'sleek, contemporary aesthetics with clean lines, subtle gradients, and minimalist forms',
      minimalist:
        'stripped-down, essential elements only with lots of negative space and simple geometric shapes',
      geometric:
        'precise mathematical shapes, angular forms, symmetry, and structured compositions',
      abstract:
        'non-representational forms, flowing shapes, artistic interpretation, and symbolic elements',
      tech: 'digital-forward, circuit-like patterns, futuristic elements, and cutting-edge aesthetics',
      elegant:
        'refined, sophisticated forms with graceful curves, balanced proportions, and luxury feel',
      playful:
        'friendly, approachable with rounded shapes, dynamic movement, and energetic composition',
      corporate:
        'professional, trustworthy with strong geometric foundations, stable forms, and polished execution',
    };

    // Build mood guidelines
    const moodGuide = {
      professional:
        'serious, competent, and business-appropriate with refined execution',
      friendly:
        'approachable, warm, and inviting with softer forms and welcoming colors',
      bold: 'strong, confident, and impactful with high contrast and commanding presence',
      sophisticated:
        'refined, cultured, and upscale with subtle details and premium feel',
      innovative:
        'forward-thinking, cutting-edge, and pioneering with unique forms',
      trustworthy:
        'reliable, stable, and secure with grounded forms and solid composition',
      energetic:
        'dynamic, vibrant, and active with movement and visual excitement',
      calm: 'peaceful, balanced, and serene with harmonious forms and soothing composition',
    };

    // Build the system prompt for SVG generation with customization
    const systemPrompt = `You are an expert logo mark designer who outputs ONLY valid SVG.

Goal: Create a high-quality, iconic logo symbol (not clip-art). Strong silhouette, clean geometry, and professional proportions.

CRITICAL OUTPUT RULES:
- Output ONLY raw SVG. No markdown, no backticks, no explanations.
- Must start with <svg and end with </svg>.
- Use: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">.

DESIGN RULES (QUALITY):
- Icon/symbol only. ${wantsText ? `Text only if the user explicitly asks; otherwise omit "${projectName}".` : 'No text.'}
- Avoid noise: no filters, no blur, no drop shadows, no complex patterns.
- Prefer a single clear idea: one primary shape + optional cutouts/secondary shape.
- Use consistent strokes if you use strokes: stroke-width between 10 and 16, round linecap/linejoin.
- Keep ~20px padding from the edges (nothing should touch the viewBox bounds).
- Flat design: solid fills preferred. Gradients are optional, and only if subtle (2 stops max) and still looks flat.

COLOR RULES:
- Use brand colors if provided. Use at most 2 brand colors + optional neutral (#0B0F19 or #FFFFFF).
- Do not invent many new colors.

STYLE/MOOD/COMPLEXITY TARGET:
- Style (${style}): ${styleGuide[style as keyof typeof styleGuide]}
- Mood (${mood}): ${moodGuide[mood as keyof typeof moodGuide]}
- Complexity (${complexity}): ${complexityGuide[complexity as keyof typeof complexityGuide]}

GOOD SVG EXAMPLES (simple, iconic):

Example A (stroke-based mark):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <path d="M50 120 C70 70, 130 70, 150 120" fill="none" stroke="#111827" stroke-width="14" stroke-linecap="round"/>
  <path d="M65 120 C80 95, 120 95, 135 120" fill="none" stroke="#111827" stroke-width="14" stroke-linecap="round" opacity="0.35"/>
</svg>

Example B (filled geometric with cutout):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <path d="M100 30 L162 66 L162 134 L100 170 L38 134 L38 66 Z" fill="#4F46E5"/>
  <path d="M72 78 L128 122" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
  <path d="M128 78 L72 122" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.6"/>
</svg>`;

    const colorInfo =
      colors && colors.length > 0
        ? `\n\nBrand Colors Available:\n${colors.map((c: string, i: number) => `Color ${i + 1}: ${c}`).join('\n')}`
        : '';

    const userPrompt = `PROJECT: ${projectName}
${colorInfo}

LOGO BRIEF: ${prompt}

REQUIREMENTS:
- Style: ${style}
- Mood: ${mood}  
- Complexity: ${complexity}

Generate a single iconic logo symbol that matches the brief. If brand colors are provided, use them as the ONLY palette. Output ONLY the SVG.`;

    // Generate SVG using OpenAI with selected model
    // Lower temperature for more precise, structured SVG code generation
    const result = await generateText({
      model: openai(selectedModel),
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.25,
    });

    let svg = result.text.trim();

    // Extract SVG if wrapped in code blocks
    const svgMatch = svg.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      svg = svgMatch[0];
    }

    // Normalize key SVG attributes if the model omitted them
    if (!/xmlns=/.test(svg)) {
      svg = svg.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!/viewBox=/.test(svg)) {
      svg = svg.replace(/^<svg\b/i, '<svg viewBox="0 0 200 200"');
    }
    if (!/\bwidth=/.test(svg) || !/\bheight=/.test(svg)) {
      svg = svg.replace(/^<svg\b/i, '<svg width="200" height="200"');
    }

    // Validate that we got valid SVG
    if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
      throw new Error('Invalid SVG generated');
    }

    return NextResponse.json({ svg });
  } catch (error) {
    console.error('Error generating logo:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate logo',
      },
      { status: 500 },
    );
  }
}
