import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_SUGGEST_PROMPT_MODEL_DEFAULT } from '@/lib/openai/config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      projectName,
      projectDescription,
      brandColors,
      style = 'modern',
      mood = 'professional',
      complexity = 'medium',
    } = await request.json();

    if (!projectName) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 },
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    // Build the system prompt for logo prompt suggestions with customization
    const styleDescriptions = {
      modern: 'contemporary, cutting-edge with clean lines and subtle depth',
      minimalist: 'stripped-down, essential forms with abundant negative space',
      geometric: 'mathematical precision, angular forms, and perfect symmetry',
      abstract:
        'non-literal, artistic interpretation with flowing symbolic elements',
      tech: 'digital-forward, futuristic with circuit patterns or grid elements',
      elegant: 'refined, graceful with sophisticated curves and luxury feel',
      playful: 'friendly, dynamic with rounded forms and energetic composition',
      corporate: 'professional, trustworthy with solid geometric foundations',
    };

    const moodDescriptions = {
      professional: 'serious, competent, business-appropriate',
      friendly: 'approachable, warm, inviting',
      bold: 'strong, confident, impactful',
      sophisticated: 'refined, cultured, upscale',
      innovative: 'forward-thinking, cutting-edge, pioneering',
      trustworthy: 'reliable, stable, secure',
      energetic: 'dynamic, vibrant, active',
      calm: 'peaceful, balanced, serene',
    };

    const complexityDescriptions = {
      simple:
        'minimal with 2-4 key elements, emphasizing clarity and negative space',
      medium:
        'balanced with 4-8 elements, incorporating moderate layering and detail',
      complex:
        'rich with 8-15 elements, featuring intricate patterns and multiple layers',
    };

    const systemPrompt = `You are a professional logo designer creating prompts for modern, iconic logos. Generate a concise, focused logo prompt that results in a clean, professional mark.

TARGET CHARACTERISTICS:
- Style: ${style} (${styleDescriptions[style as keyof typeof styleDescriptions]})
- Mood: ${mood} (${moodDescriptions[mood as keyof typeof moodDescriptions]})
- Complexity: ${complexity} (${complexityDescriptions[complexity as keyof typeof complexityDescriptions]})

CRITICAL PRINCIPLES:
1. Output ONLY the logo prompt text (1-2 sentences max)
2. Focus on ICONIC SYMBOLS and SHAPES - not decorative elements
3. DO NOT mention: badges, ribbons, banners, frames, or "surrounded by"
4. DO NOT request text unless it's essential (like a lettermark)
5. Describe the core visual concept simply and directly
6. Use professional terminology: abstract, geometric, letterform, symbol, mark
7. Specify the ${style} style and ${mood} mood implicitly through description
8. ${complexity === 'simple' ? 'Keep it minimal - single powerful element' : complexity === 'complex' ? 'Multiple layered elements that work together' : 'Balanced detail level'}

AVOID IN YOUR PROMPTS:
- "Surrounded by stars/rays/circles"
- "With text saying..."
- "Badge style" or "emblem"
- Overly descriptive or verbose language
- Clichéd imagery (globes, handshakes, lightbulbs)
- ${style === 'minimalist' ? 'ANY complexity or busy elements' : 'Generic corporate stock imagery'}

GOOD EXAMPLES:
- "Interlocking geometric letters forming an abstract M"
- "Minimalist wave symbol with gradient flow"
- "Angular hexagonal shape suggesting technology"
- "Curved abstract form creating negative space"

BAD EXAMPLES:
- "Logo with company name in a circle surrounded by stars"
- "Badge with ribbon and ornate borders"
- "Detailed illustration with multiple elements and text"

EXAMPLES FOR ${style.toUpperCase()} STYLE:
${style === 'minimalist' ? `- "Single curved line forming abstract mark, ${brandColors?.[0] || 'deep blue'}"` : ''}
${style === 'geometric' ? `- "Interlocking hexagons creating dimensional form, ${brandColors?.[0] || 'navy'} gradient"` : ''}
${style === 'tech' ? `- "Abstract circuit node symbol, angular lines, ${brandColors?.[0] || 'electric blue'}"` : ''}
${style === 'elegant' ? `- "Flowing letterform with graceful curves, ${brandColors?.[0] || 'burgundy'} gradient"` : ''}
${style === 'abstract' ? `- "Organic flowing shape suggesting movement, ${brandColors?.[0] || 'violet'} tones"` : ''}
${style === 'modern' ? `- "Overlapping geometric planes forming letter, ${brandColors?.[0] || 'indigo'} gradient"` : ''}
${style === 'corporate' ? `- "Solid geometric mark, structured form, ${brandColors?.[0] || 'navy'}"` : ''}
${style === 'playful' ? `- "Rounded dynamic shapes with motion, ${brandColors?.[0] || 'coral'} gradient"` : ''}`;

    const colorInfo =
      brandColors && brandColors.length > 0
        ? `\n\nBrand Colors:\n${brandColors.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}`
        : '';

    const descriptionInfo = projectDescription
      ? `\nProject Description: ${projectDescription}`
      : '';

    const userPrompt = `Project: ${projectName}${descriptionInfo}${colorInfo}

Style: ${style}, Mood: ${mood}, Complexity: ${complexity}

Generate a clean, focused logo prompt. Describe the core visual symbol/shape only - no badges, text, or decorative elements unless essential. 1-2 sentences max.`;

    // Generate suggestion using OpenAI
    const result = await generateText({
      model: openai(OPENAI_SUGGEST_PROMPT_MODEL_DEFAULT),
      prompt: userPrompt,
      system: systemPrompt,
      temperature: 0.9, // Higher temperature for more creativity
    });

    const suggestion = result.text.trim();

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error suggesting prompt:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to suggest prompt',
      },
      { status: 500 },
    );
  }
}
