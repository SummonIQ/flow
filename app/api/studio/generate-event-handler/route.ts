import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from "@/lib/openai/client";
import { OPENAI_EVENT_HANDLER_MODEL_DEFAULT } from "@/lib/openai/config";

interface GenerateEventHandlerRequest {
  componentType: string;
  eventName: string;
  prompt?: string;
  variables?: { name: string; type: string }[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateEventHandlerRequest;
    const { componentType, eventName, prompt, variables } = body;

    if (!componentType || !eventName) {
      return NextResponse.json(
        { error: "componentType and eventName are required" },
        { status: 400 }
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 }
      );
    }

    const variableContext =
      variables && variables.length > 0
        ? `\nThere are the following state variables available (name: type):\n${variables
            .map((v) => `- ${v.name}: ${v.type}`)
            .join(
              "\n"
            )}\nYou may read or update them via a variables/state API that the caller provides; do not declare new global variables with these names.`
        : "";

    const userPrompt =
      prompt && prompt.trim().length > 0
        ? `The user description for this handler is: "${prompt.trim()}".`
        : "";

    const modelName = OPENAI_EVENT_HANDLER_MODEL_DEFAULT;
    console.log("Event handler using model:", modelName);

    const { text } = await generateText({
      model: openai(modelName),
      prompt: `You are helping build interactive event handlers in a visual UI builder.\n\nGenerate JavaScript/TypeScript code for the BODY of an event handler for the event \"${eventName}\" on a ${componentType} component.\n\nCRITICAL RULES:\n- Assume the handler receives a single parameter named \\"event\\".\n- Return ONLY executable code statements that can be passed directly to new Function(\"event\", code).\n- Do NOT wrap the code in a function declaration. Do NOT include the word \\"function\\" unless it is for an inner helper.\n- Do NOT include import/export statements.\n- Do NOT include markdown, comments about what you are doing, or surrounding explanations. Return pure code only.\n- Prefer concise, safe logic (e.g. basic validation, logging, and variable updates).\n${variableContext}\n${userPrompt}`,
    });

    let code = text || "";

    // If the model returned fenced code, extract the inner part
    const fenceMatch = code.match(/```(?:[a-zA-Z]+)?\s*([\s\S]*?)```/m);
    if (fenceMatch) {
      code = fenceMatch[1];
    }

    code = code.trim();

    if (!code) {
      return NextResponse.json(
        { error: "Model returned empty code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ code });
  } catch (error: any) {
    console.error("Event handler generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate event handler" },
      { status: 500 }
    );
  }
}
