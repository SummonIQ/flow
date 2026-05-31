'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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

const roles = [
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'FRONTEND_ENGINEER', label: 'Frontend Engineer' },
  { value: 'BACKEND_ENGINEER', label: 'Backend Engineer' },
  { value: 'FULLSTACK_ENGINEER', label: 'Fullstack Engineer' },
  { value: 'QA_ENGINEER', label: 'QA Engineer' },
  { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
  { value: 'PRODUCT_OWNER', label: 'Product Owner' },
  { value: 'SCRUM_MASTER', label: 'Scrum Master' },
  { value: 'TECH_LEAD', label: 'Tech Lead' },
  { value: 'CUSTOM', label: 'Custom' },
];

const specializations = [
  { value: 'GENERALIST', label: 'Generalist' },
  { value: 'REACT', label: 'React' },
  { value: 'VUE', label: 'Vue' },
  { value: 'ANGULAR', label: 'Angular' },
  { value: 'NODEJS', label: 'Node.js' },
  { value: 'PYTHON', label: 'Python' },
  { value: 'GOLANG', label: 'Go' },
  { value: 'RUST', label: 'Rust' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'CLOUD_AWS', label: 'AWS' },
  { value: 'CLOUD_GCP', label: 'GCP' },
  { value: 'CLOUD_AZURE', label: 'Azure' },
  { value: 'KUBERNETES', label: 'Kubernetes' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'UI_UX', label: 'UI/UX' },
  { value: 'ACCESSIBILITY', label: 'Accessibility' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'CUSTOM', label: 'Custom' },
];

type Agent = {
  id: string;
  name: string;
  role: string;
  specialization: string;
  description: string | null;
  systemPrompt: string;
  maxConcurrentTasks: number;
  modelProvider: string;
  modelName: string;
  temperature: number;
  isDefault: boolean;
};

interface EditAgentModalProps {
  agent: Agent;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditAgentModal({ agent, onClose, onSuccess }: EditAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: agent.name,
    role: agent.role,
    specialization: agent.specialization,
    description: agent.description || '',
    systemPrompt: agent.systemPrompt,
    maxConcurrentTasks: agent.maxConcurrentTasks,
    modelProvider: agent.modelProvider,
    modelName: agent.modelName,
    temperature: agent.temperature,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Agent updated successfully!');
        onSuccess();
      } else {
        toast.error('Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
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
          <div>
            <h2 className="text-xl font-semibold">Edit Agent</h2>
            {agent.isDefault && (
              <p className="text-xs text-muted-foreground mt-1">
                Note: This is a default agent. Changes will only affect your instance.
              </p>
            )}
          </div>
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
              disabled={agent.isDefault}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={agent.isDefault}
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
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => setFormData({ ...formData, specialization: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
