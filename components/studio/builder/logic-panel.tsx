"use client";

import { useBuilderStore } from "@/lib/studio/store";
import { Variable, StateVariable, CustomFunction } from "@/types/studio/builder";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Database,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
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

type LogicTab = "variables" | "state" | "functions";

export function LogicPanel() {
  const { project, updateProject } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<LogicTab>("variables");

  const variables: Variable[] = project?.variables || [];
  const stateVars: StateVariable[] = project?.state || [];
  const functions: CustomFunction[] = project?.functions || [];

  const updateVariables = (next: Variable[]) => {
    if (!project) return;
    updateProject({ variables: next });
  };

  const updateState = (next: StateVariable[]) => {
    if (!project) return;
    updateProject({ state: next });
  };

  const updateFunctions = (next: CustomFunction[]) => {
    if (!project) return;
    updateProject({ functions: next });
  };

  const coerceValue = (
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

  // Variable handlers
  const handleAddVariable = () => {
    if (!project) return;
    const newVar: Variable = {
      id: generateId(),
      name: `variable${variables.length + 1}`,
      type: "string",
      value: "",
    };
    updateVariables([...variables, newVar]);
  };

  const handleUpdateVariable = (id: string, patch: Partial<Variable>) => {
    const next = variables.map((v) =>
      v.id === id
        ? {
            ...v,
            ...patch,
            value:
              patch.value !== undefined
                ? coerceValue(patch.value, patch.type || v.type)
                : v.value,
          }
        : v
    );
    updateVariables(next);
  };

  const handleRemoveVariable = (id: string) => {
    updateVariables(variables.filter((v) => v.id !== id));
  };

  // State handlers
  const handleAddState = () => {
    if (!project) return;
    const newState: StateVariable = {
      id: generateId(),
      name: `state${stateVars.length + 1}`,
      type: "string",
      defaultValue: "",
      currentValue: "",
    };
    updateState([...stateVars, newState]);
  };

  const handleUpdateState = (id: string, patch: Partial<StateVariable>) => {
    const next = stateVars.map((s) =>
      s.id === id
        ? {
            ...s,
            ...patch,
            defaultValue:
              patch.defaultValue !== undefined
                ? coerceValue(patch.defaultValue, patch.type || s.type)
                : s.defaultValue,
          }
        : s
    );
    updateState(next);
  };

  const handleRemoveState = (id: string) => {
    updateState(stateVars.filter((s) => s.id !== id));
  };

  // Function handlers
  const handleAddFunction = () => {
    if (!project) return;
    const newFn: CustomFunction = {
      id: generateId(),
      name: `myFunction${functions.length + 1}`,
      parameters: "",
      returnType: "void",
      body: "// Your code here\n",
    };
    updateFunctions([...functions, newFn]);
  };

  const handleUpdateFunction = (id: string, patch: Partial<CustomFunction>) => {
    const next = functions.map((f) => (f.id === id ? { ...f, ...patch } : f));
    updateFunctions(next);
  };

  const handleRemoveFunction = (id: string) => {
    updateFunctions(functions.filter((f) => f.id !== id));
  };

  if (!project) return null;

  const getTabCount = () => {
    switch (activeTab) {
      case "variables":
        return variables.length;
      case "state":
        return stateVars.length;
      case "functions":
        return functions.length;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border"
      >
        <div className="flex items-center gap-2">
          <Code size={14} className="text-primary" />
          <span className="text-xs font-semibold">Logic</span>
        </div>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex justify-center border-b border-border bg-background/50 shrink-0">
            <button
              onClick={() => setActiveTab("variables")}
              className={`px-2 py-1.5 text-[10px] font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "variables"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Database size={10} />
              Vars
              <span className="text-[9px] opacity-60">
                ({variables.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("state")}
              className={`px-2 py-1.5 text-[10px] font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "state"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap size={10} />
              State
              <span className="text-[9px] opacity-60">
                ({stateVars.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("functions")}
              className={`px-2 py-1.5 text-[10px] font-medium border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === "functions"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code size={10} />
              Funcs
              <span className="text-[9px] opacity-60">
                ({functions.length})
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Variables Tab */}
            {activeTab === "variables" && (
              <div className="p-2 space-y-1">
                <button
                  onClick={handleAddVariable}
                  className="w-full text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1"
                >
                  <Plus size={10} /> Add Variable
                </button>
                {variables.length === 0 && (
                  <div className="text-[10px] text-muted-foreground text-center py-2">
                    No variables yet
                  </div>
                )}
                {variables.map((variable) => (
                  <div
                    key={variable.id}
                    className="flex items-center gap-1 rounded bg-background p-1.5 border border-border/60"
                  >
                    <input
                      className="flex-1 min-w-0 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
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
                      <SelectTrigger className="h-6 text-[10px] bg-transparent border border-border/60 rounded px-1 py-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">str</SelectItem>
                        <SelectItem value="number">num</SelectItem>
                        <SelectItem value="boolean">bool</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      className="w-12 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                      value={
                        variable.value !== undefined
                          ? String(variable.value)
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateVariable(variable.id, {
                          value: e.target.value,
                        })
                      }
                      placeholder="val"
                    />
                    <button
                      onClick={() => handleRemoveVariable(variable.id)}
                      className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* State Tab */}
            {activeTab === "state" && (
              <div className="p-2 space-y-1">
                <button
                  onClick={handleAddState}
                  className="w-full text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1"
                >
                  <Plus size={10} /> Add State
                </button>
                {stateVars.length === 0 && (
                  <div className="text-[10px] text-muted-foreground text-center py-2">
                    No state variables yet
                  </div>
                )}
                {stateVars.map((state) => (
                  <div
                    key={state.id}
                    className="flex items-center gap-1 rounded bg-background p-1.5 border border-border/60"
                  >
                    <input
                      className="flex-1 min-w-0 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                      value={state.name}
                      onChange={(e) =>
                        handleUpdateState(state.id, { name: e.target.value })
                      }
                      placeholder="name"
                    />
                    <Select
                      value={state.type}
                      onValueChange={(next) =>
                        handleUpdateState(state.id, {
                          type: next as StateVariable["type"],
                        })
                      }
                    >
                      <SelectTrigger className="h-6 text-[10px] bg-transparent border border-border/60 rounded px-1 py-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">str</SelectItem>
                        <SelectItem value="number">num</SelectItem>
                        <SelectItem value="boolean">bool</SelectItem>
                      </SelectContent>
                    </Select>
                    <input
                      className="w-12 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                      value={
                        state.defaultValue !== undefined
                          ? String(state.defaultValue)
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateState(state.id, {
                          defaultValue: e.target.value,
                        })
                      }
                      placeholder="default"
                    />
                    <button
                      onClick={() => handleRemoveState(state.id)}
                      className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Functions Tab */}
            {activeTab === "functions" && (
              <div className="p-2 space-y-1">
                <button
                  onClick={handleAddFunction}
                  className="w-full text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1"
                >
                  <Plus size={10} /> Add Function
                </button>
                {functions.length === 0 && (
                  <div className="text-[10px] text-muted-foreground text-center py-2">
                    No functions yet
                  </div>
                )}
                {functions.map((fn) => (
                  <div
                    key={fn.id}
                    className="rounded bg-background p-1.5 border border-border/60 space-y-1"
                  >
                    <div className="flex items-center gap-1">
                      <input
                        className="flex-1 min-w-0 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={fn.name}
                        onChange={(e) =>
                          handleUpdateFunction(fn.id, { name: e.target.value })
                        }
                        placeholder="functionName"
                      />
                      <button
                        onClick={() => handleRemoveFunction(fn.id)}
                        className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span>(</span>
                      <input
                        className="flex-1 min-w-0 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={fn.parameters || ""}
                        onChange={(e) =>
                          handleUpdateFunction(fn.id, {
                            parameters: e.target.value,
                          })
                        }
                        placeholder="params"
                      />
                      <span>):</span>
                      <input
                        className="w-10 bg-transparent border border-border/60 rounded px-1 py-0.5 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        value={fn.returnType || "void"}
                        onChange={(e) =>
                          handleUpdateFunction(fn.id, {
                            returnType: e.target.value,
                          })
                        }
                        placeholder="void"
                      />
                    </div>
                    <textarea
                      className="w-full bg-muted/50 border border-border/60 rounded px-1 py-0.5 text-[9px] font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      value={fn.body}
                      onChange={(e) =>
                        handleUpdateFunction(fn.id, { body: e.target.value })
                      }
                      placeholder="// code"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export for backwards compatibility
export { LogicPanel as VariablesPanel };
