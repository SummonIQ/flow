'use client';

import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@summoniq/applab-ui';
import {
  Copy,
  Download,
  History,
  Palette,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Utility to convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 100 * 10) / 10,
    l: Math.round(l * 100 * 10) / 10,
  };
}

// Generate brand color CSS variables
function generateBrandColorVariables(colors: string[]): string {
  const variables: string[] = [];

  colors.forEach((color, index) => {
    const hsl = hexToHSL(color);
    const brandNum = index + 1;

    variables.push(`    /* Brand color ${brandNum} - ${color} */`);
    variables.push(`    --brand-${brandNum}-lightest: ${hsl.h} ${hsl.s}% 95%;`);
    variables.push(`    --brand-${brandNum}-lighter: ${hsl.h} ${hsl.s}% 80%;`);
    variables.push(`    --brand-${brandNum}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
    variables.push(
      `    --brand-${brandNum}-dark: ${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 15, 5)}%;`,
    );
    variables.push(
      `    --brand-${brandNum}-darker: ${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 30, 5)}%;`,
    );
    variables.push(
      `    --brand-${brandNum}-darkest: ${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 45, 5)}%;`,
    );
    if (index < colors.length - 1) {
      variables.push('');
    }
  });

  return variables.join('\n');
}

// Tailwind color palette
const tailwindColors = {
  slate: [
    '#f8fafc',
    '#f1f5f9',
    '#e2e8f0',
    '#cbd5e1',
    '#94a3b8',
    '#64748b',
    '#475569',
    '#334155',
    '#1e293b',
    '#0f172a',
  ],
  gray: [
    '#f9fafb',
    '#f3f4f6',
    '#e5e7eb',
    '#d1d5db',
    '#9ca3af',
    '#6b7280',
    '#4b5563',
    '#374151',
    '#1f2937',
    '#111827',
  ],
  zinc: [
    '#fafafa',
    '#f4f4f5',
    '#e4e4e7',
    '#d4d4d8',
    '#a1a1aa',
    '#71717a',
    '#52525b',
    '#3f3f46',
    '#27272a',
    '#18181b',
  ],
  neutral: [
    '#fafafa',
    '#f5f5f5',
    '#e5e5e5',
    '#d4d4d4',
    '#a3a3a3',
    '#737373',
    '#525252',
    '#404040',
    '#262626',
    '#171717',
  ],
  stone: [
    '#fafaf9',
    '#f5f5f4',
    '#e7e5e4',
    '#d6d3d1',
    '#a8a29e',
    '#78716c',
    '#57534e',
    '#44403c',
    '#292524',
    '#1c1917',
  ],
  red: [
    '#fef2f2',
    '#fee2e2',
    '#fecaca',
    '#fca5a5',
    '#f87171',
    '#ef4444',
    '#dc2626',
    '#b91c1c',
    '#991b1b',
    '#7f1d1d',
  ],
  orange: [
    '#fff7ed',
    '#ffedd5',
    '#fed7aa',
    '#fdba74',
    '#fb923c',
    '#f97316',
    '#ea580c',
    '#c2410c',
    '#9a3412',
    '#7c2d12',
  ],
  amber: [
    '#fffbeb',
    '#fef3c7',
    '#fde68a',
    '#fcd34d',
    '#fbbf24',
    '#f59e0b',
    '#d97706',
    '#b45309',
    '#92400e',
    '#78350f',
  ],
  yellow: [
    '#fefce8',
    '#fef9c3',
    '#fef08a',
    '#fde047',
    '#facc15',
    '#eab308',
    '#ca8a04',
    '#a16207',
    '#854d0e',
    '#713f12',
  ],
  lime: [
    '#f7fee7',
    '#ecfccb',
    '#d9f99d',
    '#bef264',
    '#a3e635',
    '#84cc16',
    '#65a30d',
    '#4d7c0f',
    '#3f6212',
    '#365314',
  ],
  green: [
    '#f0fdf4',
    '#dcfce7',
    '#bbf7d0',
    '#86efac',
    '#4ade80',
    '#22c55e',
    '#16a34a',
    '#15803d',
    '#166534',
    '#14532d',
  ],
  emerald: [
    '#ecfdf5',
    '#d1fae5',
    '#a7f3d0',
    '#6ee7b7',
    '#34d399',
    '#10b981',
    '#059669',
    '#047857',
    '#065f46',
    '#064e3b',
  ],
  teal: [
    '#f0fdfa',
    '#ccfbf1',
    '#99f6e4',
    '#5eead4',
    '#2dd4bf',
    '#14b8a6',
    '#0d9488',
    '#0f766e',
    '#115e59',
    '#134e4a',
  ],
  cyan: [
    '#ecfeff',
    '#cffafe',
    '#a5f3fc',
    '#67e8f9',
    '#22d3ee',
    '#06b6d4',
    '#0891b2',
    '#0e7490',
    '#155e75',
    '#164e63',
  ],
  sky: [
    '#f0f9ff',
    '#e0f2fe',
    '#bae6fd',
    '#7dd3fc',
    '#38bdf8',
    '#0ea5e9',
    '#0284c7',
    '#0369a1',
    '#075985',
    '#0c4a6e',
  ],
  blue: [
    '#eff6ff',
    '#dbeafe',
    '#bfdbfe',
    '#93c5fd',
    '#60a5fa',
    '#3b82f6',
    '#2563eb',
    '#1d4ed8',
    '#1e40af',
    '#1e3a8a',
  ],
  indigo: [
    '#eef2ff',
    '#e0e7ff',
    '#c7d2fe',
    '#a5b4fc',
    '#818cf8',
    '#6366f1',
    '#4f46e5',
    '#4338ca',
    '#3730a3',
    '#312e81',
  ],
  violet: [
    '#f5f3ff',
    '#ede9fe',
    '#ddd6fe',
    '#c4b5fd',
    '#a78bfa',
    '#8b5cf6',
    '#7c3aed',
    '#6d28d9',
    '#5b21b6',
    '#4c1d95',
  ],
  purple: [
    '#faf5ff',
    '#f3e8ff',
    '#e9d5ff',
    '#d8b4fe',
    '#c084fc',
    '#a855f7',
    '#9333ea',
    '#7e22ce',
    '#6b21a8',
    '#581c87',
  ],
  fuchsia: [
    '#fdf4ff',
    '#fae8ff',
    '#f5d0fe',
    '#f0abfc',
    '#e879f9',
    '#d946ef',
    '#c026d3',
    '#a21caf',
    '#86198f',
    '#701a75',
  ],
  pink: [
    '#fdf2f8',
    '#fce7f3',
    '#fbcfe8',
    '#f9a8d4',
    '#f472b6',
    '#ec4899',
    '#db2777',
    '#be185d',
    '#9d174d',
    '#831843',
  ],
  rose: [
    '#fff1f2',
    '#ffe4e6',
    '#fecdd3',
    '#fda4af',
    '#fb7185',
    '#f43f5e',
    '#e11d48',
    '#be123c',
    '#9f1239',
    '#881337',
  ],
};

interface SavedLogo {
  id: string;
  svg: string;
  prompt: string;
  colors: string[];
  timestamp: number;
}

interface BrandingTabProps {
  project: {
    name: string;
    description: string;
  };
}

export function BrandingTab({ project }: BrandingTabProps) {
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [generatedLogo, setGeneratedLogo] = useState<string>('');
  const [currentLogoPrompt, setCurrentLogoPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);
  const [isSuggestingPrompt, setIsSuggestingPrompt] = useState(false);
  const [savedLogos, setSavedLogos] = useState<SavedLogo[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState<number | null>(null);
  const [isCreatingNewLogo, setIsCreatingNewLogo] = useState(false);

  // Logo generation customization
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [logoStyle, setLogoStyle] = useState('modern');
  const [logoMood, setLogoMood] = useState('professional');
  const [logoComplexity, setLogoComplexity] = useState('medium');

  // Prompt history for up/down navigation
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Chat interface state
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; svg?: string }>
  >([]);
  const [chatInput, setChatInput] = useState('');
  const [chatInputHistory, setChatInputHistory] = useState<string[]>([]);
  const [chatInputHistoryIndex, setChatInputHistoryIndex] = useState(-1);
  const [chatInputDraft, setChatInputDraft] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isSendingChatRef = useRef(false);

  // Preview background state
  const [previewBg, setPreviewBg] = useState<'transparent' | 'light' | 'dark'>(
    'transparent',
  );

  // Load saved brand colors from database on mount
  useEffect(() => {
    const loadBrandColors = async () => {
      try {
        console.log('[Branding] Loading colors for project:', project.name);
        const response = await fetch(
          `/api/projects/${encodeURIComponent(project.name)}/branding`,
        );
        console.log('[Branding] Load response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[Branding] Loaded data:', data);
          setBrandColors(data.brandColors || []);
        } else if (response.status === 404) {
          // Project not in database yet - that's OK, start with empty array
          console.log(
            '[Branding] Project not found in DB yet - starting fresh',
          );
          setBrandColors([]);
        } else {
          const errorData = await response.json();
          console.error(
            '[Branding] Failed to load:',
            response.status,
            errorData,
          );
          toast.error('Failed to load brand colors');
        }
      } catch (error) {
        console.error('[Branding] Error loading brand colors:', error);
      }
    };

    loadBrandColors();

    // Load logos from localStorage
    const logosKey = `branding-logos-${project.name}`;
    const savedLogosData = localStorage.getItem(logosKey);
    if (savedLogosData) {
      try {
        const logos = JSON.parse(savedLogosData);
        setSavedLogos(logos);
        // Set the most recent logo as the current preview
        if (logos.length > 0) {
          setGeneratedLogo(logos[0].svg);
        }
      } catch (error) {
        console.error('Error loading saved logos:', error);
      }
    }

    // Load prompt history from localStorage
    const historyKey = `logo-prompt-history-${project.name}`;
    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) {
      try {
        setPromptHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading prompt history:', error);
      }
    }

    // Load chat history from localStorage
    const chatKey = `logo-chat-history-${project.name}`;
    const savedChat = localStorage.getItem(chatKey);
    if (savedChat) {
      try {
        setChatMessages(JSON.parse(savedChat));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, [project.name]);

  // Save logos to localStorage whenever they change
  useEffect(() => {
    if (savedLogos.length > 0) {
      const storageKey = `branding-logos-${project.name}`;
      localStorage.setItem(storageKey, JSON.stringify(savedLogos));
    }
  }, [savedLogos, project.name]);

  // Save prompt history to localStorage whenever it changes
  useEffect(() => {
    if (promptHistory.length > 0) {
      const historyKey = `logo-prompt-history-${project.name}`;
      localStorage.setItem(historyKey, JSON.stringify(promptHistory));
    }
  }, [promptHistory, project.name]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatMessages.length > 0) {
      const chatKey = `logo-chat-history-${project.name}`;
      localStorage.setItem(chatKey, JSON.stringify(chatMessages));
    }
  }, [chatMessages, project.name]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAddColor = async (color: string) => {
    if (brandColors.length >= 5) {
      toast.error('Maximum 5 brand colors allowed');
      return;
    }
    const newColors = [...brandColors, color];
    setBrandColors(newColors);
    setShowColorPicker(false);

    // Save to database
    try {
      await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/branding`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandColors: newColors }),
        },
      );
      toast.success('Color added');
    } catch (error) {
      toast.error('Failed to save color');
    }
  };

  const handleRemoveColor = async (index: number) => {
    const newColors = brandColors.filter((_, i) => i !== index);
    setBrandColors(newColors);

    // Save to database
    try {
      await fetch(
        `/api/projects/${encodeURIComponent(project.name)}/branding`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandColors: newColors }),
        },
      );
      toast.success('Color removed');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const handleSaveBrandColors = async () => {
    if (brandColors.length === 0) {
      toast.error('Please add at least one brand color');
      return;
    }

    setIsSaving(true);
    try {
      const cssVariables = generateBrandColorVariables(brandColors);

      const response = await fetch('/api/branding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          cssVariables,
          colors: brandColors,
        }),
      });

      if (response.ok) {
        toast.success('Brand colors saved to globals.css!');
        setHasChanges(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save brand colors');
      }
    } catch (error) {
      console.error('Error saving brand colors:', error);
      toast.error('Failed to save brand colors');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestPrompt = async () => {
    setIsSuggestingPrompt(true);
    try {
      const response = await fetch('/api/suggest-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          projectDescription: project.description,
          brandColors: brandColors,
          style: logoStyle,
          mood: logoMood,
          complexity: logoComplexity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suggest prompt');
      }

      const { suggestion } = await response.json();

      // Add to suggestions array and move to the new suggestion
      setPromptSuggestions([...promptSuggestions, suggestion]);
      setCurrentSuggestionIndex(promptSuggestions.length);
      setLogoPrompt(suggestion);

      toast.success('Prompt suggestion generated!');
    } catch (error) {
      console.error('Error suggesting prompt:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to suggest prompt',
      );
    } finally {
      setIsSuggestingPrompt(false);
    }
  };

  const handleNavigateSuggestion = (direction: 'prev' | 'next') => {
    if (promptSuggestions.length === 0) return;

    let newIndex = currentSuggestionIndex;
    if (direction === 'prev' && currentSuggestionIndex > 0) {
      newIndex = currentSuggestionIndex - 1;
    } else if (
      direction === 'next' &&
      currentSuggestionIndex < promptSuggestions.length - 1
    ) {
      newIndex = currentSuggestionIndex + 1;
    }

    setCurrentSuggestionIndex(newIndex);
    setLogoPrompt(promptSuggestions[newIndex]);
  };

  const handleGenerateLogo = async () => {
    if (!logoPrompt.trim()) {
      toast.error('Please enter a logo prompt');
      return;
    }

    // Add prompt to history if not already the most recent
    if (
      logoPrompt.trim() &&
      (promptHistory.length === 0 || promptHistory[0] !== logoPrompt.trim())
    ) {
      const newHistory = [
        logoPrompt.trim(),
        ...promptHistory.filter(p => p !== logoPrompt.trim()),
      ].slice(0, 50); // Keep last 50
      setPromptHistory(newHistory);
      setHistoryIndex(-1);
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoPrompt,
          colors: brandColors,
          projectName: project.name,
          model: selectedModel,
          style: logoStyle,
          mood: logoMood,
          complexity: logoComplexity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate logo');
      }

      const { svg } = await response.json();
      setGeneratedLogo(svg);
      setCurrentLogoPrompt(logoPrompt.trim());

      // Save to history
      const newLogo: SavedLogo = {
        id: Date.now().toString(),
        svg,
        prompt: logoPrompt,
        colors: [...brandColors],
        timestamp: Date.now(),
      };
      const updatedLogos = [newLogo, ...savedLogos];
      setSavedLogos(updatedLogos);

      // Save to localStorage
      const logosKey = `branding-logos-${project.name}`;
      localStorage.setItem(logosKey, JSON.stringify(updatedLogos));

      toast.success('Logo generated and saved to history!');

      // Starting a fresh refinement thread for the newly generated logo
      clearChatForNewLogo();
      setChatMessages([
        {
          role: 'assistant',
          content:
            `Logo generated from prompt: "${logoPrompt.trim()}". ` +
            `You can ask for targeted changes (shape, style, colors, removing elements). ` +
            `The checkered preview indicates transparency.`,
        },
      ]);

      // After generating a new logo, switch back to chat mode for refinements
      setIsCreatingNewLogo(false);
    } catch (error) {
      console.error('Error generating logo:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate logo',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' && promptHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, promptHistory.length - 1);
      setHistoryIndex(newIndex);
      setLogoPrompt(promptHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setLogoPrompt(promptHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setLogoPrompt('');
      }
    }
  };

  const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && chatInputHistory.length > 0) {
      e.preventDefault();
      if (chatInputHistoryIndex === -1) {
        setChatInputDraft(chatInput);
      }
      const newIndex = Math.min(
        chatInputHistoryIndex + 1,
        chatInputHistory.length - 1,
      );
      setChatInputHistoryIndex(newIndex);
      setChatInput(chatInputHistory[newIndex] ?? '');
      return;
    }

    if (e.key === 'ArrowDown' && chatInputHistory.length > 0) {
      e.preventDefault();
      if (chatInputHistoryIndex > 0) {
        const newIndex = chatInputHistoryIndex - 1;
        setChatInputHistoryIndex(newIndex);
        setChatInput(chatInputHistory[newIndex] ?? '');
        return;
      }

      if (chatInputHistoryIndex === 0) {
        setChatInputHistoryIndex(-1);
        setChatInput(chatInputDraft);
        setChatInputDraft('');
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const handleSendChat = async () => {
    if (isSendingChatRef.current) {
      return;
    }
    if (!chatInput.trim()) {
      toast.error('Please enter a message');
      return;
    }

    isSendingChatRef.current = true;

    const userMessage = chatInput.trim();

    setChatInputHistory(prev => {
      if (prev[0] === userMessage) return prev;
      return [userMessage, ...prev].slice(0, 50);
    });
    setChatInputHistoryIndex(-1);
    setChatInputDraft('');
    setChatInput('');

    // Add user message to chat
    const newUserMessage = { role: 'user' as const, content: userMessage };
    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);

    setIsChatting(true);
    setIsGenerating(true); // Show loading overlay on preview
    try {
      const response = await fetch('/api/logo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentSvg: generatedLogo || null,
          logoPrompt: currentLogoPrompt || logoPrompt,
          colors: brandColors,
          projectName: project.name,
          model:
            selectedModel === 'dall-e-3' ||
            selectedModel === 'gemini-2.5-flash-image' ||
            selectedModel === 'gemini-3-pro-image-preview'
              ? 'gpt-4-turbo'
              : selectedModel, // Chat doesn't support image-only models
          style: logoStyle,
          mood: logoMood,
          complexity: logoComplexity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const { message, svg } = await response.json();

      // Add assistant response to chat
      const assistantMessage = {
        role: 'assistant' as const,
        content: message,
        svg: svg || undefined,
      };
      setChatMessages([...updatedMessages, assistantMessage]);

      // Update the generated logo if SVG was returned
      if (svg) {
        setGeneratedLogo(svg);

        // Save to history
        const newLogo: SavedLogo = {
          id: Date.now().toString(),
          svg,
          prompt: userMessage,
          colors: [...brandColors],
          timestamp: Date.now(),
        };
        const updatedLogos = [newLogo, ...savedLogos];
        setSavedLogos(updatedLogos);

        // Save to localStorage
        const logosKey = `branding-logos-${project.name}`;
        localStorage.setItem(logosKey, JSON.stringify(updatedLogos));

        toast.success('Logo updated and saved to history!');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send message',
      );
    } finally {
      setIsChatting(false);
      setIsGenerating(false); // Hide loading overlay
      isSendingChatRef.current = false;
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setChatInputHistory([]);
    setChatInputHistoryIndex(-1);
    setChatInputDraft('');
    const chatKey = `logo-chat-history-${project.name}`;
    localStorage.removeItem(chatKey);
    toast.success('Chat history cleared');
  };

  const clearChatForNewLogo = () => {
    setChatMessages([]);
    setChatInput('');
    setChatInputHistory([]);
    setChatInputHistoryIndex(-1);
    setChatInputDraft('');
    const chatKey = `logo-chat-history-${project.name}`;
    localStorage.removeItem(chatKey);
  };

  const handleCopyLogo = () => {
    navigator.clipboard.writeText(generatedLogo);
    toast.success('Logo SVG copied to clipboard');
  };

  const handleDownloadLogo = () => {
    const blob = new Blob([generatedLogo], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-logo.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Logo downloaded');
  };

  const handleLoadLogo = (logo: SavedLogo) => {
    setGeneratedLogo(logo.svg);
    setLogoPrompt(logo.prompt);
    setCurrentLogoPrompt(logo.prompt);
    setBrandColors(logo.colors);
    toast.success('Logo loaded from history');
  };

  const handleDeleteLogo = (id: string) => {
    const updatedLogos = savedLogos.filter(logo => logo.id !== id);
    setSavedLogos(updatedLogos);

    // Save to localStorage
    const logosKey = `branding-logos-${project.name}`;
    localStorage.setItem(logosKey, JSON.stringify(updatedLogos));

    toast.success('Logo deleted from history');
  };

  const handleSetAsPrimary = async (color: string) => {
    try {
      const response = await fetch('/api/branding/set-theme-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          type: 'primary',
          color,
        }),
      });

      if (response.ok) {
        toast.success('Set as primary color! Refresh to see changes.');
        setColorMenuOpen(null);
      } else {
        toast.error('Failed to set primary color');
      }
    } catch (error) {
      console.error('Error setting primary color:', error);
      toast.error('Failed to set primary color');
    }
  };

  const handleSetAsAccent = async (color: string) => {
    try {
      const response = await fetch('/api/branding/set-theme-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          type: 'accent',
          color,
        }),
      });

      if (response.ok) {
        toast.success('Set as accent color! Refresh to see changes.');
        setColorMenuOpen(null);
      } else {
        toast.error('Failed to set accent color');
      }
    } catch (error) {
      console.error('Error setting accent color:', error);
      toast.error('Failed to set accent color');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Branding</h2>
          <p className="text-sm text-muted-foreground">
            Define your project's brand colors and generate a logo
          </p>
        </div>
      </div>

      {/* Brand Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Brand Colors</h3>
            <p className="text-sm text-muted-foreground">
              Add up to 5 brand colors for your project
            </p>
          </div>
          <div className="flex gap-2 relative">
            {brandColors.length > 0 && (
              <Button
                onClick={handleSaveBrandColors}
                disabled={isSaving || !hasChanges}
                variant={hasChanges ? 'default' : 'outline'}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : hasChanges ? 'Save to CSS' : 'Saved'}
              </Button>
            )}
            <div className="relative">
              <Button
                onClick={() => setShowColorPicker(!showColorPicker)}
                disabled={brandColors.length >= 5}
                variant="outline"
              >
                <Palette className="w-4 h-4" />
                Add Color
              </Button>

              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColorPicker(false)}
                  />

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-80 border border-border rounded-lg shadow-lg bg-popover z-50">
                    <div className="flex items-center justify-between p-3 border-b border-border">
                      <h4 className="font-semibold text-sm">Select a Color</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowColorPicker(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
                      {Object.entries(tailwindColors).map(
                        ([colorName, shades]) => (
                          <div
                            key={colorName}
                            className="flex items-center gap-2"
                          >
                            <h5 className="text-xs font-medium text-muted-foreground capitalize w-16 flex-shrink-0">
                              {colorName}
                            </h5>
                            <div className="grid grid-cols-10 gap-0.5 flex-1">
                              {shades.map((shade, index) => (
                                <button
                                  key={shade}
                                  onClick={() => handleAddColor(shade)}
                                  className={`w-6 h-6 border border-border hover:border-primary hover:scale-110 transition-all ${
                                    index === 0
                                      ? 'rounded-l'
                                      : index === shades.length - 1
                                        ? 'rounded-r'
                                        : ''
                                  }`}
                                  style={{ backgroundColor: shade }}
                                  title={`${colorName}-${(index + 1) * 100}`}
                                />
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Colors */}
        {brandColors.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {brandColors.map((color, index) => (
              <div key={index} className="relative group">
                <div
                  className="w-24 h-24 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                />

                {/* Settings Button */}
                <button
                  onClick={() =>
                    setColorMenuOpen(colorMenuOpen === index ? null : index)
                  }
                  className="absolute top-1 right-1 w-6 h-6 bg-background/90 backdrop-blur-sm border border-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-accent"
                >
                  <Settings2 className="w-3 h-3" />
                </button>

                {/* Settings Dropdown */}
                {colorMenuOpen === index && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setColorMenuOpen(null)}
                    />
                    <div className="absolute top-8 right-1 w-40 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={() => handleSetAsPrimary(color)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        Set as Primary
                      </button>
                      <button
                        onClick={() => handleSetAsAccent(color)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 border-t border-border"
                      >
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        Set as Accent
                      </button>
                    </div>
                  </>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveColor(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="mt-2 text-xs font-mono text-center text-muted-foreground">
                  {color}
                </div>
              </div>
            ))}
          </div>
        )}

        {brandColors.length === 0 && (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No brand colors added yet. Click "Add Color" to get started.
            </p>
          </div>
        )}

        {/* CSS Variables Preview */}
        {brandColors.length > 0 && (
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Generated CSS Variables</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    generateBrandColorVariables(brandColors),
                  );
                  toast.success('CSS variables copied to clipboard');
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto max-h-64 overflow-y-auto">
              <code>{generateBrandColorVariables(brandColors)}</code>
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              These variables will be added to your{' '}
              <code className="px-1 py-0.5 bg-background rounded">
                globals.css
              </code>{' '}
              file
            </p>
            <div className="mt-3 p-3 bg-background rounded border border-border">
              <p className="text-xs font-medium mb-2">Usage in Tailwind:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1
                  </code>{' '}
                  - Base color
                </p>
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1-lightest
                  </code>{' '}
                  - Lightest shade (95%)
                </p>
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1-lighter
                  </code>{' '}
                  - Lighter shade (80%)
                </p>
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1-dark
                  </code>{' '}
                  - Dark shade
                </p>
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1-darker
                  </code>{' '}
                  - Darker shade
                </p>
                <p>
                  <code className="px-1 py-0.5 bg-muted rounded">
                    bg-brand-1-darkest
                  </code>{' '}
                  - Darkest shade
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logo Generation Section */}
      <div className="space-y-4 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI Logo Generation</h3>
            <p className="text-sm text-muted-foreground">
              Chat with AI to create and refine your logo design
            </p>
          </div>
          <div className="flex gap-2">
            {chatMessages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
            <Popover open={showHistory} onOpenChange={setShowHistory}>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={savedLogos.length === 0}>
                  <History className="w-4 h-4 mr-2" />
                  History ({savedLogos.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[420px] p-2">
                <div className="px-2 py-1.5 text-sm font-medium">History</div>
                <div className="max-h-96 overflow-y-auto">
                  {savedLogos.map(logo => (
                    <button
                      key={logo.id}
                      type="button"
                      className="flex w-full gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted"
                      onClick={() => {
                        handleLoadLogo(logo);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-checkered">
                        <div
                          className="size-10"
                          dangerouslySetInnerHTML={{ __html: logo.svg }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground">
                          {new Date(logo.timestamp).toLocaleDateString()}{' '}
                          {new Date(logo.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm line-clamp-2">
                          {logo.prompt || 'Logo'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat + Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingNewLogo(v => !v);
                  if (!isCreatingNewLogo) {
                    setLogoPrompt('');
                    setHistoryIndex(-1);
                    setCurrentSuggestionIndex(-1);
                    clearChatForNewLogo();
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>

            {isCreatingNewLogo && (
              <>
                {/* Settings */}
                <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                  <h4 className="text-sm font-semibold">Generation Settings</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="model-select" className="text-xs">
                        AI Model
                      </Label>
                      <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4-turbo">
                            GPT-4 Turbo
                          </SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gemini-2.5-flash-image">
                            Nano Banana (Gemini 2.5 Flash Image)
                          </SelectItem>
                          <SelectItem value="gemini-3-pro-image-preview">
                            Nano Banana Pro (Gemini 3 Pro Image Preview)
                          </SelectItem>
                          <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="complexity-select" className="text-xs">
                        Complexity
                      </Label>
                      <Select
                        value={logoComplexity}
                        onValueChange={setLogoComplexity}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="complex">Complex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="style-select" className="text-xs">
                        Style
                      </Label>
                      <Select value={logoStyle} onValueChange={setLogoStyle}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="geometric">Geometric</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="elegant">Elegant</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mood-select" className="text-xs">
                        Mood
                      </Label>
                      <Select value={logoMood} onValueChange={setLogoMood}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="sophisticated">
                            Sophisticated
                          </SelectItem>
                          <SelectItem value="innovative">Innovative</SelectItem>
                          <SelectItem value="trustworthy">
                            Trustworthy
                          </SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {brandColors.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium mb-2">Brand Colors:</p>
                      <div className="flex gap-1 flex-wrap">
                        {brandColors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4 border border-border rounded-lg bg-muted/20">
                  <Label className="text-sm font-semibold">
                    New logo prompt
                  </Label>
                  <Textarea
                    placeholder="Describe the logo you want..."
                    value={logoPrompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setLogoPrompt(e.target.value)
                    }
                    onKeyDown={handlePromptKeyDown}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSuggestPrompt}
                      disabled={isSuggestingPrompt}
                      className="flex-1"
                    >
                      {isSuggestingPrompt ? 'Suggesting...' : 'Suggest'}
                    </Button>
                    <Button
                      onClick={handleGenerateLogo}
                      disabled={isGenerating || !logoPrompt.trim()}
                      className="flex-1"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </>
            )}

            {!isCreatingNewLogo && (
              <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                      <Sparkles className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground mb-2">
                        Start a conversation about your logo design
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Chat with AI to create and refine logos iteratively
                      </p>
                      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                        <button
                          onClick={() =>
                            setChatInput(
                              'Create a modern, minimal logo for this project',
                            )
                          }
                          className="text-xs px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors text-left"
                        >
                          💡 "Create a modern, minimal logo for this project"
                        </button>
                        <button
                          onClick={() =>
                            setChatInput(
                              'Design an abstract tech symbol using the brand colors',
                            )
                          }
                          className="text-xs px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors text-left"
                        >
                          🎨 "Design an abstract tech symbol using the brand
                          colors"
                        </button>
                        <button
                          onClick={() =>
                            setChatInput(
                              'Generate a geometric icon with clean lines',
                            )
                          }
                          className="text-xs px-3 py-2 rounded-md bg-muted hover:bg-accent transition-colors text-left"
                        >
                          📐 "Generate a geometric icon with clean lines"
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background border border-border'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content.replace(
                                /<svg[\s\S]*?<\/svg>/gi,
                                '[SVG Code Generated]',
                              )}
                            </p>
                            {msg.svg && (
                              <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs text-muted-foreground">
                                    Generated Logo:
                                  </p>
                                  {msg.svg !== generatedLogo && (
                                    <button
                                      onClick={() => {
                                        setGeneratedLogo(msg.svg!);
                                        toast.success('Logo set as current');
                                      }}
                                      className="text-xs text-primary hover:underline"
                                    >
                                      Use This
                                    </button>
                                  )}
                                </div>
                                <div
                                  className="w-24 h-24 flex items-center justify-center bg-checkered rounded cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                  dangerouslySetInnerHTML={{ __html: msg.svg }}
                                  onClick={() => {
                                    if (msg.svg !== generatedLogo) {
                                      setGeneratedLogo(msg.svg!);
                                      toast.success('Logo set as current');
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-border p-4 bg-background">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask to create or modify the logo..."
                      value={chatInput}
                      onChange={e => {
                        setChatInput(e.target.value);
                        if (chatInputHistoryIndex !== -1) {
                          setChatInputHistoryIndex(-1);
                          setChatInputDraft('');
                        }
                      }}
                      onKeyDown={handleChatInputKeyDown}
                      disabled={isChatting}
                    />
                    <Button
                      onClick={handleSendChat}
                      disabled={isChatting || !chatInput.trim()}
                    >
                      {isChatting ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Examples: "Create a modern logo", "Make it more colorful",
                    "Add rounded corners"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              <div className="flex gap-1 border border-border rounded-md p-1">
                <button
                  onClick={() => setPreviewBg('transparent')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    previewBg === 'transparent'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  title="Transparent background"
                >
                  Transparent
                </button>
                <button
                  onClick={() => setPreviewBg('light')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    previewBg === 'light'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  title="Light background"
                >
                  Light
                </button>
                <button
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    previewBg === 'dark'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  title="Dark background"
                >
                  Dark
                </button>
              </div>
            </div>
            <div className="relative">
              {/* Square Preview Container */}
              <div
                className={`aspect-square border border-border rounded-lg flex items-center justify-center relative overflow-hidden ${
                  previewBg === 'transparent'
                    ? 'bg-checkered'
                    : previewBg === 'light'
                      ? 'bg-white'
                      : 'bg-zinc-950'
                }`}
              >
                {generatedLogo ? (
                  <div
                    className="w-3/4 h-3/4 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: generatedLogo }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Sparkles
                      className={`w-12 h-12 mb-3 ${previewBg === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'}`}
                    />
                    <p
                      className={`text-sm ${previewBg === 'dark' ? 'text-zinc-400' : 'text-muted-foreground'}`}
                    >
                      Your generated logo will appear here
                    </p>
                  </div>
                )}

                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                      <p className="text-sm font-medium text-foreground">
                        Generating logo...
                      </p>
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {generatedLogo && !isGenerating && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleCopyLogo}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy SVG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadLogo}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
