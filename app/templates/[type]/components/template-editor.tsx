'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@summoniq/applab-ui';
import { Save, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface TemplateFile {
  id: string;
  path: string;
  content: string;
  isDirectory: boolean;
}

interface TemplateEditorProps {
  file: TemplateFile;
  onSave: (content: string) => Promise<void>;
  saving: boolean;
}

type EditorTheme = 'auto' | 'vs-dark' | 'light' | 'hc-black' | 'hc-light' | 'github-dark' | 'github-light' | 'monokai' | 'solarized-dark' | 'solarized-light' | 'night-owl';

interface EditorSettings {
  theme: EditorTheme;
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  formatOnSave: boolean;
  formatOnPaste: boolean;
}

export function TemplateEditor({ file, onSave, saving }: TemplateEditorProps) {
  const [content, setContent] = useState(file.content);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const { theme, resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);
  
  // Editor settings with localStorage persistence
  const [settings, setSettings] = useState<EditorSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('template-editor-settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fall through to defaults
        }
      }
    }
    return {
      theme: 'auto',
      fontSize: 14,
      tabSize: 2,
      minimap: false,
      lineNumbers: true,
      wordWrap: true,
      formatOnSave: true,
      formatOnPaste: true,
    };
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('template-editor-settings', JSON.stringify(settings));
    }
  }, [settings]);
  
  // Determine editor theme based on settings and system theme
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const editorTheme = (() => {
    if (settings.theme === 'auto') {
      // Only check theme after component is mounted to avoid hydration mismatch
      if (!mounted) return 'vs-dark'; // Default during SSR
      // Check resolvedTheme first, then theme
      const isDark = resolvedTheme === 'dark' || (!resolvedTheme && theme === 'dark');
      return isDark ? 'vs-dark' : 'light';
    }
    return settings.theme;
  })();

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setContent(file.content);
    setHasChanges(false);
    setSaveStatus('idle');
  }, [file.id, file.content]);

  const handleContentChange = (newContent: string | undefined) => {
    const contentValue = newContent || '';
    setContent(contentValue);
    setHasChanges(contentValue !== file.content);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    try {
      // Format before save if enabled
      if (settings.formatOnSave && editorRef.current) {
        await editorRef.current.getAction('editor.action.formatDocument')?.run();
      }
      
      await onSave(content);
      setHasChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  // Get Monaco language identifier from file extension
  const getLanguage = () => {
    const ext = file.path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'sql':
        return 'sql';
      case 'sh':
        return 'shell';
      case 'py':
        return 'python';
      case 'rb':
        return 'ruby';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'toml':
        return 'toml';
      case 'prisma':
        return 'prisma';
      default:
        return 'plaintext';
    }
  };

  // Get display name for language
  const getLanguageDisplay = () => {
    const ext = file.path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'json':
        return 'JSON';
      case 'css':
        return 'CSS';
      case 'scss':
        return 'SCSS';
      case 'md':
        return 'Markdown';
      case 'html':
        return 'HTML';
      case 'yaml':
      case 'yml':
        return 'YAML';
      default:
        return 'Text';
    }
  };

  // Keyboard shortcut for save (Cmd/Ctrl + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !saving) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, saving, content]);

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{file.path}</span>
          <span className="text-xs text-muted-foreground">{getLanguageDisplay()}</span>
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400">● Modified</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>Error saving</span>
            </div>
          )}
          
          {/* Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Editor Settings</h4>
                  <p className="text-xs text-muted-foreground">Customize your editing experience</p>
                </div>

                <div className="space-y-3">
                  {/* Theme */}
                  <div className="space-y-2">
                    <Label htmlFor="editor-theme" className="text-xs">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value: EditorTheme) => updateSetting('theme', value)}>
                      <SelectTrigger id="editor-theme" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Follow System)</SelectItem>
                        <SelectItem value="light">VS Code Light</SelectItem>
                        <SelectItem value="vs-dark">VS Code Dark</SelectItem>
                        <SelectItem value="github-light">GitHub Light</SelectItem>
                        <SelectItem value="github-dark">GitHub Dark</SelectItem>
                        <SelectItem value="monokai">Monokai</SelectItem>
                        <SelectItem value="solarized-light">Solarized Light</SelectItem>
                        <SelectItem value="solarized-dark">Solarized Dark</SelectItem>
                        <SelectItem value="night-owl">Night Owl</SelectItem>
                        <SelectItem value="hc-black">High Contrast Dark</SelectItem>
                        <SelectItem value="hc-light">High Contrast Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label htmlFor="font-size" className="text-xs">Font Size</Label>
                    <Select value={settings.fontSize.toString()} onValueChange={(value) => updateSetting('fontSize', parseInt(value))}>
                      <SelectTrigger id="font-size" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12px</SelectItem>
                        <SelectItem value="13">13px</SelectItem>
                        <SelectItem value="14">14px</SelectItem>
                        <SelectItem value="16">16px</SelectItem>
                        <SelectItem value="18">18px</SelectItem>
                        <SelectItem value="20">20px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tab Size */}
                  <div className="space-y-2">
                    <Label htmlFor="tab-size" className="text-xs">Tab Size</Label>
                    <Select value={settings.tabSize.toString()} onValueChange={(value) => updateSetting('tabSize', parseInt(value))}>
                      <SelectTrigger id="tab-size" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 spaces</SelectItem>
                        <SelectItem value="4">4 spaces</SelectItem>
                        <SelectItem value="8">8 spaces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle Options */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minimap" className="text-xs cursor-pointer">Show Minimap</Label>
                    <Switch id="minimap" checked={settings.minimap} onCheckedChange={(checked: boolean) => updateSetting('minimap', checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="line-numbers" className="text-xs cursor-pointer">Line Numbers</Label>
                    <Switch id="line-numbers" checked={settings.lineNumbers} onCheckedChange={(checked: boolean) => updateSetting('lineNumbers', checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="word-wrap" className="text-xs cursor-pointer">Word Wrap</Label>
                    <Switch id="word-wrap" checked={settings.wordWrap} onCheckedChange={(checked: boolean) => updateSetting('wordWrap', checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="format-on-save" className="text-xs cursor-pointer">Format on Save</Label>
                    <Switch id="format-on-save" checked={settings.formatOnSave} onCheckedChange={(checked: boolean) => updateSetting('formatOnSave', checked)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="format-on-paste" className="text-xs cursor-pointer">Format on Paste</Label>
                    <Switch id="format-on-paste" checked={settings.formatOnPaste} onCheckedChange={(checked: boolean) => updateSetting('formatOnPaste', checked)} />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            size="sm"
            variant="outline"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      {/* Monaco Editor with Syntax Highlighting */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getLanguage()}
          value={content}
          onChange={handleContentChange}
          theme={editorTheme}
          options={{
            minimap: { enabled: settings.minimap },
            fontSize: settings.fontSize,
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            tabSize: settings.tabSize,
            insertSpaces: true,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            formatOnPaste: settings.formatOnPaste,
            formatOnType: true,
            quickSuggestions: true,
            suggest: {
              showMethods: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
            },
            // ESLint and Prettier support
            fixedOverflowWidgets: true,
          }}
          beforeMount={(monaco) => {
            // Define custom themes
            monaco.editor.defineTheme('github-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#c9d1d9',
                'editor.lineHighlightBackground': '#161b22',
                'editorLineNumber.foreground': '#6e7681',
                'editorCursor.foreground': '#58a6ff',
              },
            });
            
            monaco.editor.defineTheme('github-light', {
              base: 'vs',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#24292f',
                'editor.lineHighlightBackground': '#f6f8fa',
                'editorLineNumber.foreground': '#57606a',
              },
            });
            
            monaco.editor.defineTheme('monokai', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '75715e' },
                { token: 'string', foreground: 'e6db74' },
                { token: 'number', foreground: 'ae81ff' },
                { token: 'keyword', foreground: 'f92672' },
              ],
              colors: {
                'editor.background': '#272822',
                'editor.foreground': '#f8f8f2',
                'editorCursor.foreground': '#f8f8f0',
              },
            });
            
            monaco.editor.defineTheme('solarized-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#002b36',
                'editor.foreground': '#839496',
                'editorCursor.foreground': '#d33682',
              },
            });
            
            monaco.editor.defineTheme('solarized-light', {
              base: 'vs',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#fdf6e3',
                'editor.foreground': '#657b83',
                'editorCursor.foreground': '#d33682',
              },
            });
            
            monaco.editor.defineTheme('night-owl', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '637777' },
                { token: 'string', foreground: 'ecc48d' },
                { token: 'number', foreground: 'f78c6c' },
                { token: 'keyword', foreground: 'c792ea' },
              ],
              colors: {
                'editor.background': '#011627',
                'editor.foreground': '#d6deeb',
                'editorCursor.foreground': '#80a4c2',
              },
            });
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div>
          Lines: {content.split('\n').length} • Characters: {content.length}
        </div>
        <div>
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Cmd</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">S</kbd> to save
        </div>
      </div>
    </div>
  );
}
