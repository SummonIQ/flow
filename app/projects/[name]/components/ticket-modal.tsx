'use client';

import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@summoniq/applab-ui';
import { ArrowRight, Loader2, Plus, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  ticket?: {
    id?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedToId?: string;
    teamId?: string;
    labels?: string[];
    acceptanceCriteria?: any;
    businessRequirements?: string;
    estimatedValue?: string;
    isFrontend?: boolean;
  };
  agents?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  teams?: Array<{
    id: string;
    name: string;
  }>;
  onSave?: (ticket: any) => void | Promise<void>;
}

const statuses = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'QA', label: 'QA' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DONE', label: 'Done' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'UNREFINED', label: 'Unrefined' },
  { value: 'READY', label: 'Ready' },
];

const priorities = [
  { value: 'LOW', label: 'Low', color: 'text-gray-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-600' },
];

const UNASSIGNED_AGENT_VALUE = 'UNASSIGNED_AGENT';
const NO_TEAM_VALUE = 'NO_TEAM_SELECTED';

export function TicketModal({
  open,
  onOpenChange,
  projectName,
  ticket,
  agents = [],
  teams = [],
  onSave,
}: TicketModalProps) {
  const isEdit = !!ticket?.id;
  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    status: ticket?.status || 'BACKLOG',
    priority: ticket?.priority || 'MEDIUM',
    assignedToId: ticket?.assignedToId || '',
    teamId: ticket?.teamId || '',
    labels: ticket?.labels || [],
    businessRequirements: ticket?.businessRequirements || '',
    estimatedValue: ticket?.estimatedValue || '',
    isFrontend: ticket?.isFrontend || false,
  });

  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when ticket prop changes
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'BACKLOG',
        priority: ticket.priority || 'MEDIUM',
        assignedToId: ticket.assignedToId || '',
        teamId: ticket.teamId || '',
        labels: ticket.labels || [],
        businessRequirements: ticket.businessRequirements || '',
        estimatedValue: ticket.estimatedValue || '',
        isFrontend: ticket.isFrontend || false,
      });
    } else {
      // Reset form for new ticket
      setFormData({
        title: '',
        description: '',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        assignedToId: '',
        teamId: '',
        labels: [],
        businessRequirements: '',
        estimatedValue: '',
        isFrontend: false,
      });
    }
  }, [ticket, open]);

  const handleSave = async () => {
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Ticket title is required');
      return;
    }

    setSaving(true);
    try {
      const ticketData: any = {
        ...formData,
        projectName,
      };

      if (onSave) {
        await onSave(ticketData);
      }

      onOpenChange(false);
      toast.success(
        isEdit ? 'Ticket updated successfully' : 'Ticket created successfully',
      );

      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'BACKLOG',
        priority: 'MEDIUM',
        assignedToId: '',
        teamId: '',
        labels: [],
        businessRequirements: '',
        estimatedValue: '',
        isFrontend: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save ticket');
      toast.error('Failed to save ticket');
    } finally {
      setSaving(false);
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()],
      });
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter(l => l !== label),
    });
  };

  // Routing suggestion logic
  const getRoutingSuggestion = () => {
    const status = formData.status;
    const roleMap: Record<string, { role: string; reason: string }> = {
      BACKLOG: {
        role: 'PRODUCT_OWNER',
        reason: 'Product Owner handles backlog refinement',
      },
      UNREFINED: {
        role: 'PRODUCT_OWNER',
        reason: 'Product Owner refines ticket requirements',
      },
      TODO: {
        role: 'FRONTEND_ENGINEER',
        reason: 'Developer handles implementation tasks',
      },
      IN_PROGRESS: {
        role: 'FRONTEND_ENGINEER',
        reason: 'Developer continues implementation',
      },
      DESIGN: { role: 'DESIGNER', reason: 'Designer creates UI/UX designs' },
      IN_REVIEW: {
        role: 'TECH_LEAD',
        reason: 'Tech Lead reviews code changes',
      },
      QA: { role: 'QA_ENGINEER', reason: 'QA Engineer tests functionality' },
      BLOCKED: { role: 'TECH_LEAD', reason: 'Tech Lead resolves blockers' },
      DONE: {
        role: 'PRODUCT_OWNER',
        reason: 'Product Owner verifies completion',
      },
    };

    const suggestion = roleMap[status];
    if (!suggestion) return null;

    const suggestedAgent = agents.find(a => a.role === suggestion.role);
    if (!suggestedAgent) return null;

    return {
      agent: suggestedAgent,
      reason: suggestion.reason,
    };
  };

  const applyRoutingSuggestion = () => {
    const suggestion = getRoutingSuggestion();
    if (suggestion) {
      setFormData({ ...formData, assignedToId: suggestion.agent.id });
      toast.success(`Routed to ${suggestion.agent.name}`);
    }
  };

  const routingSuggestion = getRoutingSuggestion();

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader>
          <ModalTitle>
            {isEdit ? 'Edit Ticket' : 'Create New Ticket'}
          </ModalTitle>
          <ModalDescription>
            {isEdit
              ? `Update ticket details in ${projectName}`
              : `Create a new ticket in ${projectName}`}
          </ModalDescription>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ticket-title">Title *</Label>
              <Input
                id="ticket-title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Brief description of the task"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the task..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="ticket-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="ticket-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-assignee">Assignee</Label>
                <Select
                  value={formData.assignedToId || UNASSIGNED_AGENT_VALUE}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      assignedToId:
                        value === UNASSIGNED_AGENT_VALUE ? '' : value,
                    })
                  }
                >
                  <SelectTrigger id="ticket-assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_AGENT_VALUE}>
                      Unassigned
                    </SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {routingSuggestion && !formData.assignedToId && (
                  <button
                    type="button"
                    onClick={applyRoutingSuggestion}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground p-2 rounded-md bg-muted/50 hover:bg-muted w-full"
                  >
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>
                      Suggest: <strong>{routingSuggestion.agent.name}</strong>
                    </span>
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket-team">Team</Label>
                <Select
                  value={formData.teamId || NO_TEAM_VALUE}
                  onValueChange={(value: string) =>
                    setFormData({
                      ...formData,
                      teamId: value === NO_TEAM_VALUE ? '' : value,
                    })
                  }
                >
                  <SelectTrigger id="ticket-team">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEAM_VALUE}>No team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-labels">Labels</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.labels.map(label => (
                  <Badge key={label} variant="secondary" className="gap-1">
                    {label}
                    <button
                      onClick={() => removeLabel(label)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="ticket-labels"
                  value={newLabel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewLabel(e.target.value)
                  }
                  onKeyPress={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLabel();
                    }
                  }}
                  placeholder="Add a label..."
                  className="flex-1"
                />
                <Button onClick={addLabel} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-requirements">Business Requirements</Label>
              <Textarea
                id="ticket-requirements"
                value={formData.businessRequirements}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({
                    ...formData,
                    businessRequirements: e.target.value,
                  })
                }
                placeholder="Business requirements and context..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-value">Estimated Value</Label>
                <Input
                  id="ticket-value"
                  value={formData.estimatedValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, estimatedValue: e.target.value })
                  }
                  placeholder="e.g., 5 story points"
                />
              </div>

              <div className="flex items-center space-x-2 pt-7">
                <Switch
                  id="ticket-frontend"
                  checked={formData.isFrontend}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isFrontend: checked })
                  }
                />
                <Label htmlFor="ticket-frontend">Frontend Task</Label>
              </div>
            </div>
          </div>
        </div>

        <ModalFooter className="px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEdit ? 'Update Ticket' : 'Create Ticket'}</>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
