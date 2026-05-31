import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db/prisma";
import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_COMPONENT_REVISION_MODEL_DEFAULT } from '@/lib/openai/config';
import type OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();
    const body = await request.json();
    const { componentId, componentCode, componentType, prompt, userId } = body;

    if (!componentCode || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Generate AI response
    const aiResponse = await generateAIRevision(
      openai,
      componentCode,
      prompt,
      componentType,
    );

    if (!aiResponse) {
      throw new Error('Failed to generate AI response');
    }

    // Save revision to database
    const revision = await prisma.componentRevision.create({
      data: {
        componentId,
        code: aiResponse.code,
        description: aiResponse.description,
        prompt,
        explanation: aiResponse.explanation,
        userId,
        status: 'PENDING',
        isCurrent: false,
      },
    });

    return NextResponse.json({
      id: revision.id,
      code: aiResponse.code,
      explanation: aiResponse.explanation,
      description: aiResponse.description,
    });
  } catch (error) {
    console.error('Error in revise API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate revision',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

async function generateAIRevision(
  openai: OpenAI,
  componentCode: string,
  prompt: string,
  componentType: string,
): Promise<{ code: string; explanation: string; description: string } | null> {
  try {
    const systemPrompt = `You are an expert React/TypeScript developer specializing in UI components.

Your task is to modify React components based on user requests while maintaining:
- Accessibility standards (ARIA labels, keyboard navigation, semantic HTML)
- TypeScript type safety
- Tailwind CSS styling conventions
- React best practices
- Existing component functionality

When modifying code:
1. Keep imports intact unless adding new ones
2. Maintain or improve accessibility
3. Add helpful comments for significant changes
4. Ensure the code is production-ready
5. Follow the existing code style

Provide your response in this format:
CODE:
\`\`\`tsx
[modified code here]
\`\`\`

EXPLANATION:
[Brief explanation of what you changed and why]

DESCRIPTION:
[One-line summary for the revision history]`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_COMPONENT_REVISION_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Component Type: ${componentType}

Current Code:
\`\`\`tsx
${componentCode}
\`\`\`

User Request: ${prompt}

Please modify the code according to the request.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    return parseAIResponse(response, prompt);
  } catch (error) {
    console.error('Error generating AI revision:', error);
    throw error;
  }
}

function parseAIResponse(response: string, prompt: string): {
  code: string;
  explanation: string;
  description: string;
} {
  // Extract code between ```tsx and ```
  const codeMatch = response.match(/```(?:tsx|typescript|ts|jsx|javascript|js)?\n([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1].trim() : response;

  // Extract explanation
  const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=DESCRIPTION:|$)/i);
  const explanation = explanationMatch
    ? explanationMatch[1].trim()
    : 'Code modified based on your request.';

  // Extract description
  const descriptionMatch = response.match(/DESCRIPTION:\s*(.*?)$/im);
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : prompt.substring(0, 100);

  return { code, explanation, description };
}
