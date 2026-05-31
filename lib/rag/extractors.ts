/**
 * SummonIQ RAG extractors for Flow.
 */

import type {
  AgentMemory,
  BestPractice,
  Component,
  ConfigTemplate,
  KnowledgeDocument,
  ProjectMemory,
  Ticket,
} from '@prisma/client';
import type { ExtractedContent } from '@summoniq/rag';

export interface ContentExtractor<T> {
  extract(source: T): ExtractedContent;
}

export class ProjectMemoryExtractor implements ContentExtractor<ProjectMemory> {
  extract(memory: ProjectMemory): ExtractedContent {
    return {
      text: `
# ${memory.title || 'Project Memory'}

Category: ${memory.category}
${memory.tags?.length ? `Tags: ${memory.tags.join(', ')}` : ''}
${memory.source ? `Source: ${memory.source}` : ''}

${memory.content}
      `.trim(),
      metadata: {
        projectId: memory.projectId,
        category: memory.category,
        importance: memory.importance,
        title: memory.title,
        tags: memory.tags,
        source: memory.source,
      },
    };
  }
}

export class KnowledgeDocumentExtractor implements ContentExtractor<KnowledgeDocument> {
  extract(doc: KnowledgeDocument): ExtractedContent {
    return {
      text: `
# ${doc.title}

Type: ${doc.type}
${doc.category ? `Category: ${doc.category}` : ''}
${doc.tags?.length ? `Tags: ${doc.tags.join(', ')}` : ''}
Status: ${doc.status}

${doc.content}
      `.trim(),
      metadata: {
        projectId: doc.projectId ?? undefined,
        category: doc.category ?? undefined,
        importance: doc.status === 'published' ? 8 : 5,
        title: doc.title,
        tags: doc.tags,
        documentType: doc.type,
        status: doc.status,
      },
    };
  }
}

export class AgentMemoryExtractor implements ContentExtractor<AgentMemory> {
  extract(memory: AgentMemory): ExtractedContent {
    return {
      text: `
# Agent Memory: ${memory.key}

Type: ${memory.type}
Scope: ${memory.scope}
${memory.context ? `Context: ${memory.context}` : ''}

${memory.value}
      `.trim(),
      metadata: {
        category: memory.type,
        importance: memory.priority,
        title: memory.key,
        agentId: memory.agentId,
        scope: memory.scope,
        scopeId: memory.scopeId,
        confidence: memory.confidence,
      },
    };
  }
}

export class BestPracticeExtractor implements ContentExtractor<BestPractice> {
  extract(practice: BestPractice): ExtractedContent {
    return {
      text: `
# Best Practice: ${practice.name}

Topic: ${practice.topic}
App Type: ${practice.appType}
${practice.description ? `Description: ${practice.description}` : ''}
${practice.tags?.length ? `Tags: ${practice.tags.join(', ')}` : ''}

${practice.content}
      `.trim(),
      metadata: {
        category: practice.topic,
        importance: practice.priority + 5,
        title: practice.name,
        tags: practice.tags,
        appType: practice.appType,
      },
    };
  }
}

export class ComponentExtractor implements ContentExtractor<Component> {
  extract(component: Component): ExtractedContent {
    return {
      text: `
# Component: ${component.name}

Category: ${component.category}
Type: ${component.type}
${component.tags?.length ? `Tags: ${component.tags.join(', ')}` : ''}

## Description
${component.description || 'No description'}

## Documentation
${component.documentation || 'No documentation'}

## Props
${component.props ? JSON.stringify(component.props, null, 2) : 'No props schema'}

## Code
\`\`\`tsx
${component.code}
\`\`\`
      `.trim(),
      metadata: {
        category: component.category,
        importance: 7,
        title: component.name,
        tags: component.tags,
        componentType: component.type,
        slug: component.slug,
      },
    };
  }
}

export class ConfigTemplateExtractor implements ContentExtractor<ConfigTemplate> {
  extract(template: ConfigTemplate): ExtractedContent {
    return {
      text: `
# Config Template: ${template.name}

Config Type: ${template.configType}
${template.appType ? `App Type: ${template.appType}` : ''}
Scope: ${template.scope}
${template.description ? `Description: ${template.description}` : ''}

## Configuration
\`\`\`json
${JSON.stringify(template.content, null, 2)}
\`\`\`

${template.rawContent ? `## Raw Content\n${template.rawContent}` : ''}
      `.trim(),
      metadata: {
        category: template.configType,
        importance: template.isActive ? 6 : 3,
        title: template.name,
        configType: template.configType,
        appType: template.appType,
        scope: template.scope,
      },
    };
  }
}

export class TicketExtractor implements ContentExtractor<Ticket> {
  extract(ticket: Ticket): ExtractedContent {
    const acceptanceCriteria = ticket.acceptanceCriteria
      ? `\n## Acceptance Criteria\n${JSON.stringify(ticket.acceptanceCriteria, null, 2)}`
      : '';

    return {
      text: `
# Ticket: ${ticket.title}

Status: ${ticket.status}
Priority: ${ticket.priority}
${ticket.labels?.length ? `Labels: ${ticket.labels.join(', ')}` : ''}

## Description
${ticket.description || 'No description'}
${acceptanceCriteria}
${ticket.businessRequirements ? `\n## Business Requirements\n${ticket.businessRequirements}` : ''}
      `.trim(),
      metadata: {
        projectId: ticket.projectId,
        category: 'ticket',
        importance: this.priorityToImportance(ticket.priority),
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        labels: ticket.labels,
      },
    };
  }

  private priorityToImportance(priority: string): number {
    switch (priority) {
      case 'CRITICAL':
        return 10;
      case 'HIGH':
        return 8;
      case 'MEDIUM':
        return 5;
      case 'LOW':
        return 3;
      default:
        return 5;
    }
  }
}
