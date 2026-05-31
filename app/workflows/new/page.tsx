'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
} from '@summoniq/applab-ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          stages: [
            {
              id: 'backlog',
              name: 'Backlog',
              description: 'New items',
              agentRole: null,
            },
            {
              id: 'in_progress',
              name: 'In Progress',
              description: 'Being worked on',
              agentRole: null,
            },
            {
              id: 'done',
              name: 'Done',
              description: 'Completed',
              agentRole: null,
            },
          ],
          transitions: [
            { from: 'backlog', to: 'in_progress', condition: 'always' },
            { from: 'in_progress', to: 'done', condition: 'always' },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workflow');
      }

      const workflow = await response.json();
      toast.success('Workflow created successfully');
      router.push(`/workflows/${workflow.id}`);
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create workflow',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Create Workflow"
        description="Create a new workflow template for your team"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleCreate} disabled={saving || !name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-2xl">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                placeholder="e.g., Standard Development Workflow"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this workflow..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                A basic workflow with Backlog → In Progress → Done stages will
                be created. You can customize stages and transitions after
                creation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
