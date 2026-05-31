"use client";

import { useState } from "react";
import {
  BuilderComponent,
  EventAction,
  EventType,
  EventActionType,
} from "@/types/studio/builder";
import { Code, Workflow, X, Loader2 } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useBuilderStore } from "@/lib/studio/store";
import { EventHandlerEditor } from "./event-handler-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/studio/ui/select";

interface EventEditorProps {
  component: BuilderComponent;
  events: Record<string, EventAction | undefined>;
  onUpdateEvent: (
    eventType: EventType,
    action: EventAction | undefined
  ) => void;
}

const AVAILABLE_EVENTS: Record<string, EventType[]> = {
  Button: ["onClick", "onDoubleClick", "onMouseEnter", "onMouseLeave"],
  Input: ["onChange", "onFocus", "onBlur", "onKeyDown", "onKeyUp"],
  Form: ["onSubmit"],
  Container: ["onClick", "onLoad"],
  Image: ["onClick", "onLoad", "onMouseEnter", "onMouseLeave"],
  Text: ["onClick"],
  default: [
    "onClick",
    "onDoubleClick",
    "onChange",
    "onSubmit",
    "onFocus",
    "onBlur",
    "onMouseEnter",
    "onMouseLeave",
    "onKeyDown",
    "onKeyUp",
  ],
};

export function EventEditor({
  component,
  events,
  onUpdateEvent,
}: EventEditorProps) {
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [aiGeneratingFor, setAiGeneratingFor] = useState<EventType | null>(
    null
  );
  const { project, setCanvasViewMode } = useBuilderStore();
  const variables = project?.variables || [];

  const availableEvents =
    AVAILABLE_EVENTS[component.type] || AVAILABLE_EVENTS.default;

  const getActionType = (eventType: EventType): EventActionType | "none" => {
    const action = events[eventType];
    return action?.type ?? "none";
  };

  const handleActionTypeChange = async (
    eventType: EventType,
    actionType: "none" | EventActionType
  ) => {
    if (actionType === "none") {
      onUpdateEvent(eventType, undefined);
      return;
    }

    const existing = events[eventType];

    const base: EventAction = {
      id: existing?.id || generateId(),
      type: actionType,
      name: existing?.name || `${eventType}_${actionType}`,
      code: existing?.code,
      workflow: existing?.workflow,
      variableId: existing?.variableId,
      variableName: existing?.variableName,
      variableValue: existing?.variableValue,
      aiPrompt: existing?.aiPrompt,
    };

    if (actionType === "code") {
      base.code =
        base.code ||
        `// Custom code for ${component.type} ${eventType}\nconsole.log('${eventType} triggered', event);`;
    }

    if (actionType === "setVariable") {
      base.variableName = existing?.variableName || variables[0]?.name;
      base.variableId = existing?.variableId || variables[0]?.id;
      base.variableValue = existing?.variableValue ?? "";
    }

    // Optimistically set type while we potentially generate code
    onUpdateEvent(eventType, base);

    if (actionType === "aiCode") {
      try {
        setAiGeneratingFor(eventType);
        const response = await fetch("/api/studio/generate-event-handler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            componentType: component.type,
            eventName: eventType,
            prompt: base.aiPrompt,
            variables: variables.map((v) => ({ name: v.name, type: v.type })),
          }),
        });

        if (!response.ok) {
          console.error("AI handler generation failed", await response.text());
        } else {
          const data = await response.json();
          if (data.code) {
            onUpdateEvent(eventType, {
              ...base,
              type: "aiCode",
              code: data.code,
            });
          }
        }
      } catch (err) {
        console.error("Error calling AI handler generator", err);
      } finally {
        setAiGeneratingFor((prev) => (prev === eventType ? null : prev));
      }
    }
  };

  const handleVariableChange = (
    eventType: EventType,
    patch: Partial<
      Pick<EventAction, "variableId" | "variableName" | "variableValue">
    >
  ) => {
    const current = events[eventType];
    if (!current) return;
    onUpdateEvent(eventType, {
      ...current,
      ...patch,
    });
  };

  const handleRemoveAction = (eventType: EventType) => {
    onUpdateEvent(eventType, undefined);
    if (editingEvent === eventType) {
      setEditingEvent(null);
    }
  };

  const handleSaveHandler = (eventName: string, code: string) => {
    const eventType = eventName as EventType;
    const existing = events[eventType];
    const base: EventAction = existing || {
      id: generateId(),
      type: "code",
      name: `${eventType}_code`,
    };

    onUpdateEvent(eventType, {
      ...base,
      type: base.type === "aiCode" ? "aiCode" : "code",
      code,
    });
    setEditingEvent(null);
  };

  return (
    <div className="space-y-3 text-[11px]">
      <div className="text-xs text-muted-foreground">
        Configure events for this component
      </div>

      <div className="space-y-1">
        {availableEvents.map((eventType) => {
          const action = events[eventType];
          const hasAction = !!action;
          const currentType = getActionType(eventType);

          return (
            <div
              key={eventType}
              className="flex items-center gap-1 rounded-md bg-background border border-border/60 px-1.5 py-1"
            >
              <div className="min-w-[64px] text-xs font-medium text-muted-foreground">
                {eventType}
              </div>

              {/* Action type dropdown */}
              <Select
                value={currentType}
                onValueChange={(next) =>
                  handleActionTypeChange(eventType, next as any)
                }
              >
                <SelectTrigger className="h-6 text-[11px] bg-transparent border border-border/60 rounded px-1 py-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="setVariable">Set variable</SelectItem>
                  <SelectItem value="code">Custom code</SelectItem>
                  <SelectItem value="aiCode">AI code</SelectItem>
                </SelectContent>
              </Select>

              {/* Set Variable config */}
              {currentType === "setVariable" && (
                <>
                  <Select
                    value={action?.variableId || action?.variableName || ""}
                    onValueChange={(next) => {
                      const selected = variables.find(
                        (v) => v.id === next || v.name === next
                      );
                      handleVariableChange(eventType, {
                        variableId: selected?.id,
                        variableName: selected?.name,
                      });
                    }}
                  >
                    <SelectTrigger className="h-6 text-[11px] bg-transparent border border-border/60 rounded px-1 py-0.5 max-w-[96px]">
                      <SelectValue
                        placeholder={
                          variables.length === 0 ? "No variables" : "Select"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {variables.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    className="w-24 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                    value={
                      action?.variableValue !== undefined
                        ? String(action.variableValue)
                        : ""
                    }
                    onChange={(e) =>
                      handleVariableChange(eventType, {
                        variableValue: e.target.value,
                      })
                    }
                    placeholder="value"
                  />
                </>
              )}

              {/* Custom / AI code controls */}
              {(currentType === "code" || currentType === "aiCode") && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(eventType)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[11px] hover:bg-muted/80"
                  >
                    <Code size={10} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("code")}
                    className="inline-flex items-center gap-1 px-1 py-0.5 rounded border border-border/60 text-[10px] text-muted-foreground hover:bg-muted/60"
                    title="Open Code tab"
                  >
                    <Code size={9} />
                    Code tab
                  </button>
                  {currentType === "aiCode" && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] inline-flex items-center gap-1">
                      {aiGeneratingFor === eventType ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : null}
                      AI
                    </span>
                  )}
                </div>
              )}

              {/* Remove */}
              {hasAction && (
                <button
                  type="button"
                  onClick={() => handleRemoveAction(eventType)}
                  className="ml-auto text-[11px] px-1 py-0.5 rounded hover:bg-destructive/10 text-destructive"
                  title="Remove action"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {editingEvent && (
        <EventHandlerEditor
          component={component}
          eventName={editingEvent}
          onSave={handleSaveHandler}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
