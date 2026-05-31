"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from '@/components/themes/theme-provider';
import { X, Save, Code } from "lucide-react";
import type { BuilderComponent } from "@/types/studio/builder";

interface EventHandlerEditorProps {
  component: BuilderComponent;
  eventName: string;
  onSave: (eventName: string, code: string) => void;
  onClose: () => void;
}

export function EventHandlerEditor({
  component,
  eventName,
  onSave,
  onClose,
}: EventHandlerEditorProps) {
  const { theme } = useTheme();
  const [code, setCode] = useState("");

  // Generate initial handler code
  useEffect(() => {
    const existingHandler = component.events?.[eventName];
    if (
      existingHandler &&
      (existingHandler.type === "code" || existingHandler.type === "aiCode")
    ) {
      setCode(existingHandler.code || "");
    } else {
      // Generate default handler body
      const defaultCode = generateDefaultHandler(eventName, component.type);
      setCode(defaultCode);
    }
  }, [eventName, component]);

  const handleSave = () => {
    onSave(eventName, code);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Code size={18} className="text-primary" />
            <h3 className="text-sm font-semibold">
              {component.props.text || component.type} -{" "}
              {formatEventName(eventName)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Save size={14} />
              Save Handler
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={theme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              wordWrap: "on",
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Write your TypeScript event handler code. The event object is
            available as the parameter.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatEventName(eventName: string): string {
  // Convert onClick to "On Click"
  return eventName
    .replace(/^on/, "On ")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

function generateDefaultHandler(
  eventName: string,
  componentType: string
): string {
  return (
    `// Event handler for ${componentType} ${eventName}\n` +
    `console.log('${eventName} triggered on ${componentType}', event);\n` +
    `// Add your custom logic here. The 'event' parameter is the DOM/React event.\n`
  );
}
