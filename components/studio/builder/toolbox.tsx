'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useBuilderStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';
import { ComponentType } from '@/types/studio/builder';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlignLeft,
  Box,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  CreditCard,
  Database,
  FormInputIcon,
  GripVertical,
  Heading1,
  ImageIcon,
  Info,
  Layers,
  LayoutGrid,
  Link2,
  ListIcon,
  Loader2,
  Medal,
  Menu as MenuIcon,
  MessageSquare,
  Minus,
  MousePointerClick,
  Navigation,
  PanelTop,
  RectangleHorizontal,
  Rows3,
  Sparkles,
  SquareSplitVertical,
  TableIcon,
  Tag,
  TextCursorInput,
  ToggleLeft,
  Type,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ComponentTree } from './component-tree';
import { LogicPanel } from './logic-panel';

interface ToolboxItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ToolboxCategory {
  name: string;
  icon: React.ReactNode;
  items: ToolboxItem[];
}

const toolboxCategories: ToolboxCategory[] = [
  {
    name: 'Layout',
    icon: <Layers size={14} />,
    items: [
      {
        type: 'Container',
        label: 'Container',
        icon: <Box size={18} />,
        description: 'Basic container',
      },
      {
        type: 'Flex',
        label: 'Flex',
        icon: <Rows3 size={18} />,
        description: 'Flexbox layout',
      },
      {
        type: 'Grid',
        label: 'Grid',
        icon: <LayoutGrid size={18} />,
        description: 'Grid layout',
      },
      {
        type: 'Card',
        label: 'Card',
        icon: <CreditCard size={18} />,
        description: 'Card container',
      },
      {
        type: 'Stack',
        label: 'Stack',
        icon: <SquareSplitVertical size={18} />,
        description: 'Vertical stack',
      },
      {
        type: 'Divider',
        label: 'Divider',
        icon: <Minus size={18} />,
        description: 'Horizontal divider',
      },
    ],
  },
  {
    name: 'Form',
    icon: <FormInputIcon size={14} />,
    items: [
      {
        type: 'Button',
        label: 'Button',
        icon: <MousePointerClick size={18} />,
        description: 'Button element',
      },
      {
        type: 'Input',
        label: 'Input',
        icon: <FormInputIcon size={18} />,
        description: 'Text input',
      },
      {
        type: 'Textarea',
        label: 'Textarea',
        icon: <TextCursorInput size={18} />,
        description: 'Multi-line text',
      },
      {
        type: 'Select',
        label: 'Select',
        icon: <ChevronDown size={18} />,
        description: 'Dropdown select',
      },
      {
        type: 'Checkbox',
        label: 'Checkbox',
        icon: <CheckSquare size={18} />,
        description: 'Checkbox input',
      },
      {
        type: 'Radio',
        label: 'Radio',
        icon: <Circle size={18} />,
        description: 'Radio button',
      },
      {
        type: 'Switch',
        label: 'Switch',
        icon: <ToggleLeft size={18} />,
        description: 'Toggle switch',
      },
      {
        type: 'Label',
        label: 'Label',
        icon: <Tag size={18} />,
        description: 'Form label',
      },
      {
        type: 'Form',
        label: 'Form',
        icon: <PanelTop size={18} />,
        description: 'Form container',
      },
    ],
  },
  {
    name: 'Display',
    icon: <Type size={14} />,
    items: [
      {
        type: 'Text',
        label: 'Text',
        icon: <AlignLeft size={18} />,
        description: 'Text content',
      },
      {
        type: 'Heading',
        label: 'Heading',
        icon: <Heading1 size={18} />,
        description: 'Heading text',
      },
      {
        type: 'Image',
        label: 'Image',
        icon: <ImageIcon size={18} />,
        description: 'Image element',
      },
      {
        type: 'Badge',
        label: 'Badge',
        icon: <Medal size={18} />,
        description: 'Badge component',
      },
      {
        type: 'Avatar',
        label: 'Avatar',
        icon: <User size={18} />,
        description: 'Avatar image',
      },
      {
        type: 'Icon',
        label: 'Icon',
        icon: <Sparkles size={18} />,
        description: 'Icon element',
      },
    ],
  },
  {
    name: 'Feedback',
    icon: <AlertCircle size={14} />,
    items: [
      {
        type: 'Alert',
        label: 'Alert',
        icon: <AlertCircle size={18} />,
        description: 'Alert message',
      },
      {
        type: 'Dialog',
        label: 'Dialog',
        icon: <MessageSquare size={18} />,
        description: 'Modal dialog',
      },
      {
        type: 'Toast',
        label: 'Toast',
        icon: <Info size={18} />,
        description: 'Toast notification',
      },
      {
        type: 'Progress',
        label: 'Progress',
        icon: <Activity size={18} />,
        description: 'Progress bar',
      },
      {
        type: 'Spinner',
        label: 'Spinner',
        icon: <Loader2 size={18} />,
        description: 'Loading spinner',
      },
      {
        type: 'Skeleton',
        label: 'Skeleton',
        icon: <RectangleHorizontal size={18} />,
        description: 'Loading skeleton',
      },
    ],
  },
  {
    name: 'Navigation',
    icon: <Navigation size={14} />,
    items: [
      {
        type: 'Tabs',
        label: 'Tabs',
        icon: <Rows3 size={18} />,
        description: 'Tab navigation',
      },
      {
        type: 'Breadcrumb',
        label: 'Breadcrumb',
        icon: <Link2 size={18} />,
        description: 'Breadcrumb nav',
      },
      {
        type: 'Pagination',
        label: 'Pagination',
        icon: <ChevronRight size={18} />,
        description: 'Page navigation',
      },
      {
        type: 'Menu',
        label: 'Menu',
        icon: <MenuIcon size={18} />,
        description: 'Menu component',
      },
    ],
  },
  {
    name: 'Data',
    icon: <Database size={14} />,
    items: [
      {
        type: 'Table',
        label: 'Table',
        icon: <TableIcon size={18} />,
        description: 'Data table',
      },
      {
        type: 'List',
        label: 'List',
        icon: <ListIcon size={18} />,
        description: 'List component',
      },
      {
        type: 'DataGrid',
        label: 'DataGrid',
        icon: <LayoutGrid size={18} />,
        description: 'Advanced grid',
      },
    ],
  },
];

interface ToolboxContentProps {
  onDragEnter?: () => void;
}

// Content-only component for use in dockable panels
export function ToolboxContent({ onDragEnter }: ToolboxContentProps) {
  const {
    addComponent,
    getRootId,
    aiComponents,
    removeAiComponent,
    insertComponentWithData,
    setIsDragging,
    setDraggedComponentType,
  } = useBuilderStore();
  const rootId = getRootId();
  const [activeTab, setActiveTab] = useState<'toolbox' | 'tree'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toolbox-activeTab');
      return (saved as 'toolbox' | 'tree') || 'toolbox';
    }
    return 'toolbox';
  });
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('toolbox-openCategories');
      return saved ? JSON.parse(saved) : ['AI Components', 'Layout', 'Form'];
    }
    return ['AI Components', 'Layout', 'Form'];
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('toolbox-activeTab', activeTab);
    }
  }, [activeTab]);

  // Persist openCategories to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'toolbox-openCategories',
        JSON.stringify(openCategories),
      );
    }
  }, [openCategories]);

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.setData('text/plain', type); // Fallback for compatibility
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
    setDraggedComponentType(type);
  };

  const handleAiDragStart = (e: React.DragEvent, component: any) => {
    e.stopPropagation();
    e.dataTransfer.setData('componentType', component.type);
    e.dataTransfer.setData('aiComponentData', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    // mouseup handler in canvas.tsx handles cleanup and adding component
    // No need to do anything here
  };

  const handleClick = (type: ComponentType) => {
    addComponent(type, rootId);
  };

  const handleAiClick = (component: any) => {
    if (rootId) {
      // Insert as child of root
      insertComponentWithData(component, rootId, 'inside');
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category],
    );
  };

  const handleDragEnter = (e: React.DragEvent) => {
    // Check if dragging a component (not the panel itself)
    if (e.dataTransfer.types.includes('componenttype') && onDragEnter) {
      onDragEnter();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex justify-center border-b border-border bg-background/50 shrink-0 select-none">
        <button
          onClick={() => setActiveTab('toolbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'toolbox'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={14} />
          Components
        </button>
        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'tree'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Rows3 size={14} />
          Tree
        </button>
      </div>

      {/* Resizable Content + Variables */}
      <ResizablePanelGroup
        direction="vertical"
        className="flex-1 min-h-0"
        autoSaveId="toolbox-panels"
      >
        <ResizablePanel defaultSize={75} minSize={30}>
          {/* Content */}
          <div className="h-full overflow-y-auto">
            {activeTab === 'toolbox' ? (
              <div className="p-1 bg-background">
                <div className="border rounded-md border-border">
                  {/* AI Components Section */}
                  {aiComponents.length > 0 && (
                    <div className="border-b bg-muted/25 border-b-border shadow-sm overflow-hidden select-none">
                      <button
                        onClick={() => toggleCategory('AI Components')}
                        className="flex items-center gap-2 w-full py-2 px-3 pl-2 hover:bg-muted/50 transition-colors text-xs font-semibold"
                      >
                        <motion.div
                          animate={{
                            rotate: openCategories.includes('AI Components')
                              ? 90
                              : 0,
                          }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                          <ChevronRight
                            className={cn(
                              'text-muted-foreground/50',
                              openCategories.includes('AI Components')
                                ? 'text-foreground'
                                : '',
                            )}
                            size={12}
                          />
                        </motion.div>
                        <Sparkles size={14} className="text-primary" />
                        <span>AI Components</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {aiComponents.length}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {openCategories.includes('AI Components') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1.5 p-2 bg-muted/10">
                              {aiComponents.map(item => (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={e => handleAiDragStart(e, item)}
                                  onDragEnd={handleDragEnd}
                                  onClick={() => handleAiClick(item)}
                                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-accent hover:border-t-foreground/20 hover:border-b-foreground/40 hover:border-x-foreground/30 cursor-grab active:cursor-grabbing transition-all group"
                                  title={item.name || item.type}
                                >
                                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                    <GripVertical size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">
                                      {item.name || item.type}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate">
                                      {item.children.length} children
                                    </div>
                                  </div>
                                  {/* Delete button */}
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      removeAiComponent(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                                    title="Remove"
                                  >
                                    <Minus size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {toolboxCategories.map(category => {
                    const isOpen = openCategories.includes(category.name);

                    return (
                      <div
                        key={category.name}
                        className="shadow-sm border-b border-b-border last:border-b-none overflow-hidden select-none"
                      >
                        <button
                          onClick={() => toggleCategory(category.name)}
                          className="flex items-center gap-2 w-full py-2 px-3 pl-2 bg-muted/25 hover:bg-muted/50 transition-colors text-xs font-semibold"
                        >
                          <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                          >
                            <ChevronRight
                              className={cn(
                                'text-muted-foreground/50',
                                isOpen ? 'text-foreground' : '',
                              )}
                              size={12}
                            />
                          </motion.div>
                          {category.icon}
                          <span>{category.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {category.items.length}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.3,
                                ease: [0.04, 0.62, 0.23, 0.98],
                              }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-1.5 p-2 bg-muted/10">
                                {category.items.map(item => (
                                  <div
                                    key={item.type}
                                    draggable
                                    onDragStart={e =>
                                      handleDragStart(e, item.type)
                                    }
                                    onDragEnd={handleDragEnd}
                                    onClick={() => handleClick(item.type)}
                                    className="p-2.5 rounded-lg border border-border bg-background hover:bg-accent hover:border-t-foreground/20 hover:border-b-foreground/40 hover:border-x-foreground/30 cursor-grab active:cursor-grabbing transition-all group"
                                    title={item.description}
                                  >
                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                      <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                        {item.icon}
                                      </div>
                                      <div className="text-xs font-medium truncate w-full">
                                        {item.label}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ComponentTree />
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="h-2 cursor-row-resize" />

        <ResizablePanel defaultSize={25} minSize={10}>
          {/* Logic Panel */}
          <LogicPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Floating panel wrapper for ToolboxContent
interface ToolboxProps {
  onDragEnter?: () => void;
}

export function Toolbox({ onDragEnter }: ToolboxProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragControls = useDragControls();
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 80 });

  // Handle window resize to keep panel within bounds
  useEffect(() => {
    const handleResize = () => {
      setPanelPosition(prev => {
        const panelWidth = 230;
        const minMargin = 20;
        const maxX = window.innerWidth - panelWidth - minMargin;
        const maxY = window.innerHeight - 100;

        return {
          x: Math.min(Math.max(prev.x, minMargin), maxX),
          y: Math.min(Math.max(prev.y, 0), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragListener={false}
      dragConstraints={{
        left: 0,
        right: typeof window !== 'undefined' ? window.innerWidth - 230 : 1000,
        top: 0,
        bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 800,
      }}
      style={{
        x: panelPosition.x,
        y: panelPosition.y,
        touchAction: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
      onDragStart={() => setIsDraggingPanel(true)}
      onDragEnd={(e, info) => {
        setIsDraggingPanel(false);
        setPanelPosition({ x: info.point.x, y: info.point.y });
      }}
      className="fixed z-50 w-[230px] bg-card border border-border rounded-lg overflow-hidden flex flex-col max-h-[calc(100vh-100px)]"
    >
      {/* Drag Handle */}
      <div
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        className={`border-b border-border shrink-0 ${
          isDraggingPanel ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="bg-linear-to-r from-primary/10 to-primary/5 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GripVertical size={14} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-foreground">Toolbox</h2>
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-accent"
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ToolboxContent onDragEnter={onDragEnter} />
        </div>
      )}
    </motion.div>
  );
}
