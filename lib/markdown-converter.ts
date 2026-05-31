import type { Value } from 'platejs';

/**
 * Convert Plate editor value to markdown string
 */
export function plateToMarkdown(value: Value): string {
  let markdown = '';

  for (const node of value) {
    markdown += nodeToMarkdown(node as any);
  }

  return markdown.trim();
}

function nodeToMarkdown(node: any, listDepth = 0): string {
  if (node.text !== undefined) {
    // Text node with marks
    let text = node.text;
    
    if (node.bold) text = `**${text}**`;
    if (node.italic) text = `*${text}*`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `~~${text}~~`;
    if (node.code) text = `\`${text}\``;
    
    return text;
  }

  const children = node.children?.map((child: any) => nodeToMarkdown(child, listDepth)).join('') || '';

  switch (node.type) {
    case 'h1':
      return `# ${children}\n\n`;
    case 'h2':
      return `## ${children}\n\n`;
    case 'h3':
      return `### ${children}\n\n`;
    case 'h4':
      return `#### ${children}\n\n`;
    case 'h5':
      return `##### ${children}\n\n`;
    case 'h6':
      return `###### ${children}\n\n`;
    case 'p':
      return `${children}\n\n`;
    case 'blockquote':
      return `> ${children}\n\n`;
    case 'code_block':
      return `\`\`\`\n${children}\n\`\`\`\n\n`;
    case 'ul':
      return `${children}\n`;
    case 'ol':
      return `${children}\n`;
    case 'li':
      return `${'  '.repeat(listDepth)}- ${children}\n`;
    case 'a':
      return `[${children}](${node.url || ''})`;
    default:
      return children;
  }
}

/**
 * Convert markdown string to Plate editor value
 */
export function markdownToPlate(markdown: string): Value {
  const lines = markdown.split('\n');
  const value: Value = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      value.push({ type: 'h1', children: [{ text: line.slice(2) }] });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      value.push({ type: 'h2', children: [{ text: line.slice(3) }] });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      value.push({ type: 'h3', children: [{ text: line.slice(4) }] });
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      value.push({ type: 'h4', children: [{ text: line.slice(5) }] });
      i++;
      continue;
    }
    if (line.startsWith('##### ')) {
      value.push({ type: 'h5', children: [{ text: line.slice(6) }] });
      i++;
      continue;
    }
    if (line.startsWith('###### ')) {
      value.push({ type: 'h6', children: [{ text: line.slice(7) }] });
      i++;
      continue;
    }

    // Code block (triple backticks)
    if (line.startsWith('```')) {
      i++; // Skip opening backticks
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing backticks
      value.push({ 
        type: 'code_block', 
        children: [{ text: codeLines.join('\n') }] 
      });
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      value.push({ type: 'blockquote', children: [{ text: line.slice(2) }] });
      i++;
      continue;
    }

    // List items
    if (line.match(/^[\s]*[-*] /)) {
      const listItems: any[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*] /)) {
        const itemText = lines[i].replace(/^[\s]*[-*] /, '');
        listItems.push({ type: 'li', children: [{ text: itemText }] });
        i++;
      }
      value.push({ type: 'ul', children: listItems });
      continue;
    }

    if (line.match(/^[\s]*\d+\. /)) {
      const listItems: any[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*\d+\. /)) {
        const itemText = lines[i].replace(/^[\s]*\d+\. /, '');
        listItems.push({ type: 'li', children: [{ text: itemText }] });
        i++;
      }
      value.push({ type: 'ol', children: listItems });
      continue;
    }

    // Regular paragraph
    value.push({ type: 'p', children: parseInlineMarkdown(line) });
    i++;
  }

  // If empty, add default paragraph
  if (value.length === 0) {
    value.push({ type: 'p', children: [{ text: '' }] });
  }

  return value;
}

/**
 * Parse inline markdown (bold, italic, code, links)
 */
function parseInlineMarkdown(text: string): any[] {
  const children: any[] = [];
  let remaining = text;

  // Pattern: `code`, **bold**, *italic*
  const patterns = [
    { regex: /`([^`]+)`/g, mark: 'code' },
    { regex: /\*\*([^*]+)\*\*/g, mark: 'bold' },
    { regex: /\*([^*]+)\*/g, mark: 'italic' },
  ];

  let lastIndex = 0;
  const matches: Array<{ index: number; length: number; text: string; mark: string }> = [];

  // Find all matches
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[1],
        mark: pattern.mark,
      });
    }
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build children array
  for (const match of matches) {
    // Add plain text before match
    if (match.index > lastIndex) {
      children.push({ text: text.slice(lastIndex, match.index) });
    }
    // Add formatted text
    children.push({ text: match.text, [match.mark]: true });
    lastIndex = match.index + match.length;
  }

  // Add remaining plain text
  if (lastIndex < text.length) {
    children.push({ text: text.slice(lastIndex) });
  }

  // If no matches, return plain text
  if (children.length === 0) {
    children.push({ text: text });
  }

  return children;
}
