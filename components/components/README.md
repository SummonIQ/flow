# Component AI Assistant Integration

This directory contains reusable components for adding AI-powered modification capabilities to component detail pages.

## Components

### ComponentChat

The main chat interface that allows users to interact with an AI to modify components.

**Features:**
- Chat interface with message history
- Real-time AI responses
- Revision management with accept/reject/revert
- Visual revision history
- Status tracking (pending, accepted, rejected)

**Usage:**

```tsx
'use client';

import { useState } from 'react';
import { ComponentChat } from '@/components/components/component-chat';

const initialCode = `// Your component code here`;

export default function YourComponentPage() {
  const [currentCode, setCurrentCode] = useState(initialCode);

  return (
    <div>
      {/* Your component documentation */}
      
      <ComponentChat
        componentId="unique-id"
        componentCode={currentCode}
        componentType="component" // or "background"
        onRevisionAccepted={(revision) => {
          setCurrentCode(revision.code);
        }}
      />
    </div>
  );
}
```

### ComponentPreview

A reusable preview component with tabs for switching between preview and code views.

**Usage:**

```tsx
import { ComponentPreview } from '@/components/components/component-preview';

<ComponentPreview
  title="Component Preview"
  description="Interactive demonstration"
  code={currentCode}
>
  {/* Your component preview */}
</ComponentPreview>
```

## API Integration

The AI assistant uses the `/api/components/revise` endpoint. To integrate with a real AI service:

1. Update `/apps/orchestrator/app/api/components/revise/route.ts`
2. Add your AI service credentials to environment variables
3. Implement the actual AI integration (OpenAI, Anthropic, etc.)

### Example AI Integration

```typescript
// In route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { componentCode, prompt } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that modifies React/TypeScript components based on user requests. Always maintain accessibility and best practices."
      },
      {
        role: "user",
        content: `Here's the current component code:\n\n${componentCode}\n\nPlease modify it to: ${prompt}`
      }
    ],
  });
  
  return NextResponse.json({
    code: extractCode(completion.choices[0].message.content),
    explanation: extractExplanation(completion.choices[0].message.content),
    description: prompt.substring(0, 100),
  });
}
```

## Revision Management

Revisions are managed in-memory (client-side) by default. For persistent storage:

1. Create a Prisma schema for component revisions
2. Add database operations to the API route
3. Load revisions on page mount
4. Save revisions to database when accepted

### Example Schema

```prisma
model ComponentRevision {
  id            String   @id @default(cuid())
  componentId   String
  code          String   @db.Text
  description   String
  prompt        String
  status        String   // 'pending' | 'accepted' | 'rejected'
  createdAt     DateTime @default(now())
  userId        String?
  
  @@index([componentId])
  @@index([status])
}
```

## Extending to Other Pages

To add AI assistance to any component page:

1. Convert the page to a client component (`'use client'`)
2. Add state for `currentCode`
3. Import and add the `ComponentChat` component
4. Pass the appropriate props
5. Handle the `onRevisionAccepted` callback

See examples in:
- `/app/components/forms/button/page.tsx`
- `/app/components/forms/input/page.tsx`
