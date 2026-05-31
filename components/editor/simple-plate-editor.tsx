'use client';

import * as React from 'react';
import { Plate, usePlateEditor, PlateContent } from 'platejs/react';
import type { Value } from 'platejs';
import { Bold, Italic, Underline, Code, List, ListOrdered, Quote, FileCode } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@summoniq/applab-ui';
import { useEditorRef } from 'platejs/react';
import { Editor, Transforms } from 'slate';

interface SimplePlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  placeholder?: string;
}

const defaultValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

// Render function for text marks (bold, italic, code, etc.)
const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.code) {
    children = <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>;
  }
  return <span {...attributes}>{children}</span>;
};

// Render function for block elements (headings, lists, etc.)
const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'h1':
      return <h1 className="text-3xl font-bold mb-4" {...attributes}>{children}</h1>;
    case 'h2':
      return <h2 className="text-2xl font-semibold mb-3" {...attributes}>{children}</h2>;
    case 'h3':
      return <h3 className="text-xl font-semibold mb-2" {...attributes}>{children}</h3>;
    case 'blockquote':
      return <blockquote className="border-l-4 border-border pl-4 italic my-4" {...attributes}>{children}</blockquote>;
    case 'code_block':
      return (
        <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto" {...attributes}>
          <code className="text-sm font-mono">{children}</code>
        </pre>
      );
    case 'ul':
      return <ul className="list-disc ml-6 my-4" {...attributes}>{children}</ul>;
    case 'ol':
      return <ol className="list-decimal ml-6 my-4" {...attributes}>{children}</ol>;
    case 'li':
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

function SimpleToolbar() {
  const editor = useEditorRef();
  const [activeMarks, setActiveMarks] = React.useState<Record<string, boolean>>({});
  const [currentBlockType, setCurrentBlockType] = React.useState('paragraph');

  // Update active marks and block type when selection changes
  const updateFormattingState = React.useCallback(() => {
    if (!editor) return;

    const marks = Editor.marks(editor as any);
    setActiveMarks({
      bold: marks ? (marks as any).bold === true : false,
      italic: marks ? (marks as any).italic === true : false,
      code: marks ? (marks as any).code === true : false,
      underline: marks ? (marks as any).underline === true : false,
    });

    // Get current block type
    const { selection } = editor;
    if (selection) {
      try {
        const [match] = Editor.nodes(editor as any, {
          match: (n: any) => Editor.isBlock(editor as any, n),
          mode: 'all',
        });
        if (match) {
          const [node] = match;
          const blockType = (node as any).type || 'p';
          setCurrentBlockType(blockType === 'p' ? 'paragraph' : blockType);
        }
      } catch (error) {
        // Ignore errors during node traversal
      }
    }
  }, [editor]);

  // Update on mount and when editor changes
  React.useEffect(() => {
    updateFormattingState();
  }, [updateFormattingState]);

  // Listen for selection changes
  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionChange = () => {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        updateFormattingState();
      }, 0);
    };

    // Listen to editor changes
    const editorElement = document.querySelector('[data-slate-editor="true"]');
    if (editorElement) {
      editorElement.addEventListener('click', handleSelectionChange);
      editorElement.addEventListener('keyup', handleSelectionChange);
      
      return () => {
        editorElement.removeEventListener('click', handleSelectionChange);
        editorElement.removeEventListener('keyup', handleSelectionChange);
      };
    }
  }, [editor, updateFormattingState]);

  const handleBlockTypeChange = (value: string) => {
    if (!editor) return;
    const type = value === 'paragraph' ? 'p' : value;
    const { selection } = editor;
    if (!selection) return;

    Transforms.setNodes(
      editor as any,
      { type } as any,
      {
        match: (n: any) => Editor.isBlock(editor as any, n),
        mode: 'all',
      }
    );
    setCurrentBlockType(value);
  };

  const toggleMark = (format: string) => {
    if (!editor) return;
    const marks = Editor.marks(editor as any);
    const isActive = marks ? (marks as any)[format] === true : false;
    
    if (isActive) {
      Editor.removeMark(editor as any, format);
    } else {
      Editor.addMark(editor as any, format, true);
    }
  };

  const toggleBlock = (format: string) => {
    if (!editor) return;
    Transforms.setNodes(
      editor as any,
      { type: format } as any,
      {
        match: (n: any) => Editor.isBlock(editor as any, n),
        mode: 'all',
      }
    );
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20 flex-wrap">
      {/* Text Style Dropdown */}
      <Select value={currentBlockType} onValueChange={handleBlockTypeChange}>
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Title</SelectItem>
          <SelectItem value="h2">Heading 1</SelectItem>
          <SelectItem value="h3">Heading 2</SelectItem>
          <SelectItem value="code_block">Code Block</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="sm" 
        title="Bold" 
        className={cn('h-8 w-8 p-0', activeMarks.bold && 'bg-accent text-accent-foreground')}
        onClick={() => toggleMark('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Italic" 
        className={cn('h-8 w-8 p-0', activeMarks.italic && 'bg-accent text-accent-foreground')}
        onClick={() => toggleMark('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Code" 
        className={cn('h-8 w-8 p-0', activeMarks.code && 'bg-accent text-accent-foreground')}
        onClick={() => toggleMark('code')}
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="sm" 
        title="Bulleted List" 
        className="h-8 w-8 p-0"
        onClick={() => toggleBlock('ul')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Numbered List" 
        className="h-8 w-8 p-0"
        onClick={() => toggleBlock('ol')}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Quote" 
        className="h-8 w-8 p-0"
        onClick={() => toggleBlock('blockquote')}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Code Block" 
        className="h-8 w-8 p-0"
        onClick={() => toggleBlock('code_block')}
      >
        <FileCode className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SimplePlateEditor({
  value: controlledValue,
  onChange,
  placeholder = 'Start writing...',
}: SimplePlateEditorProps) {
  // Track the last value we received to detect real changes
  const lastValueRef = React.useRef<Value | undefined>(undefined);
  const isInternalChange = React.useRef(false);
  
  const editor = usePlateEditor({
    id: 'simple-editor',
    plugins: [] as any,
    value: controlledValue || defaultValue,
  });

  // Sync editor value when controlledValue changes from external source
  React.useEffect(() => {
    if (!editor || !controlledValue || isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    // Check if value actually changed by comparing serialized versions
    const newValueStr = JSON.stringify(controlledValue);
    const lastValueStr = JSON.stringify(lastValueRef.current);
    
    if (newValueStr !== lastValueStr) {
      lastValueRef.current = controlledValue;
      
      // Reset editor content using Slate's removeNodes and insertNodes
      try {
        // Remove all nodes except the first (required by Slate)
        const nodeCount = (editor as any).children.length;
        for (let i = nodeCount - 1; i > 0; i--) {
          Transforms.removeNodes(editor as any, { at: [i] });
        }
        
        // Replace first node with new content
        Transforms.delete(editor as any, { at: [0] });
        Transforms.insertNodes(editor as any, controlledValue as any, { at: [0] });
      } catch (error) {
        console.error('Error updating editor:', error);
      }
    }
  }, [editor, controlledValue]);

  const handleChange = React.useCallback(
    (newValue: Value) => {
      isInternalChange.current = true;
      lastValueRef.current = newValue;
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  return (
    <Plate 
      editor={editor} 
      onChange={({ value: newValue }) => handleChange(newValue)}
    >
      <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-background">
        <SimpleToolbar />

        <div className="flex-1 overflow-auto p-6">
          <PlateContent
            renderLeaf={Leaf}
            renderElement={Element}
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px]"
            placeholder={placeholder}
          />
        </div>
      </div>
    </Plate>
  );
}
