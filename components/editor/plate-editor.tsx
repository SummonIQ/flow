'use client';

import * as React from 'react';
import { Plate, usePlateEditor, PlateContent } from 'platejs/react';
import type { Value } from 'platejs';
import { editorPlugins } from './editor-kit';
import { Toolbar } from './toolbar';

interface PlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const defaultValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function PlateEditor({
  value: controlledValue,
  onChange,
  readOnly = false,
  placeholder = 'Start writing your documentation...',
}: PlateEditorProps) {
  const editor = usePlateEditor({
    id: 'doc-editor',
    plugins: [] as any,
    value: controlledValue || defaultValue,
    override: {
      enabled: {
        readOnly,
      },
    },
  });

  const handleChange = React.useCallback(
    (newValue: Value) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <Plate editor={editor} onChange={({ value: newValue }) => handleChange(newValue)}>
      <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-background">
        {!readOnly && <Toolbar />}

        <div className="flex-1 overflow-auto p-6">
          <PlateContent
            className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[500px] [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-foreground [&_h1:first-child]:mt-0"
            placeholder={placeholder}
          />
        </div>
      </div>
    </Plate>
  );
}
