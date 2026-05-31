/**
 * Schema for AGENTS.md file structure
 * Represents AI development guidelines with structured sections
 */

export interface AgentsMdMetadata {
  purpose: string;
  lastUpdated: string;
  framework: string;
  project: string;
}

export interface AgentsMdSubsection {
  title: string;
  content: string;
  codeBlocks?: Array<{
    language: string;
    code: string;
    description?: string;
  }>;
  bulletPoints?: string[];
  numberedList?: string[];
}

export interface AgentsMdSection {
  id: string;
  title: string;
  content: string;
  subsections?: AgentsMdSubsection[];
  codeBlocks?: Array<{
    language: string;
    code: string;
    description?: string;
  }>;
  bulletPoints?: string[];
  checklistItems?: Array<{
    text: string;
    checked: boolean;
  }>;
}

export interface AgentsMdSchema {
  metadata: AgentsMdMetadata;
  tableOfContents: Array<{
    title: string;
    link: string;
    level: number;
  }>;
  sections: AgentsMdSection[];
  locked: boolean; // Prevents AI agent from editing
}

/**
 * Parse AGENTS.md content into structured schema
 */
export function parseAgentsMd(content: string): AgentsMdSchema {
  const lines = content.split('\n');
  
  // Extract metadata from header
  const metadata: AgentsMdMetadata = {
    purpose: extractMetadataValue(lines, 'Purpose:'),
    lastUpdated: extractMetadataValue(lines, 'Last Updated:'),
    framework: extractMetadataValue(lines, 'Framework:'),
    project: extractMetadataValue(lines, 'Project:'),
  };

  // Extract table of contents
  const tableOfContents: AgentsMdSchema['tableOfContents'] = [];
  const tocStart = lines.findIndex(l => l.includes('## Table of Contents'));
  const tocEnd = lines.findIndex((l, i) => i > tocStart && l.startsWith('---'));
  
  if (tocStart !== -1 && tocEnd !== -1) {
    for (let i = tocStart + 1; i < tocEnd; i++) {
      const match = lines[i].match(/^(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        tableOfContents.push({
          title: match[2],
          link: match[3],
          level: 1,
        });
      }
    }
  }

  // Extract sections
  const sections: AgentsMdSection[] = [];
  const sectionStarts: number[] = [];
  
  lines.forEach((line, index) => {
    if (line.startsWith('## ') && !line.includes('Table of Contents')) {
      sectionStarts.push(index);
    }
  });

  sectionStarts.forEach((start, idx) => {
    const end = idx < sectionStarts.length - 1 ? sectionStarts[idx + 1] : lines.length;
    const sectionLines = lines.slice(start, end);
    const title = sectionLines[0].replace('## ', '').trim();
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    sections.push({
      id,
      title,
      content: sectionLines.slice(1).join('\n').trim(),
      subsections: extractSubsections(sectionLines),
      codeBlocks: extractCodeBlocks(sectionLines),
      bulletPoints: extractBulletPoints(sectionLines),
      checklistItems: extractChecklistItems(sectionLines),
    });
  });

  return {
    metadata,
    tableOfContents,
    sections,
    locked: false,
  };
}

/**
 * Convert structured schema back to markdown
 */
export function stringifyAgentsMd(schema: AgentsMdSchema): string {
  let md = '# AI Agent Development Guidelines\n\n';
  
  // Metadata
  md += `**Purpose:** ${schema.metadata.purpose}\n\n`;
  md += `**Last Updated:** ${schema.metadata.lastUpdated}\n`;
  md += `**Framework:** ${schema.metadata.framework}\n`;
  md += `**Project:** ${schema.metadata.project}\n\n`;
  md += '---\n\n';
  
  // Table of Contents
  if (schema.tableOfContents.length > 0) {
    md += '## Table of Contents\n\n';
    schema.tableOfContents.forEach((item, idx) => {
      md += `${idx + 1}. [${item.title}](${item.link})\n`;
    });
    md += '\n---\n\n';
  }
  
  // Sections
  schema.sections.forEach(section => {
    md += `## ${section.title}\n\n`;
    md += `${section.content}\n\n`;
  });
  
  return md;
}

// Helper functions
function extractMetadataValue(lines: string[], key: string): string {
  const line = lines.find(l => l.includes(key));
  if (!line) return '';
  return line.split(key)[1]?.trim().replace(/\*\*/g, '') || '';
}

function extractSubsections(lines: string[]): AgentsMdSubsection[] {
  const subsections: AgentsMdSubsection[] = [];
  const subsectionStarts: number[] = [];
  
  lines.forEach((line, index) => {
    if (line.startsWith('### ')) {
      subsectionStarts.push(index);
    }
  });
  
  subsectionStarts.forEach((start, idx) => {
    const end = idx < subsectionStarts.length - 1 ? subsectionStarts[idx + 1] : lines.length;
    const subsectionLines = lines.slice(start, end);
    const title = subsectionLines[0].replace('### ', '').trim();
    
    subsections.push({
      title,
      content: subsectionLines.slice(1).join('\n').trim(),
    });
  });
  
  return subsections;
}

function extractCodeBlocks(lines: string[]): Array<{ language: string; code: string }> {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  let inCodeBlock = false;
  let currentLanguage = '';
  let currentCode: string[] = [];
  
  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        codeBlocks.push({
          language: currentLanguage,
          code: currentCode.join('\n'),
        });
        currentCode = [];
        inCodeBlock = false;
      } else {
        currentLanguage = line.substring(3).trim();
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      currentCode.push(line);
    }
  });
  
  return codeBlocks;
}

function extractBulletPoints(lines: string[]): string[] {
  return lines
    .filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))
    .map(l => l.trim().substring(2).trim());
}

function extractChecklistItems(lines: string[]): Array<{ text: string; checked: boolean }> {
  return lines
    .filter(l => l.trim().startsWith('- [ ]') || l.trim().startsWith('- [x]'))
    .map(l => ({
      text: l.replace(/- \[[x ]\]/, '').trim(),
      checked: l.includes('[x]'),
    }));
}
