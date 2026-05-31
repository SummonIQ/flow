'use client';

import { useTheme } from '@/components/themes/theme-provider';
import { generateReactPageCode } from '@/lib/studio/codegen';
import { useBuilderStore } from '@/lib/studio/store';
import Editor from '@monaco-editor/react';

export function CodeEditor({
  showHeader = true,
  enableMinimap = false,
}: {
  showHeader?: boolean;
  enableMinimap?: boolean;
} = {}) {
  const { getComponents, getRootId, project, getCurrentPage } =
    useBuilderStore();
  const codeFile = useBuilderStore(state => state.codeFile);
  const updateCodeContent = useBuilderStore(state => state.updateCodeContent);
  const components = getComponents();
  const rootId = getRootId();
  const currentPage = getCurrentPage();
  const { theme } = useTheme();

  const isReactProject = project?.type === 'react';

  const rootComponent = rootId ? components[rootId] : null;

  const isFileBacked = Boolean(codeFile.route);
  const code = isFileBacked
    ? codeFile.code
    : isReactProject
      ? generateReactPageCode(currentPage, rootComponent)
      : '';
  const language = 'typescript';
  const title = 'TypeScript / React';

  return (
    <div
      className={
        showHeader
          ? 'h-full bg-card border-l border-border flex flex-col'
          : 'h-full bg-card flex flex-col'
      }
    >
      {showHeader && (
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h2>
        </div>
      )}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: !isFileBacked,
            minimap: { enabled: enableMinimap },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
          onChange={value => {
            if (!isFileBacked) return;
            updateCodeContent(value ?? '');
          }}
        />
      </div>
    </div>
  );
}
