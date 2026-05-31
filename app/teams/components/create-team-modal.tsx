'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
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

type TeamMemberForm = {
  agentId: string;
  workflowRole: string;
  canAssign: boolean;
  canReview: boolean;
};

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: null as string | null,
  });
  const [members, setMembers] = useState<TeamMemberForm[]>([]);

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

  const addMember = () => {
    setMembers([
      ...members,
      {
        agentId: '',
        workflowRole: '',
        canAssign: false,
        canReview: true,
      },
    ]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, updates: Partial<TeamMemberForm>) => {
    setMembers(
      members.map((member, i) => (i === index ? { ...member, ...updates } : member))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (members.length === 0) {
      toast.error('Please add at least one team member');
      return;
    }

    if (members.some((m) => !m.agentId)) {
      toast.error('Please select an agent for all team members');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          members,
        }),
      });

      if (response.ok) {
        toast.success('Team created successfully!');
        onSuccess();
      } else {
        toast.error('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
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
        className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Create AI Agent Team</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Frontend Development Squad"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the team's purpose"
                rows={2}
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Team Members & Workflow</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMember}
                className="gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Member
              </Button>
            </div>

            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    No team members yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMember}
                    className="gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add First Member
                  </Button>
                </div>
              ) : (
                members.map((member, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2 pt-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Agent</Label>
                          <Select
                            value={member.agentId}
                            onValueChange={(value) =>
                              updateMember(index, { agentId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents
                                .filter(
                                  (agent) =>
                                    !members.some(
                                      (m, i) => i !== index && m.agentId === agent.id
                                    )
                                )
                                .map((agent) => (
                                  <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Workflow Role</Label>
                          <Input
                            value={member.workflowRole}
                            onChange={(e) =>
                              updateMember(index, { workflowRole: e.target.value })
                            }
                            placeholder="e.g., Initial Review"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.canAssign}
                            onChange={(e) =>
                              updateMember(index, { canAssign: e.target.checked })
                            }
                            className="rounded"
                          />
                          Can assign tasks
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.canReview}
                            onChange={(e) =>
                              updateMember(index, { canReview: e.target.checked })
                            }
                            className="rounded"
                          />
                          Can review code
                        </label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(index)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Members are executed in order from top to bottom in the workflow
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
