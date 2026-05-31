'use client';

import React, { useState } from 'react';
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
  Checkbox,
} from '@summoniq/applab-ui';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface DynamicConfigFormEditorProps {
  config: any;
  onChange: (config: any) => void;
  locked?: boolean;
}

export function DynamicConfigFormEditor({
  config,
  onChange,
  locked = false,
}: DynamicConfigFormEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['root']));

  const toggleSection = (path: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedSections(newExpanded);
  };

  const updateValue = (path: string[], value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    onChange(newConfig);
  };

  const addArrayItem = (path: string[]) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    
    for (const key of path) {
      current = current[key];
    }
    
    current.push('');
    onChange(newConfig);
  };

  const removeArrayItem = (path: string[], index: number) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    
    for (const key of path) {
      current = current[key];
    }
    
    current.splice(index, 1);
    onChange(newConfig);
  };

  const addObjectKey = (path: string[], key: string, value: any = '') => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    
    for (const k of path) {
      current = current[k];
    }
    
    current[key] = value;
    onChange(newConfig);
  };

  const removeObjectKey = (path: string[], key: string) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    let current = newConfig;
    
    for (const k of path) {
      current = current[k];
    }
    
    delete current[key];
    onChange(newConfig);
  };

  const renderField = (
    key: string,
    value: any,
    path: string[] = [],
    depth: number = 0
  ): React.ReactElement => {
    const fullPath = [...path, key];
    const pathString = fullPath.join('.');
    const isExpanded = expandedSections.has(pathString);

    // Handle different value types
    if (value === null) {
      return (
        <div key={pathString} className="space-y-2" style={{ marginLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Badge variant="outline" className="text-xs">
              null
            </Badge>
          </div>
          <Input
            value="null"
            disabled={locked}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'null') return;
              if (val === 'true' || val === 'false') {
                updateValue(fullPath, val === 'true');
              } else if (!isNaN(Number(val))) {
                updateValue(fullPath, Number(val));
              } else {
                updateValue(fullPath, val);
              }
            }}
            className="max-w-md text-sm"
          />
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div key={pathString} className="space-y-2" style={{ marginLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={value}
              onCheckedChange={(checked: boolean) => !locked && updateValue(fullPath, checked)}
            />
            <Label className="text-sm font-medium capitalize cursor-pointer">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Badge variant="secondary" className="text-xs">
              boolean
            </Badge>
          </div>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div key={pathString} className="space-y-2" style={{ marginLeft: `${depth * 16}px` }}>
          <Label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Input
            type="number"
            value={value}
            disabled={locked}
            onChange={(e) => updateValue(fullPath, Number(e.target.value))}
            className="max-w-md text-sm"
          />
        </div>
      );
    }

    if (typeof value === 'string') {
      const isMultiline = value.length > 80 || value.includes('\n');
      
      return (
        <div key={pathString} className="space-y-2" style={{ marginLeft: `${depth * 16}px` }}>
          <Label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          {isMultiline ? (
            <Textarea
              value={value}
              disabled={locked}
              onChange={(e) => updateValue(fullPath, e.target.value)}
              className="max-w-2xl text-sm min-h-[100px] font-mono"
            />
          ) : (
            <Input
              value={value}
              disabled={locked}
              onChange={(e) => updateValue(fullPath, e.target.value)}
              className="max-w-md text-sm"
            />
          )}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={pathString} className="space-y-3" style={{ marginLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSection(pathString)}
              className="hover:bg-muted p-1 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <Label className="text-sm font-semibold capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Badge variant="outline" className="text-xs">
              array[{value.length}]
            </Badge>
            {!locked && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => addArrayItem(fullPath)}
                className="h-7 px-2"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          {isExpanded && (
            <div className="space-y-2 border-l-2 border-muted pl-3">
              {value.map((item, index) => (
                <div key={`${pathString}.${index}`} className="flex items-start gap-2">
                  <div className="flex-1">
                    {typeof item === 'object' && item !== null ? (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        {Object.keys(item).map((k) =>
                          renderField(k, item[k], [...fullPath, index.toString()], depth + 1)
                        )}
                      </div>
                    ) : typeof item === 'boolean' ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item}
                          onCheckedChange={(checked: boolean) =>
                            !locked && updateValue([...fullPath, index.toString()], checked)
                          }
                        />
                        <span className="text-sm">Item {index + 1}</span>
                      </div>
                    ) : (
                      <Input
                        value={item}
                        disabled={locked}
                        onChange={(e) =>
                          updateValue([...fullPath, index.toString()], e.target.value)
                        }
                        placeholder={`Item ${index + 1}`}
                        className="text-sm"
                      />
                    )}
                  </div>
                  {!locked && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeArrayItem(fullPath, index)}
                      className="h-9 px-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={pathString} className="space-y-3" style={{ marginLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSection(pathString)}
              className="hover:bg-muted p-1 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <Label className="text-sm font-semibold capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <Badge variant="outline" className="text-xs">
              object
            </Badge>
          </div>
          
          {isExpanded && (
            <div className="space-y-3 border-l-2 border-muted pl-3">
              {Object.keys(value).map((k) => renderField(k, value[k], fullPath, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return <div key={pathString}>Unsupported type</div>;
  };

  if (!config || typeof config !== 'object') {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Invalid configuration format
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-700 dark:text-yellow-300">
            Read Only
          </Badge>
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            This configuration is locked and cannot be edited
          </span>
        </div>
      )}
      
      <div className="space-y-4">
        {Object.keys(config).map((key) => renderField(key, config[key], [], 0))}
      </div>
    </div>
  );
}
