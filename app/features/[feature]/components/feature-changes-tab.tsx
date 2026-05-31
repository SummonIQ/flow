'use client';

import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileEdit,
  FilePlus,
  FilePlus2,
  KeyRound,
  Loader2,
  Save,
  Settings2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface FeatureChange {
  file: string;
  action: 'create' | 'modify' | 'append';
  description: string;
  content: string;
}

interface FeatureChangesTabProps {
  changes: FeatureChange[];
  onSave: (changes: FeatureChange[]) => Promise<void>;
  isSaving: boolean;
  color: string;
}

type ChangeCategory = 'code' | 'config' | 'env';

interface CategoryConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const categoryConfig: Record<ChangeCategory, CategoryConfig> = {
  code: {
    label: 'Source Code',
    description: 'Application source files',
    icon: Code2,
    color: 'text-blue-500',
  },
  config: {
    label: 'Configuration',
    description: 'Project configuration files',
    icon: Settings2,
    color: 'text-purple-500',
  },
  env: {
    label: 'Environment Variables',
    description: 'Environment configuration',
    icon: KeyRound,
    color: 'text-amber-500',
  },
};

const configFiles = [
  'package.json',
  'tsconfig.json',
  'next.config',
  'tailwind.config',
  'postcss.config',
  'eslint',
  'prettier',
  'jest.config',
  'vitest.config',
  'vite.config',
  'turbo.json',
  'biome.json',
  '.gitignore',
  'components.json',
];

function categorizeChange(file: string): ChangeCategory {
  const lowerFile = file.toLowerCase();

  // Environment variables
  if (
    lowerFile.includes('.env') ||
    lowerFile === 'env' ||
    lowerFile.endsWith('.env.local') ||
    lowerFile.endsWith('.env.example')
  ) {
    return 'env';
  }

  // Configuration files
  if (configFiles.some(cf => lowerFile.includes(cf))) {
    return 'config';
  }

  // Everything else is source code
  return 'code';
}

const actionConfig = {
  create: {
    icon: FilePlus,
    label: 'Create',
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
  },
  modify: {
    icon: FileEdit,
    label: 'Modify',
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  append: {
    icon: FilePlus2,
    label: 'Append',
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

export function FeatureChangesTab({
  changes,
  onSave,
  isSaving,
  color,
}: FeatureChangesTabProps) {
  const [editedChanges, setEditedChanges] = useState<FeatureChange[]>(changes);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Group changes by category
  const groupedChanges = useMemo(() => {
    const groups: Record<
      ChangeCategory,
      { change: FeatureChange; index: number }[]
    > = {
      code: [],
      config: [],
      env: [],
    };

    editedChanges.forEach((change, index) => {
      const category = categorizeChange(change.file);
      groups[category].push({ change, index });
    });

    return groups;
  }, [editedChanges]);

  // Order of categories to display
  const categoryOrder: ChangeCategory[] = ['code', 'config', 'env'];

  const handleContentChange = (index: number, newContent: string) => {
    const updated = [...editedChanges];
    updated[index] = { ...updated[index], content: newContent };
    setEditedChanges(updated);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    await onSave(editedChanges);
    setHasUnsavedChanges(false);
    setEditingKey(null);
  };

  const copyToClipboard = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  const getChangeKey = (category: ChangeCategory, index: number) =>
    `${category}-${index}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">File Changes</h2>
          <p className="text-sm text-muted-foreground">
            These changes will be applied to integrate this feature into your
            project
          </p>
        </div>

        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        )}
      </div>

      {/* Grouped Changes */}
      <div className="space-y-4">
        {categoryOrder.map(category => {
          const items = groupedChanges[category];
          if (items.length === 0) return null;

          const catConfig = categoryConfig[category];
          const CategoryIcon = catConfig.icon;

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <CategoryIcon className={`w-4 h-4 ${catConfig.color}`} />
                <span className="text-sm font-medium">{catConfig.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'file' : 'files'})
                </span>
              </div>

              {/* Category Table */}
              <div className="border rounded-lg overflow-hidden divide-y">
                {/* Table Header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-3 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span className="w-5" />
                  <span>File</span>
                  <span className="w-16 text-center">Action</span>
                  <span className="w-12 text-right">Lines</span>
                </div>

                {/* Table Rows */}
                {items.map(
                  (
                    { change, index }: { change: FeatureChange; index: number },
                    itemIndex: number,
                  ) => {
                    const config = actionConfig[change.action];
                    const ActionIcon = config.icon;
                    const changeKey = getChangeKey(category, itemIndex);
                    const isExpanded = expandedKey === changeKey;
                    const isEditing = editingKey === changeKey;
                    const lineCount = change.content.split('\n').length;

                    return (
                      <div key={changeKey}>
                        {/* Row */}
                        <button
                          onClick={() => toggleExpand(changeKey)}
                          className="w-full grid grid-cols-[auto_1fr_auto_auto] gap-3 px-3 py-1.5 hover:bg-muted/30 transition-colors items-center text-left"
                        >
                          <span className="w-5 flex items-center justify-center">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </span>

                          <span className="flex items-center gap-2 min-w-0">
                            <ActionIcon
                              className={`w-3.5 h-3.5 shrink-0 ${config.text}`}
                            />
                            <span className="font-mono text-xs truncate">
                              {change.file}
                            </span>
                          </span>

                          <span
                            className={`w-16 text-center text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </span>

                          <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                            {lineCount}
                          </span>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t bg-muted/20">
                            {/* Description & Actions */}
                            <div className="flex items-center justify-between px-3 py-1 border-b text-xs">
                              <span className="text-muted-foreground">
                                {change.description}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    copyToClipboard(change.content, changeKey);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                                >
                                  {copiedKey === changeKey ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Copy
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingKey(isEditing ? null : changeKey);
                                  }}
                                  className={`px-1.5 py-0.5 rounded ${
                                    isEditing
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                  }`}
                                >
                                  {isEditing ? 'Done' : 'Edit'}
                                </button>
                              </div>
                            </div>

                            {/* Code Content */}
                            {isEditing ? (
                              <textarea
                                value={editedChanges[index].content}
                                onChange={e =>
                                  handleContentChange(index, e.target.value)
                                }
                                onClick={e => e.stopPropagation()}
                                className="w-full min-h-[200px] p-3 font-mono text-xs bg-transparent focus:outline-none resize-y"
                                spellCheck={false}
                              />
                            ) : category === 'env' ? (
                              <EnvVariablesList
                                content={change.content}
                                action={change.action}
                              />
                            ) : (
                              <pre className="p-2 overflow-x-auto max-h-[250px]">
                                <code className="text-xs font-mono">
                                  {change.content
                                    .split('\n')
                                    .map((line, lineIndex) => (
                                      <div key={lineIndex} className="flex">
                                        <span className="w-7 pr-2 text-right text-muted-foreground/50 select-none shrink-0">
                                          {lineIndex + 1}
                                        </span>
                                        <DiffLine
                                          line={line}
                                          action={change.action}
                                        />
                                      </div>
                                    ))}
                                </code>
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editedChanges.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p>No file changes defined for this feature.</p>
        </div>
      )}
    </div>
  );
}

function DiffLine({ line, action }: { line: string; action: string }) {
  const prefix = action === 'create' ? '+' : action === 'append' ? '+' : '';
  const prefixColor =
    action === 'create' || action === 'append'
      ? 'text-green-600 dark:text-green-400'
      : '';

  return (
    <span className="whitespace-pre">
      {prefix && <span className={prefixColor}>{prefix} </span>}
      {line || ' '}
    </span>
  );
}

interface EnvVariable {
  key: string;
  value: string;
  isComment: boolean;
}

function parseEnvContent(content: string): EnvVariable[] {
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        return { key: trimmedLine, value: '', isComment: true };
      }
      const [key, ...valueParts] = trimmedLine.split('=');
      return {
        key: key?.trim() ?? '',
        value: valueParts.join('=').trim(),
        isComment: false,
      };
    })
    .filter(item => item.key);
}

function EnvVariablesList({
  content,
  action,
}: {
  content: string;
  action: 'create' | 'modify' | 'append';
}) {
  const variables = parseEnvContent(content);
  const actionLabel = action === 'modify' ? 'Modifying' : 'Adding';
  const actionColor =
    action === 'modify'
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-green-600 dark:text-green-400';
  const badgeBg =
    action === 'modify'
      ? 'bg-yellow-100 dark:bg-yellow-950'
      : 'bg-green-100 dark:bg-green-950';

  if (variables.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground">
        No environment variables defined
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1.5 max-h-[250px] overflow-y-auto">
      {variables.map((variable, idx) =>
        variable.isComment ? (
          <div key={idx} className="text-xs text-muted-foreground italic px-2">
            {variable.key}
          </div>
        ) : (
          <div
            key={idx}
            className="flex items-center gap-2 px-2 py-1 rounded bg-muted/30"
          >
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeBg} ${actionColor}`}
            >
              {actionLabel}
            </span>
            <code className="text-xs font-mono font-semibold">
              {variable.key}
            </code>
            {variable.value && (
              <>
                <span className="text-muted-foreground">=</span>
                <code className="text-xs font-mono text-muted-foreground truncate max-w-[300px]">
                  {variable.value.startsWith('"') ||
                  variable.value.startsWith("'")
                    ? variable.value
                    : `"${variable.value}"`}
                </code>
              </>
            )}
          </div>
        ),
      )}
    </div>
  );
}
