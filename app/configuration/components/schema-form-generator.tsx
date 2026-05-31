'use client';

import { Badge, Button, Input, Label, Textarea } from '@summoniq/applab-ui';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SchemaField } from '../schemas';

interface SchemaFormGeneratorProps {
  fields: SchemaField[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  readonly?: boolean;
}

export function SchemaFormGenerator({
  fields,
  values,
  onChange,
  readonly = false,
}: SchemaFormGeneratorProps) {
  const handleFieldChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const renderField = (field: SchemaField, parentPath: string = '') => {
    const fullPath = parentPath ? `${parentPath}.${field.key}` : field.key;
    const value = getNestedValue(values, fullPath);

    return (
      <div key={fullPath} className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Label htmlFor={fullPath} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {field.description}
              </p>
            )}
          </div>
          {field.default !== undefined && (
            <Badge variant="outline" className="text-xs shrink-0">
              Default: {JSON.stringify(field.default)}
            </Badge>
          )}
        </div>

        {renderInput(field, fullPath, value)}
      </div>
    );
  };

  const renderInput = (field: SchemaField, path: string, value: any) => {
    if (readonly) {
      return renderReadonlyValue(field, value);
    }

    switch (field.type) {
      case 'string':
        return (
          <Input
            id={path}
            value={value || ''}
            onChange={e => setNestedValue(path, e.target.value)}
            placeholder={field.placeholder || ''}
            className="mt-1"
          />
        );

      case 'number':
        return (
          <Input
            id={path}
            type="number"
            value={value !== undefined ? value : ''}
            onChange={e =>
              setNestedValue(path, e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder={field.placeholder || ''}
            className="mt-1"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id={path}
              checked={value || false}
              onChange={e => setNestedValue(path, e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor={path} className="cursor-pointer font-normal">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      case 'enum':
        return (
          <select
            id={path}
            value={value || ''}
            onChange={e => setNestedValue(path, e.target.value || undefined)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background mt-1"
          >
            <option value="">-- Select Option --</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'array':
        return renderArrayField(field, path, value);

      case 'object':
        return renderObjectField(field, path, value);

      case 'record':
        return renderRecordField(field, path, value);

      default:
        return (
          <Textarea
            id={path}
            value={value ? JSON.stringify(value, null, 2) : ''}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                setNestedValue(path, parsed);
              } catch {
                // Invalid JSON, keep as string temporarily
              }
            }}
            className="font-mono text-sm mt-1"
            rows={4}
          />
        );
    }
  };

  const renderArrayField = (field: SchemaField, path: string, value: any[]) => {
    const array = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-2 mt-1 border border-border rounded-lg p-3 bg-muted/20">
        {array.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              {field.itemType === 'string' && (
                <Input
                  value={item}
                  onChange={e => {
                    const newArray = [...array];
                    newArray[index] = e.target.value;
                    setNestedValue(path, newArray);
                  }}
                  placeholder={`Item ${index + 1}`}
                />
              )}
              {field.itemType === 'number' && (
                <Input
                  type="number"
                  value={item}
                  onChange={e => {
                    const newArray = [...array];
                    newArray[index] = parseFloat(e.target.value);
                    setNestedValue(path, newArray);
                  }}
                  placeholder={`Item ${index + 1}`}
                />
              )}
              {field.itemType === 'object' && field.itemSchema && (
                <div className="border border-border rounded-md p-2 bg-background">
                  <SchemaFormGenerator
                    fields={field.itemSchema}
                    values={item || {}}
                    onChange={newValue => {
                      const newArray = [...array];
                      newArray[index] = newValue;
                      setNestedValue(path, newArray);
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newArray = array.filter((_, i) => i !== index);
                setNestedValue(path, newArray.length > 0 ? newArray : undefined);
              }}
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newItem =
              field.itemType === 'number'
                ? 0
                : field.itemType === 'object'
                  ? {}
                  : '';
            setNestedValue(path, [...array, newItem]);
          }}
          className="gap-2 w-full"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>
    );
  };

  const renderObjectField = (field: SchemaField, path: string, value: any) => {
    const obj = value || {};

    return (
      <div className="mt-1 border border-border rounded-lg p-4 bg-muted/20 space-y-4">
        {field.fields?.map(subField =>
          renderField(subField, path),
        )}
      </div>
    );
  };

  const renderRecordField = (field: SchemaField, path: string, value: Record<string, string>) => {
    const record = value || {};
    const entries = Object.entries(record);

    return (
      <div className="space-y-2 mt-1 border border-border rounded-lg p-3 bg-muted/20">
        {entries.map(([key, val], index) => (
          <div key={index} className="flex items-start gap-2">
            <Input
              value={key}
              onChange={e => {
                const newRecord = { ...record };
                delete newRecord[key];
                newRecord[e.target.value] = val;
                setNestedValue(path, newRecord);
              }}
              placeholder="Key"
              className="flex-1"
            />
            <Input
              value={val}
              onChange={e => {
                setNestedValue(path, { ...record, [key]: e.target.value });
              }}
              placeholder="Value"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newRecord = { ...record };
                delete newRecord[key];
                setNestedValue(
                  path,
                  Object.keys(newRecord).length > 0 ? newRecord : undefined,
                );
              }}
              className="shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newKey = `key${entries.length + 1}`;
            setNestedValue(path, { ...record, [newKey]: '' });
          }}
          className="gap-2 w-full"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>
    );
  };

  const renderReadonlyValue = (field: SchemaField, value: any) => {
    if (value === undefined || value === null) {
      return <p className="text-sm text-muted-foreground italic mt-1">Not set</p>;
    }

    if (field.type === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'} className="mt-1">
          {value ? 'Enabled' : 'Disabled'}
        </Badge>
      );
    }

    if (field.type === 'array' || field.type === 'object' || field.type === 'record') {
      return (
        <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <p className="text-sm mt-1">{String(value)}</p>;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (path: string, value: any) => {
    const keys = path.split('.');
    const newValues = { ...values };
    let current: any = newValues;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    const finalKey = keys[keys.length - 1];
    if (value === undefined || value === '') {
      delete current[finalKey];
    } else {
      current[finalKey] = value;
    }

    onChange(newValues);
  };

  return (
    <div className="space-y-6">
      {fields.map(field => renderField(field))}
    </div>
  );
}
