import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from "@/lib/openai/client";
import { OPENAI_CHAT_DESIGN_MODEL_DEFAULT } from "@/lib/openai/config";

const ALLOWED_MODELS = new Set([
  "gpt-5",
  "o1-pro",
  "o3",
  "o4-mini",
  "gpt-4.1",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;
    const context = body?.context;
    const history = body?.history;
    const requestedModel = body?.model;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 }
      );
    }

    const historyText = history
      ?.map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const selectedComponentContext = context?.selectedComponent
      ? `
Currently selected component:
- Type: ${context.selectedComponent.type}
- Name: ${context.selectedComponent.name}
- Current styles: ${JSON.stringify(context.selectedComponent.styles, null, 2)}
- Current props: ${JSON.stringify(context.selectedComponent.props, null, 2)}
`
      : "No component is currently selected.";

    const fallbackModelName = OPENAI_CHAT_DESIGN_MODEL_DEFAULT;
    const modelName =
      typeof requestedModel === "string" && ALLOWED_MODELS.has(requestedModel)
        ? requestedModel
        : fallbackModelName;
    console.log("Chat design using model:", modelName);

    const promptText = `You are a helpful UI/UX design assistant for a visual builder application. You help users refine and improve their designs through conversation.

CONTEXT:
${selectedComponentContext}
Total components on page: ${context?.componentCount || "unknown"}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ""}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. Provide helpful, concise advice about the user's design question
2. If the user asks to change styles on the selected component, include a JSON block with TailwindCSS v4 className changes (see format below)
3. Be specific and actionable in your suggestions
4. Follow the Builder Schema and do not invent component types or prop keys.

BUILDER SCHEMA (REFERENCE):
- Supported component types:
  - Layout: Page, Container, Flex, Grid, Card, Stack, Divider
  - Form: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form
  - Display: Text, Heading, Image, Badge, Avatar, Icon
  - Feedback: Alert, Dialog, Toast, Progress, Spinner, Skeleton
  - Navigation: Tabs, Breadcrumb, Pagination, Menu
  - Data: Table, List, DataGrid
- Allowed prop keys (do not invent new prop keys):
  - Common: text, placeholder, disabled, variant (default|destructive|outline|secondary|ghost|link), size (default|sm|lg|icon)
  - Form: type, value, checked, required, min, max, step
  - Image/Avatar: src, alt
  - Badge: badgeVariant (default|secondary|destructive|outline)
  - Alert: alertVariant (default|destructive), title, description
  - Progress: progressValue
  - Heading: level (1-6)
  - Icon: icon (string)
- Conventions:
  - Prefer TailwindCSS v4 in a component's className.
  - Keep styles minimal (only when needed).

5. ALWAYS use TailwindCSS v4 utility classes for styling recommendations:
   - Colors: bg-background, bg-card, bg-primary, bg-secondary, bg-muted, text-foreground, text-muted-foreground, border-border
   - Spacing: p-1, p-2, p-4, p-6, p-8, m-1, m-2, m-4, gap-1, gap-2, gap-4
   - Font sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
   - Font weights: font-light, font-normal, font-medium, font-semibold, font-bold
   - Border radius: rounded-none, rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-full
   - Layout: flex, flex-col, flex-row, items-center, justify-center, justify-between, grid, grid-cols-2

If you want to apply style changes to the selected component, include them in this exact format at the END of your response:
---STYLES---
{"className": "...tailwind classes..."}
---END---

Only include the STYLES block if the user is asking to make a change AND a component is selected.

Respond in a friendly, helpful tone. Keep responses concise (2-4 sentences for simple questions, more for complex design discussions).`;

    let text: string;
    try {
      const result = await generateText({
        model: openai(modelName),
        prompt: promptText,
      });
      text = result.text;
    } catch (err) {
      if (modelName !== fallbackModelName) {
        console.warn(
          "Model failed, retrying with fallback model:",
          fallbackModelName,
          err
        );
        const retry = await generateText({
          model: openai(fallbackModelName),
          prompt: promptText,
        });
        text = retry.text;
      } else {
        throw err;
      }
    }

    // Parse the response to extract style changes if present
    let responseMessage = text;
    let styleChanges = null;

    const stylesMatch = text.match(/---STYLES---\s*([\s\S]*?)\s*---END---/);
    if (stylesMatch) {
      try {
        styleChanges = JSON.parse(stylesMatch[1].trim());
        responseMessage = text
          .replace(/---STYLES---[\s\S]*---END---/, "")
          .trim();
      } catch {
        // Failed to parse styles, just return the message
      }
    }

    return NextResponse.json({
      message: responseMessage,
      styleChanges,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
