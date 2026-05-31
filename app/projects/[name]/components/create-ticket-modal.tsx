'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

type Agent = {
  id: string;
  name: string;
  role: string;
};

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const STATUSES = [
  { value: 'BACKLOG', label: 'Backlog', color: 'bg-gray-500' },
  { value: 'DESIGN', label: 'Design', color: 'bg-purple-500' },
  { value: 'UNREFINED', label: 'Unrefined', color: 'bg-orange-500' },
  { value: 'TODO', label: 'To Do', color: 'bg-slate-500' },
  { value: 'READY', label: 'Ready', color: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'QA', label: 'QA', color: 'bg-indigo-500' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-pink-500' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-500' },
  { value: 'DONE', label: 'Done', color: 'bg-green-500' },
];

interface CreateTicketModalProps {
  projectId: string;
  initialStatus?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTicketModal({
  projectId,
  initialStatus = 'BACKLOG',
  onClose,
  onSuccess,
}: CreateTicketModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'MEDIUM',
    assignedToId: '',
    labels: '',
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const labels = formData.labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          status: formData.status,
          priority: formData.priority,
          assignedToId: formData.assignedToId || null,
          labels,
        }),
      });

      if (response.ok) {
        const newTicket = await response.json();
        toast.success('Ticket created successfully!');
        // Pusher will handle real-time update, no refresh needed
        onSuccess();
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
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
          <h2 className="text-xl font-semibold">Create Ticket</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Implement user authentication"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status">
                    {formData.status && (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STATUSES.find(s => s.value === formData.status)?.color}`} />
                        <span>{STATUSES.find(s => s.value === formData.status)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assign to Agent</Label>
            <Select
              value={formData.assignedToId || 'unassigned'}
              onValueChange={(value) => setFormData({ ...formData, assignedToId: value === 'unassigned' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="labels">Labels</Label>
            <Input
              id="labels"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="e.g., frontend, urgent, bug (comma-separated)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple labels with commas
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
