'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@summoniq/applab-ui';
import { focusAreas, roles, expertise } from './agent-constants';

interface CreateAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAgentModal({ onClose, onSuccess }: CreateAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    focusArea: 'PRODUCT_DEVELOPMENT',
    role: 'SOFTWARE_ENGINEER',
    expertise: 'GENERALIST',
    description: '',
    systemPrompt: '',
    maxConcurrentTasks: 3,
    modelProvider: 'openai',
    modelName: 'gpt-4',
    temperature: 0.7,
  });

  const selectedRole = roles.find(r => r.value === formData.role);
  const selectedFocus = focusAreas.find(f => f.value === formData.focusArea);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Agent created successfully!');
        onSuccess();
      } else {
        toast.error('Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Create Custom Agent</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sarah - API Specialist"
              required
            />
          </div>

          <div>
            <Label htmlFor="focusArea">Focus Area</Label>
            <Select
              value={formData.focusArea}
              onValueChange={(value) => setFormData({ ...formData, focusArea: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                {focusAreas.map((focus) => (
                  <SelectItem key={focus.value} value={focus.value}>
                    {focus.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFocus && (
              <p className="text-xs text-muted-foreground mt-1">{selectedFocus.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Specific Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRole && (
              <p className="text-xs text-muted-foreground mt-1">{selectedRole.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="expertise">Expertise / Technology</Label>
            <Select
              value={formData.expertise}
              onValueChange={(value) => setFormData({ ...formData, expertise: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertise.map((exp) => (
                  <SelectItem key={exp.value} value={exp.value}>
                    {exp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Primary technology or domain expertise
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the agent's expertise"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="Define the agent's behavior, expertise, and responsibilities..."
              rows={8}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelProvider">Model Provider</Label>
              <Input
                id="modelProvider"
                value={formData.modelProvider}
                onChange={(e) => setFormData({ ...formData, modelProvider: e.target.value })}
                placeholder="openai"
              />
            </div>

            <div>
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                placeholder="gpt-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxTasks">Max Concurrent Tasks</Label>
              <Input
                id="maxTasks"
                type="number"
                min="1"
                max="10"
                value={formData.maxConcurrentTasks}
                onChange={(e) =>
                  setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
