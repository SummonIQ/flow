'use client';

import { useBuilderStore } from '@/lib/studio/store';
import { motion } from 'framer-motion';

export function PropertiesPanel() {
  const { getComponents, selectedId, updateComponent } = useBuilderStore();
  const components = getComponents();
  const selectedComponent = selectedId ? components[selectedId] : null;

  if (!selectedComponent) {
    return (
      <div className="h-full bg-card border-l border-border overflow-y-auto p-4">
        <div className="text-center text-muted-foreground mt-20">
          <div className="text-4xl mb-3">⚙️</div>
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (key: string, value: string) => {
    updateComponent(selectedComponent.id, {
      styles: { ...selectedComponent.styles, [key]: value },
    });
  };

  const handlePropChange = (key: string, value: string) => {
    updateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, [key]: value },
    });
  };

  const handleNameChange = (value: string) => {
    updateComponent(selectedComponent.id, { name: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full bg-card border-l border-border overflow-y-auto"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Properties
        </h2>
        <div className="mt-2 text-lg font-medium">{selectedComponent.type}</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Component Name */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Component Name
          </label>
          <input
            type="text"
            value={selectedComponent.name}
            onChange={e => handleNameChange(e.target.value)}
            className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Component Props */}
        {(selectedComponent.type === 'Button' ||
          selectedComponent.type === 'Text') && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Text
            </label>
            <input
              type="text"
              value={selectedComponent.props.text || ''}
              onChange={e => handlePropChange('text', e.target.value)}
              className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {selectedComponent.type === 'Input' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Placeholder
              </label>
              <input
                type="text"
                value={selectedComponent.props.placeholder || ''}
                onChange={e => handlePropChange('placeholder', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Input Type
              </label>
              <select
                value={selectedComponent.props.type || 'text'}
                onChange={e => handlePropChange('type', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
              </select>
            </div>
          </>
        )}

        {selectedComponent.type === 'Image' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Image URL
              </label>
              <input
                type="text"
                value={selectedComponent.props.src || ''}
                onChange={e => handlePropChange('src', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Alt Text
              </label>
              <input
                type="text"
                value={selectedComponent.props.alt || ''}
                onChange={e => handlePropChange('alt', e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}

        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Styles
          </h3>

          {/* Layout Styles */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Width</label>
                <input
                  type="text"
                  value={selectedComponent.styles.width || ''}
                  onChange={e => handleStyleChange('width', e.target.value)}
                  placeholder="auto"
                  className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Height</label>
                <input
                  type="text"
                  value={selectedComponent.styles.height || ''}
                  onChange={e => handleStyleChange('height', e.target.value)}
                  placeholder="auto"
                  className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Padding</label>
                <input
                  type="text"
                  value={selectedComponent.styles.padding || ''}
                  onChange={e => handleStyleChange('padding', e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Margin</label>
                <input
                  type="text"
                  value={selectedComponent.styles.margin || ''}
                  onChange={e => handleStyleChange('margin', e.target.value)}
                  placeholder="0"
                  className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Flex/Grid specific */}
            {(selectedComponent.type === 'Flex' ||
              selectedComponent.type === 'Container') && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Flex Direction
                  </label>
                  <select
                    value={selectedComponent.styles.flexDirection || 'row'}
                    onChange={e =>
                      handleStyleChange('flexDirection', e.target.value)
                    }
                    className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Align Items
                  </label>
                  <select
                    value={selectedComponent.styles.alignItems || 'start'}
                    onChange={e =>
                      handleStyleChange('alignItems', e.target.value)
                    }
                    className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Justify Content
                  </label>
                  <select
                    value={selectedComponent.styles.justifyContent || 'start'}
                    onChange={e =>
                      handleStyleChange('justifyContent', e.target.value)
                    }
                    className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                    <option value="space-evenly">Space Evenly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Gap</label>
                  <input
                    type="text"
                    value={selectedComponent.styles.gap || ''}
                    onChange={e => handleStyleChange('gap', e.target.value)}
                    placeholder="0"
                    className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </>
            )}

            {/* Color Styles */}
            <div>
              <label className="text-xs text-muted-foreground">
                Background
              </label>
              <input
                type="text"
                value={selectedComponent.styles.backgroundColor || ''}
                onChange={e =>
                  handleStyleChange('backgroundColor', e.target.value)
                }
                placeholder="#ffffff"
                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Text Color
              </label>
              <input
                type="text"
                value={selectedComponent.styles.color || ''}
                onChange={e => handleStyleChange('color', e.target.value)}
                placeholder="#000000"
                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Border & Radius */}
            <div>
              <label className="text-xs text-muted-foreground">Border</label>
              <input
                type="text"
                value={selectedComponent.styles.border || ''}
                onChange={e => handleStyleChange('border', e.target.value)}
                placeholder="1px solid #000"
                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Border Radius
              </label>
              <input
                type="text"
                value={selectedComponent.styles.borderRadius || ''}
                onChange={e =>
                  handleStyleChange('borderRadius', e.target.value)
                }
                placeholder="0"
                className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Typography */}
            {(selectedComponent.type === 'Text' ||
              selectedComponent.type === 'Button') && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Font Size
                    </label>
                    <input
                      type="text"
                      value={selectedComponent.styles.fontSize || ''}
                      onChange={e =>
                        handleStyleChange('fontSize', e.target.value)
                      }
                      placeholder="16px"
                      className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Font Weight
                    </label>
                    <select
                      value={selectedComponent.styles.fontWeight || 'normal'}
                      onChange={e =>
                        handleStyleChange('fontWeight', e.target.value)
                      }
                      className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="300">Light</option>
                      <option value="normal">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi Bold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Text Align
                  </label>
                  <select
                    value={selectedComponent.styles.textAlign || 'left'}
                    onChange={e =>
                      handleStyleChange('textAlign', e.target.value)
                    }
                    className="mt-1 w-full px-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
