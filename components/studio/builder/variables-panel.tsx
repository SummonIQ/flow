"use client";

import { useBuilderStore } from "@/lib/studio/store";
import { Variable } from "@/types/studio/builder";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/studio/ui/select";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function VariablesPanel() {
  const { project, updateProject } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const variables: Variable[] = project?.variables || [];

  const updateVariables = (next: Variable[]) => {
    if (!project) return;
    updateProject({ variables: next });
  };

  const handleAddVariable = () => {
    if (!project) return;
    const baseName = "variable";
    const index = variables.length + 1;
    const newVar: Variable = {
      id: generateId(),
      name: `${baseName}${index}`,
      type: "string",
      value: "",
    };
    updateVariables([...variables, newVar]);
  };

  const handleUpdateVariable = (
    id: string,
    patch: Partial<Pick<Variable, "name" | "type" | "value">>
  ) => {
    const next = variables.map((v) =>
      v.id === id
        ? {
            ...v,
            ...patch,
            value:
              patch.value !== undefined
                ? coerceVariableValue(patch.value, patch.type || v.type)
                : v.value,
          }
        : v
    );
    updateVariables(next);
  };

  const handleRemoveVariable = (id: string) => {
    const next = variables.filter((v) => v.id !== id);
    updateVariables(next);
  };

  const coerceVariableValue = (
    value: string | number | boolean,
    type: Variable["type"]
  ): string | number | boolean => {
    if (type === "number") {
      const num = typeof value === "number" ? value : Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
    if (type === "boolean") {
      if (typeof value === "boolean") return value;
      const str = String(value).toLowerCase();
      return str === "true";
    }
    return typeof value === "string" ? value : String(value);
  };

  if (!project) return null;

  return (
    <div className="border-t border-border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold">Variables</span>
          <span className="text-[10px] text-muted-foreground">
            {variables.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddVariable();
              setIsExpanded(true);
            }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            + Add
          </button>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {variables.length === 0 && (
            <div className="text-[11px] text-muted-foreground px-1.5 py-2 text-center">
              No variables yet. Click "+ Add" to create one.
            </div>
          )}
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="flex items-center gap-1 rounded-md bg-background px-1.5 py-1 border border-border/60"
            >
              <input
                className="flex-1 min-w-0 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                value={variable.name}
                onChange={(e) =>
                  handleUpdateVariable(variable.id, {
                    name: e.target.value,
                  })
                }
                placeholder="name"
              />
              <Select
                value={variable.type}
                onValueChange={(next) =>
                  handleUpdateVariable(variable.id, {
                    type: next as Variable["type"],
                  })
                }
              >
                <SelectTrigger className="h-6 text-[11px] bg-transparent border border-border/60 rounded px-1 py-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                </SelectContent>
              </Select>
              <input
                className="w-16 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                value={
                  variable.value !== undefined ? String(variable.value) : ""
                }
                onChange={(e) =>
                  handleUpdateVariable(variable.id, {
                    value: e.target.value,
                  })
                }
                placeholder="value"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariable(variable.id)}
                className="text-[11px] px-1 py-0.5 rounded hover:bg-destructive/10 text-destructive"
                title="Remove variable"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
