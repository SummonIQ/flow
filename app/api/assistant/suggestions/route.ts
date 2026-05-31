import {
  getOpenAIClient,
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_CHAT_MODEL_DEFAULT } from '@/lib/openai/config';
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Suggestion {
  label: string;
  prompt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] };

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();

    // Build context from recent messages (last 6 messages max)
    const recentMessages = messages.slice(-6);

    const systemPrompt = `You are a helpful assistant that generates contextual follow-up question suggestions for an SummonIQ orchestrator chat interface.

SummonIQ is a project management and orchestration platform with features like:
- Projects management (create, view, configure projects)
- Teams and team members
- Workflows and automation
- AI Agents for task automation
- Tickets and task tracking
- Apps within projects (web apps, APIs, etc.)
- Configuration management
- Database management

Based on the conversation context, generate 4 short, relevant follow-up questions or commands the user might want to ask next. Each suggestion should:
1. Be directly relevant to what was just discussed
2. Help the user explore related functionality or go deeper
3. Be action-oriented when appropriate
4. Be concise (max 6 words for label)

Respond with a JSON array of objects with "label" (short display text, max 6 words) and "prompt" (the full question/command to send):
[{"label": "Short label", "prompt": "Full question or command"}]

IMPORTANT: Return ONLY the JSON array, no other text.`;

    const conversationContext = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL_DEFAULT,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Based on this conversation, suggest 4 relevant follow-up questions:\n\n${conversationContext}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        suggestions: getDefaultSuggestions(),
      });
    }

    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const suggestions = JSON.parse(jsonStr) as Suggestion[];

      // Validate and sanitize suggestions
      const validSuggestions = suggestions
        .filter(
          s =>
            s &&
            typeof s.label === 'string' &&
            typeof s.prompt === 'string' &&
            s.label.trim() &&
            s.prompt.trim()
        )
        .slice(0, 4)
        .map(s => ({
          label: s.label.trim().slice(0, 40),
          prompt: s.prompt.trim(),
        }));

      if (validSuggestions.length === 0) {
        return NextResponse.json({
          suggestions: getDefaultSuggestions(),
        });
      }

      return NextResponse.json({ suggestions: validSuggestions });
    } catch {
      // If JSON parsing fails, return defaults
      return NextResponse.json({
        suggestions: getDefaultSuggestions(),
      });
    }
  } catch (error) {
    console.error('[Suggestions API] Error:', error);
    return NextResponse.json({
      suggestions: getDefaultSuggestions(),
    });
  }
}

function getDefaultSuggestions(): Suggestion[] {
  return [
    { label: 'List all projects', prompt: 'Show me all my projects in SummonIQ' },
    {
      label: 'Show teams',
      prompt: 'List all teams with their workflows and members',
    },
    { label: 'View workflows', prompt: 'What workflows are available?' },
    {
      label: 'List agents',
      prompt: 'Show me all available agents and their roles',
    },
  ];
}
