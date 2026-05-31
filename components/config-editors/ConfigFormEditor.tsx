'use client';

import {
  Input,
  Label,
  Textarea,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import { Plus, Trash2, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AgentsMdSchema } from '@/types/agents-md';
import { parseAgentsMd, stringifyAgentsMd } from '@/types/agents-md';

type ConfigType =
  | 'eslint'
  | 'nextjs'
  | 'typescript'
  | 'tailwind'
  | 'prettier'
  | 'tsconfig'
  | 'package-json'
  | 'windsurf-rules'
  | 'agents-md'
  | 'claude-md'
  | 'cursor-rules';

interface ConfigFormEditorProps {
  configType: ConfigType;
  value: string;
  onChange: (value: string) => void;
  locked?: boolean;
}

export function ConfigFormEditor({ configType, value, onChange, locked = false }: ConfigFormEditorProps) {
  const [parsedConfig, setParsedConfig] = useState<any>(null);
  const [agentsSchema, setAgentsSchema] = useState<AgentsMdSchema | null>(null);

  useEffect(() => {
    if (configType === 'agents-md') {
      try {
        const parsed = JSON.parse(value);
        if (parsed.raw) {
          const schema = parseAgentsMd(parsed.raw);
          schema.locked = locked;
          setAgentsSchema(schema);
        }
      } catch {
        const schema = parseAgentsMd(value);
        schema.locked = locked;
        setAgentsSchema(schema);
      }
    } else {
      try {
        const parsed = JSON.parse(value);
        setParsedConfig(parsed);
      } catch {
        try {
          const parsed = JSON.parse(value);
          if (parsed.raw) {
            setParsedConfig({ raw: parsed.raw });
          }
        } catch {
          setParsedConfig({ raw: value });
        }
      }
    }
  }, [value, configType, locked]);

  const updateConfig = (newConfig: any) => {
    setParsedConfig(newConfig);
    onChange(JSON.stringify(newConfig, null, 2));
  };

  const updateAgentsSchema = (newSchema: AgentsMdSchema) => {
    setAgentsSchema(newSchema);
    const markdown = stringifyAgentsMd(newSchema);
    onChange(JSON.stringify({ raw: markdown }, null, 2));
  };

  // AGENTS.MD - Structured editor
  if (configType === 'agents-md' && agentsSchema) {
    return (
      <div className="space-y-6">
        {/* Locked indicator */}
        {agentsSchema.locked && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              This file is locked and cannot be edited by AI agents
            </span>
          </div>
        )}

        {/* Metadata Section */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold">Metadata</h3>
            <Badge variant="outline">Header Information</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purpose</Label>
              <Textarea
                value={agentsSchema.metadata.purpose}
                onChange={(e) => {
                  if (agentsSchema.locked) return;
                  updateAgentsSchema({
                    ...agentsSchema,
                    metadata: { ...agentsSchema.metadata, purpose: e.target.value },
                  });
                }}
                disabled={agentsSchema.locked}
                className="mt-1 text-sm min-h-[80px]"
              />
            </div>
            
            <div>
              <Label>Project</Label>
              <Input
                value={agentsSchema.metadata.project}
                onChange={(e) => {
                  if (agentsSchema.locked) return;
                  updateAgentsSchema({
                    ...agentsSchema,
                    metadata: { ...agentsSchema.metadata, project: e.target.value },
                  });
                }}
                disabled={agentsSchema.locked}
                className="mt-1 text-sm"
              />
            </div>
            
            <div>
              <Label>Last Updated</Label>
              <Input
                value={agentsSchema.metadata.lastUpdated}
                onChange={(e) => {
                  if (agentsSchema.locked) return;
                  updateAgentsSchema({
                    ...agentsSchema,
                    metadata: { ...agentsSchema.metadata, lastUpdated: e.target.value },
                  });
                }}
                disabled={agentsSchema.locked}
                className="mt-1 text-sm"
                placeholder="January 2025"
              />
            </div>
            
            <div>
              <Label>Framework</Label>
              <Input
                value={agentsSchema.metadata.framework}
                onChange={(e) => {
                  if (agentsSchema.locked) return;
                  updateAgentsSchema({
                    ...agentsSchema,
                    metadata: { ...agentsSchema.metadata, framework: e.target.value },
                  });
                }}
                disabled={agentsSchema.locked}
                className="mt-1 text-sm"
                placeholder="Next.js 16, React 19"
              />
            </div>
          </div>
        </div>

        {/* Sections Overview */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Content Sections</h3>
              <Badge variant="outline">{agentsSchema.sections.length} sections</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (agentsSchema.locked) return;
                updateAgentsSchema({
                  ...agentsSchema,
                  sections: [
                    ...agentsSchema.sections,
                    {
                      id: `section-${Date.now()}`,
                      title: 'New Section',
                      content: '',
                    },
                  ],
                });
              }}
              disabled={agentsSchema.locked}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>

          <div className="space-y-3">
            {agentsSchema.sections.map((section, index) => (
              <div key={section.id} className="bg-background border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        if (agentsSchema.locked) return;
                        const newSections = [...agentsSchema.sections];
                        newSections[index] = { ...section, title: e.target.value };
                        updateAgentsSchema({ ...agentsSchema, sections: newSections });
                      }}
                      disabled={agentsSchema.locked}
                      className="font-semibold"
                      placeholder="Section Title"
                    />
                    <Textarea
                      value={section.content}
                      onChange={(e) => {
                        if (agentsSchema.locked) return;
                        const newSections = [...agentsSchema.sections];
                        newSections[index] = { ...section, content: e.target.value };
                        updateAgentsSchema({ ...agentsSchema, sections: newSections });
                      }}
                      disabled={agentsSchema.locked}
                      className="font-mono text-sm min-h-[150px]"
                      placeholder="Section content (markdown supported)"
                    />
                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        • {section.bulletPoints.length} bullet points
                      </div>
                    )}
                    {section.codeBlocks && section.codeBlocks.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        📝 {section.codeBlocks.length} code blocks
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (agentsSchema.locked) return;
                      updateAgentsSchema({
                        ...agentsSchema,
                        sections: agentsSchema.sections.filter((_, i) => i !== index),
                      });
                    }}
                    disabled={agentsSchema.locked}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-base font-semibold mb-3">Table of Contents</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            {agentsSchema.tableOfContents.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-mono">{idx + 1}.</span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Other markdown configs (Windsurf, Claude, Cursor)
  if (['windsurf-rules', 'claude-md', 'cursor-rules'].includes(configType)) {
    const rawContent = parsedConfig?.raw || value;
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            This is a markdown-based configuration. Edit the content below.
          </p>
        </div>
        <div>
          <Label>Markdown Content</Label>
          <Textarea
            value={rawContent}
            onChange={(e) => updateConfig({ raw: e.target.value })}
            className="font-mono text-sm min-h-[600px] mt-2"
            placeholder="Enter markdown content..."
          />
        </div>
      </div>
    );
  }

  // ESLint Config
  if (configType === 'eslint') {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Configure ESLint rules and settings for your project.
          </p>
        </div>

        {/* Extends */}
        <div>
          <Label>Extends</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            ESLint configurations to extend (e.g., recommended presets)
          </p>
          {(parsedConfig?.extends || []).map((ext: string, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={ext}
                onChange={(e) => {
                  const newExtends = [...(parsedConfig?.extends || [])];
                  newExtends[index] = e.target.value;
                  updateConfig({ ...parsedConfig, extends: newExtends });
                }}
                placeholder="e.g., eslint:recommended"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newExtends = parsedConfig?.extends?.filter((_: any, i: number) => i !== index) || [];
                  updateConfig({ ...parsedConfig, extends: newExtends });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newExtends = [...(parsedConfig?.extends || []), ''];
              updateConfig({ ...parsedConfig, extends: newExtends });
            }}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Extension
          </Button>
        </div>

        {/* Environment */}
        <div>
          <Label>Environment</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Specify which environments your code runs in
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['browser', 'node', 'es2021', 'es2022', 'jest'].map((env) => (
              <label key={env} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={parsedConfig?.env?.[env] || false}
                  onChange={(e) => {
                    updateConfig({
                      ...parsedConfig,
                      env: { ...parsedConfig?.env, [env]: e.target.checked },
                    });
                  }}
                  className="rounded"
                />
                <span className="text-sm">{env}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rules - Simplified */}
        <div>
          <Label>Common Rules</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Configure commonly used ESLint rules
          </p>
          <div className="space-y-3 bg-muted/30 rounded-lg p-4">
            {[
              { key: 'no-console', label: 'No Console', options: ['off', 'warn', 'error'] },
              { key: 'no-unused-vars', label: 'No Unused Vars', options: ['off', 'warn', 'error'] },
              { key: 'semi', label: 'Semicolons', options: ['off', 'always', 'never'] },
              { key: 'quotes', label: 'Quotes', options: ['off', 'single', 'double'] },
            ].map((rule) => (
              <div key={rule.key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{rule.label}</span>
                <Select
                  value={parsedConfig?.rules?.[rule.key] || 'off'}
                  onValueChange={(value) => {
                    updateConfig({
                      ...parsedConfig,
                      rules: { ...parsedConfig?.rules, [rule.key]: value },
                    });
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rule.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TypeScript/TSConfig
  if (configType === 'tsconfig' || configType === 'typescript') {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Configure TypeScript compiler options for your project.
          </p>
        </div>

        {/* Compiler Options */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Compiler Options</Label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Target</Label>
              <Select
                value={parsedConfig?.compilerOptions?.target || 'ES2020'}
                onValueChange={(value) => {
                  updateConfig({
                    ...parsedConfig,
                    compilerOptions: { ...parsedConfig?.compilerOptions, target: value },
                  });
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ES5', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022', 'ESNext'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Module</Label>
              <Select
                value={parsedConfig?.compilerOptions?.module || 'ESNext'}
                onValueChange={(value) => {
                  updateConfig({
                    ...parsedConfig,
                    compilerOptions: { ...parsedConfig?.compilerOptions, module: value },
                  });
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['CommonJS', 'AMD', 'UMD', 'System', 'ES2015', 'ES2020', 'ESNext', 'Node16', 'NodeNext'].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Boolean Options */}
          <div>
            <Label className="text-sm mb-2 block">Type Checking</Label>
            <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-4">
              {[
                'strict',
                'noImplicitAny',
                'strictNullChecks',
                'noUnusedLocals',
                'noUnusedParameters',
                'noImplicitReturns',
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={parsedConfig?.compilerOptions?.[opt] || false}
                    onChange={(e) => {
                      updateConfig({
                        ...parsedConfig,
                        compilerOptions: {
                          ...parsedConfig?.compilerOptions,
                          [opt]: e.target.checked,
                        },
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tailwind Config
  if (configType === 'tailwind') {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Configure Tailwind CSS for your project.
          </p>
        </div>

        {/* Content Paths */}
        <div>
          <Label>Content Paths</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Specify which files Tailwind should scan for class names
          </p>
          {(parsedConfig?.content || []).map((path: string, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                value={path}
                onChange={(e) => {
                  const newContent = [...(parsedConfig?.content || [])];
                  newContent[index] = e.target.value;
                  updateConfig({ ...parsedConfig, content: newContent });
                }}
                placeholder="e.g., ./src/**/*.{js,ts,jsx,tsx}"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newContent = parsedConfig?.content?.filter((_: any, i: number) => i !== index) || [];
                  updateConfig({ ...parsedConfig, content: newContent });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newContent = [...(parsedConfig?.content || []), ''];
              updateConfig({ ...parsedConfig, content: newContent });
            }}
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Path
          </Button>
        </div>

        {/* Theme Extensions */}
        <div>
          <Label>Theme Extensions</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Extend the default Tailwind theme (simplified view)
          </p>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Use the Raw tab for detailed theme configuration
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Package.json
  if (configType === 'package-json') {
    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Configure package.json scripts and metadata.
          </p>
        </div>

        {/* Scripts */}
        <div>
          <Label className="text-base font-semibold">Scripts</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            NPM/Bun scripts for your project
          </p>
          <div className="space-y-2">
            {Object.entries(parsedConfig?.scripts || {}).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[120px_1fr_auto] gap-2 items-center">
                <Input
                  value={key}
                  onChange={(e) => {
                    const newScripts = { ...parsedConfig?.scripts };
                    delete newScripts[key];
                    newScripts[e.target.value] = value;
                    updateConfig({ ...parsedConfig, scripts: newScripts });
                  }}
                  placeholder="Script name"
                  className="text-sm"
                />
                <Input
                  value={value as string}
                  onChange={(e) => {
                    updateConfig({
                      ...parsedConfig,
                      scripts: { ...parsedConfig?.scripts, [key]: e.target.value },
                    });
                  }}
                  placeholder="Command"
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newScripts = { ...parsedConfig?.scripts };
                    delete newScripts[key];
                    updateConfig({ ...parsedConfig, scripts: newScripts });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateConfig({
                  ...parsedConfig,
                  scripts: { ...parsedConfig?.scripts, '': '' },
                });
              }}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Script
            </Button>
          </div>
        </div>

        {/* Dependencies Note */}
        <div className="bg-muted/30 rounded-lg p-4">
          <Label className="text-sm font-semibold mb-2 block">Dependencies</Label>
          <p className="text-sm text-muted-foreground">
            Use the Raw tab to manage dependencies and devDependencies in detail.
          </p>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          Form editor not yet implemented for this config type. Please use the Raw tab.
        </p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm min-h-[500px]"
        placeholder="Enter configuration content..."
      />
    </div>
  );
}
