'use client';

import { BuilderComponent } from '@/types/studio/builder';
import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface HTMLViewerProps {
  component: BuilderComponent | null;
}

export function HTMLViewer({ component }: HTMLViewerProps) {
  const [copied, setCopied] = useState(false);

  const generateHTML = (comp: BuilderComponent, indent: number = 0): string => {
    const indentStr = '  '.repeat(indent);
    const tag = getHTMLTag(comp.type);
    const attrs = generateAttributes(comp);
    const events = generateEvents(comp);
    const styles = generateStyles(comp);
    
    let html = `${indentStr}<${tag}${attrs}${events}${styles}>\n`;
    
    // Add text content
    if (comp.props.text) {
      html += `${indentStr}  {${JSON.stringify(comp.props.text)}}\n`;
    }
    
    // Add children
    if (comp.children.length > 0) {
      comp.children.forEach(child => {
        html += generateHTML(child, indent + 1);
      });
    } else if (isContainerType(comp.type) && !comp.props.text) {
      html += `${indentStr}  {/* Drop components here */}\n`;
    }
    
    html += `${indentStr}</${tag}>\n`;
    
    return html;
  };

  const getHTMLTag = (type: string): string => {
    const tagMap: Record<string, string> = {
      'Container': 'div',
      'Flex': 'div',
      'Grid': 'div',
      'Card': 'div',
      'Stack': 'div',
      'Form': 'form',
      'Button': 'button',
      'Input': 'input',
      'Textarea': 'textarea',
      'Select': 'select',
      'Text': 'span',
      'Heading': 'h2',
      'Image': 'img',
      'Divider': 'hr',
    };
    return tagMap[type] || 'div';
  };

  const isContainerType = (type: string): boolean => {
    return ['Container', 'Flex', 'Grid', 'Card', 'Stack', 'Form', 'List'].includes(type);
  };

  const generateAttributes = (comp: BuilderComponent): string => {
    let attrs = '';
    
    // ID and class
    attrs += ` id="${comp.id}"`;
    attrs += ` data-component="${comp.type}"`;
    
    // Form attributes
    if (comp.props.placeholder) {
      attrs += ` placeholder="${comp.props.placeholder}"`;
    }
    if (comp.props.type) {
      attrs += ` type="${comp.props.type}"`;
    }
    if (comp.props.disabled) {
      attrs += ` disabled`;
    }
    if (comp.props.required) {
      attrs += ` required`;
    }
    
    // Image attributes
    if (comp.props.src) {
      attrs += ` src="${comp.props.src}"`;
    }
    if (comp.props.alt) {
      attrs += ` alt="${comp.props.alt}"`;
    }
    
    return attrs;
  };

  const generateEvents = (comp: BuilderComponent): string => {
    let events = '';
    
    Object.entries(comp.events).forEach(([eventType, action]) => {
      if (action) {
        if (action.type === 'code') {
          events += `\n      ${eventType}={${action.name}}`;
        } else {
          events += `\n      ${eventType}={handle${capitalize(eventType)}}`;
        }
      }
    });
    
    return events;
  };

  const generateStyles = (comp: BuilderComponent): string => {
    const styleObj = comp.styles;
    if (Object.keys(styleObj).length === 0) return '';
    
    const styleStr = JSON.stringify(styleObj, null, 2)
      .split('\n')
      .map((line, i) => i === 0 ? line : '        ' + line)
      .join('\n');
    
    return `\n      style={${styleStr}}`;
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateReactComponent = (): string => {
    if (!component) return '';
    
    let code = `'use client';\n\nimport { useState } from 'react';\n\n`;
    code += `export function ${component.name}() {\n`;
    
    // Add event handlers
    const hasEvents = Object.keys(component.events).length > 0;
    if (hasEvents) {
      code += `  // Event Handlers\n`;
      Object.entries(component.events).forEach(([eventType, action]) => {
        if (action && action.type === 'code') {
          code += `  const ${action.name} = (event) => {\n`;
          code += `    ${action.code?.split('\n').join('\n    ') || '// Add code here'}\n`;
          code += `  };\n\n`;
        }
      });
    }
    
    code += `  return (\n`;
    code += generateHTML(component, 2);
    code += `  );\n`;
    code += `}\n`;
    
    return code;
  };

  const htmlCode = component ? generateReactComponent() : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-muted">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="text-sm font-medium">React/JSX Code</div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs hover:bg-accent rounded flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono bg-background border border-border rounded p-4 overflow-auto">
          <code>{htmlCode || '// Select a component to view its code'}</code>
        </pre>
      </div>
    </div>
  );
}
