'use client';

import { Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, Quote, Link as LinkIcon } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@summoniq/applab-ui';
import { useEditorRef } from 'platejs/react';
import { Editor, Transforms, Element as SlateElement, Text } from 'slate';

export function Toolbar() {
  const editor = useEditorRef();

  const handleBlockTypeChange = (value: string) => {
    if (!editor) return;

    // Convert "paragraph" to "p" for Plate
    const type = value === 'paragraph' ? 'p' : value;

    // Change the current block type using Slate transforms
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
  };

  const isMarkActive = (format: string) => {
    if (!editor) return false;
    const marks = Editor.marks(editor as any);
    return marks ? (marks as any)[format] === true : false;
  };

  const toggleMark = (format: string) => {
    if (!editor) return;
    
    const isActive = isMarkActive(format);
    
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

  const insertLink = () => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url && url.trim()) {
      const { selection } = editor;
      const isCollapsed = selection && selection.anchor.offset === selection.focus.offset;
      
      const link = {
        type: 'a',
        url,
        children: isCollapsed ? [{ text: url }] : [],
      } as any;

      if (isCollapsed) {
        Transforms.insertNodes(editor as any, link);
      } else {
        Transforms.wrapNodes(editor as any, link, { split: true });
      }
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/20 flex-wrap">
      {/* Text Style Dropdown */}
      <Select defaultValue="paragraph" onValueChange={handleBlockTypeChange}>
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Title</SelectItem>
          <SelectItem value="h2">Heading 1</SelectItem>
          <SelectItem value="h3">Heading 2</SelectItem>
          <SelectItem value="h4">Heading 3</SelectItem>
          <SelectItem value="h5">Heading 4</SelectItem>
          <SelectItem value="h6">Heading 5</SelectItem>
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="sm" 
        title="Bold (⌘+B)" 
        className="h-8 w-8 p-0"
        onClick={() => toggleMark('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Italic (⌘+I)" 
        className="h-8 w-8 p-0"
        onClick={() => toggleMark('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Underline (⌘+U)" 
        className="h-8 w-8 p-0"
        onClick={() => toggleMark('underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Strikethrough" 
        className="h-8 w-8 p-0"
        onClick={() => toggleMark('strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        title="Code" 
        className="h-8 w-8 p-0"
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

      <div className="w-px h-6 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="sm" 
        title="Link" 
        className="h-8 w-8 p-0"
        onClick={insertLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <span className="text-xs text-muted-foreground px-2">
        Tip: Type <span className="font-mono">**text**</span> for bold, <span className="font-mono">*text*</span> for italic
      </span>
    </div>
  );
}
