'use client';

import { BuilderComponent } from '@/types/studio/builder';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface WinFormsCodeViewerProps {
  component: BuilderComponent | null;
}

export function WinFormsCodeViewer({ component }: WinFormsCodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const generateWinFormsCode = (comp: BuilderComponent, indent: number = 0): string => {
    const indentStr = '        '.repeat(indent);
    const controlName = comp.name.replace(/\s+/g, '');
    let code = '';

    switch (comp.type) {
      case 'Button':
        code += `${indentStr}var ${controlName} = new Button();\n`;
        code += `${indentStr}${controlName}.Text = "${comp.props.text || 'Button'}";\n`;
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 100};\n`;
        if (comp.styles.height) code += `${indentStr}${controlName}.Height = ${parseInt(comp.styles.height) || 30};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        if (comp.styles.backgroundColor) {
          code += `${indentStr}${controlName}.BackColor = Color.FromName("${comp.styles.backgroundColor}");\n`;
        }
        break;

      case 'Text':
        code += `${indentStr}var ${controlName} = new Label();\n`;
        code += `${indentStr}${controlName}.Text = "${comp.props.text || 'Label'}";\n`;
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 100};\n`;
        if (comp.styles.height) code += `${indentStr}${controlName}.Height = ${parseInt(comp.styles.height) || 20};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        if (comp.styles.fontSize) {
          code += `${indentStr}${controlName}.Font = new Font("Segoe UI", ${parseInt(comp.styles.fontSize) || 9});\n`;
        }
        break;

      case 'Input':
      case 'Textarea':
        const isMultiline = comp.type === 'Textarea';
        code += `${indentStr}var ${controlName} = new TextBox();\n`;
        if (isMultiline) {
          code += `${indentStr}${controlName}.Multiline = true;\n`;
        }
        if (comp.props.placeholder) {
          code += `${indentStr}${controlName}.PlaceholderText = "${comp.props.placeholder}";\n`;
        }
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 200};\n`;
        if (comp.styles.height) code += `${indentStr}${controlName}.Height = ${parseInt(comp.styles.height) || (isMultiline ? 60 : 23)};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        break;

      case 'Checkbox':
        code += `${indentStr}var ${controlName} = new CheckBox();\n`;
        code += `${indentStr}${controlName}.Text = "${comp.props.text || 'Checkbox'}";\n`;
        code += `${indentStr}${controlName}.Checked = ${comp.props.checked || false};\n`;
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 100};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        break;

      case 'Container':
      case 'Card':
      case 'Form':
        code += `${indentStr}var ${controlName} = new Panel();\n`;
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 300};\n`;
        if (comp.styles.height) code += `${indentStr}${controlName}.Height = ${parseInt(comp.styles.height) || 200};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        code += `${indentStr}${controlName}.BorderStyle = BorderStyle.FixedSingle;\n`;
        if (comp.styles.backgroundColor) {
          code += `${indentStr}${controlName}.BackColor = Color.FromName("${comp.styles.backgroundColor}");\n`;
        }
        code += `\n`;
        
        if (comp.children.length > 0) {
          comp.children.forEach((child, index) => {
            code += generateWinFormsCode(child, 0);
            code += `${indentStr}${controlName}.Controls.Add(${child.name.replace(/\s+/g, '')});\n`;
            if (index < comp.children.length - 1) code += `\n`;
          });
        }
        break;

      case 'List':
        code += `${indentStr}var ${controlName} = new ListBox();\n`;
        if (comp.styles.width) code += `${indentStr}${controlName}.Width = ${parseInt(comp.styles.width) || 200};\n`;
        if (comp.styles.height) code += `${indentStr}${controlName}.Height = ${parseInt(comp.styles.height) || 100};\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
        break;

      default:
        code += `${indentStr}var ${controlName} = new Control();\n`;
        code += `${indentStr}${controlName}.Text = "${comp.type}";\n`;
        code += `${indentStr}${controlName}.Location = new Point(10, ${indent * 40 + 10});\n`;
    }

    return code;
  };

  const generateFullCode = (): string => {
    if (!component) {
      return `// Add components to see generated C# code`;
    }

    const formName = 'Form1'; // You can make this dynamic based on page name
    let code = `using System;\n`;
    code += `using System.Drawing;\n`;
    code += `using System.Windows.Forms;\n\n`;
    code += `public partial class ${formName} : Form\n`;
    code += `{\n`;
    code += `    public ${formName}()\n`;
    code += `    {\n`;
    code += `        InitializeComponent();\n`;
    code += `        InitializeCustomComponents();\n`;
    code += `    }\n\n`;
    code += `    private void InitializeCustomComponents()\n`;
    code += `    {\n`;
    code += generateWinFormsCode(component, 0);
    code += `        this.Controls.Add(${component.name.replace(/\s+/g, '')});\n\n`;
    code += `        // Form properties\n`;
    code += `        this.Text = "${formName}";\n`;
    code += `        this.Size = new Size(800, 600);\n`;
    code += `        this.StartPosition = FormStartPosition.CenterScreen;\n`;
    code += `    }\n`;
    code += `}\n`;

    return code;
  };

  const csharpCode = generateFullCode();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(csharpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">C# Windows Forms Code</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Code
            </>
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono bg-background border border-border rounded p-4 overflow-auto">
          <code>{csharpCode}</code>
        </pre>
      </div>
    </div>
  );
}
