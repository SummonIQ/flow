'use client';

import { Loader2, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';

interface SettingSchema {
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  options?: string[];
  default: unknown;
}

interface FeatureSettings {
  [key: string]: SettingSchema;
}

interface SettingValues {
  [key: string]: unknown;
}

interface FeatureSettingsTabProps {
  settings: FeatureSettings | null;
  onSave: (settings: FeatureSettings) => Promise<void>;
  isSaving: boolean;
}

export function FeatureSettingsTab({
  settings,
  onSave,
  isSaving,
}: FeatureSettingsTabProps) {
  const [editedSettings, setEditedSettings] = useState<FeatureSettings>(
    settings || {},
  );
  const [values, setValues] = useState<SettingValues>(() => {
    if (!settings) return {};
    const initial: SettingValues = {};
    for (const [key, schema] of Object.entries(settings)) {
      initial[key] = schema.default;
    }
    return initial;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleValueChange = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setEditedSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], default: value },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    await onSave(editedSettings);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    if (!settings) return;
    const initial: SettingValues = {};
    for (const [key, schema] of Object.entries(settings)) {
      initial[key] = schema.default;
    }
    setValues(initial);
    setEditedSettings(settings);
    setHasUnsavedChanges(false);
  };

  if (!settings || Object.keys(settings).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg">
        <p>No configurable settings for this feature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Feature Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure how this feature will be integrated into your project
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      <div className="border rounded-lg divide-y">
        {Object.entries(settings).map(([key, schema]) => (
          <div key={key} className="p-4 flex items-start gap-4">
            <div className="flex-1">
              <label className="block font-medium text-sm" htmlFor={key}>
                {schema.label}
              </label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Key: <code className="px-1 py-0.5 bg-muted rounded">{key}</code>
              </p>
            </div>

            <div className="w-64">
              <SettingInput
                id={key}
                schema={schema}
                value={values[key]}
                onChange={value => handleValueChange(key, value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Settings Preview</h3>
        <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
          <code>{JSON.stringify(values, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

interface SettingInputProps {
  id: string;
  schema: SettingSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

function SettingInput({ id, schema, value, onChange }: SettingInputProps) {
  switch (schema.type) {
    case 'text':
      return (
        <input
          id={id}
          type="text"
          value={String(value || '')}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      );

    case 'number':
      return (
        <input
          id={id}
          type="number"
          value={Number(value) || 0}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={e => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50"
          />
          <span className="text-sm">{value ? 'Enabled' : 'Disabled'}</span>
        </label>
      );

    case 'select':
      return (
        <select
          id={id}
          value={String(value || '')}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
        >
          {schema.options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {schema.options?.map(option => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={e => {
                  if (e.target.checked) {
                    onChange([...selectedValues, option]);
                  } else {
                    onChange(
                      selectedValues.filter((v: string) => v !== option),
                    );
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );

    default:
      return (
        <input
          id={id}
          type="text"
          value={String(value || '')}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      );
  }
}
