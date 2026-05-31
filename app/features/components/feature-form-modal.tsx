'use client';

import { Modal, ModalContent, ModalHeader, ModalTitle } from '@summoniq/applab-ui';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface FeatureFormData {
  id?: string;
  feature: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  tags: string[];
  docsUrl?: string | null;
}

interface FeatureFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: FeatureFormData | null;
  onSave: (feature: FeatureFormData) => Promise<void>;
}

const ICON_OPTIONS = [
  'lock',
  'database',
  'credit-card',
  'mail',
  'bar-chart',
  'cloud-upload',
  'sparkles',
  'zap',
  'alert-triangle',
  'hard-drive',
  'clock',
  'flag',
  'file-text',
  'shield',
  'test-tube',
  'book-open',
  'search',
  'bell',
  'languages',
  'globe',
  'code-2',
];

const COLOR_OPTIONS = [
  'indigo',
  'blue',
  'green',
  'purple',
  'pink',
  'yellow',
  'cyan',
  'orange',
  'red',
];

export function FeatureFormModal({
  open,
  onOpenChange,
  feature,
  onSave,
}: FeatureFormModalProps) {
  const isEditing = !!feature?.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<FeatureFormData>(() => ({
    feature: feature?.feature || '',
    name: feature?.name || '',
    description: feature?.description || '',
    icon: feature?.icon || 'sparkles',
    color: feature?.color || 'indigo',
    tags: feature?.tags || [],
    docsUrl: feature?.docsUrl || '',
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        id: feature?.id,
        feature: formData.feature.toUpperCase().replace(/\s+/g, '_'),
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save feature:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Feature' : 'Add Feature'}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Feature Key
              </label>
              <input
                type="text"
                value={formData.feature}
                onChange={e =>
                  setFormData(prev => ({ ...prev, feature: e.target.value }))
                }
                placeholder="FEATURE_KEY"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Feature Name"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description of the feature"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <select
                value={formData.icon || 'sparkles'}
                onChange={e =>
                  setFormData(prev => ({ ...prev, icon: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <select
                value={formData.color || 'indigo'}
                onChange={e =>
                  setFormData(prev => ({ ...prev, color: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {COLOR_OPTIONS.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-md border border-input bg-muted hover:bg-muted/80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Documentation URL
            </label>
            <input
              type="url"
              value={formData.docsUrl || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, docsUrl: e.target.value }))
              }
              placeholder="https://docs.example.com"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-input bg-background hover:bg-muted text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                'Update'
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
