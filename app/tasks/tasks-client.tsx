'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card,
  CardContent,
  CardHeader,
  CardTitle } from '@/components/ui/card';
import { actionPlanTasks } from '@/lib/data/action-plan-tasks';
import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@summoniq/applab-ui';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type TaskPriority = 'high' | 'medium' | 'low';

type TaskStatusFilter = 'active' | 'completed' | 'all';

export function TasksClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('active');
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());

  const tasks = actionPlanTasks;

  const filteredTasks = useMemo(() => {
    let nextTasks = tasks;

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      nextTasks = nextTasks.filter(task => {
        const deliverablesText = (task.deliverables ?? []).join(' ').toLowerCase();
        const stepsText = (task.steps ?? []).join(' ').toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          deliverablesText.includes(query) ||
          stepsText.includes(query)
        );
      });
    }

    if (priorityFilter !== 'all') {
      nextTasks = nextTasks.filter(task => task.priority === priorityFilter);
    }

    if (statusFilter !== 'all') {
      nextTasks = nextTasks.filter(task => {
        const isCompleted = completedIds.has(task.id);
        return statusFilter === 'completed' ? isCompleted : !isCompleted;
      });
    }

    return nextTasks;
  }, [completedIds, priorityFilter, searchQuery, statusFilter, tasks]);

  function handleToggleCompleted(taskId: number, checked: boolean | 'indeterminate') {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(taskId);
        return next;
      }
      next.delete(taskId);
      return next;
    });
  }

  function getPriorityBadgeVariant(priority: TaskPriority) {
    if (priority === 'high') return 'destructive';
    if (priority === 'medium') return 'default';
    return 'secondary';
  }

  return (
    <Page className="h-full">
      <PageHeader
        title="Tasks"
        description="Mocked task list (ported from agency-base). Source: Action Plan tasks."
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />

                <Select
                  value={priorityFilter}
                  onValueChange={value => setPriorityFilter(value as TaskPriority | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={value => setStatusFilter(value as TaskStatusFilter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/action-plan">View Action Plan</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {filteredTasks.map(task => {
              const isCompleted = completedIds.has(task.id);

              return (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={checked => handleToggleCompleted(task.id, checked)}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className={
                                isCompleted
                                  ? 'text-sm font-semibold line-through text-muted-foreground'
                                  : 'text-sm font-semibold'
                              }
                            >
                              {task.title}
                            </div>
                            <Badge variant={getPriorityBadgeVariant(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{task.timeEstimate}</Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        </div>

                        <Button asChild size="sm">
                          <Link href={task.link}>Open</Link>
                        </Button>
                      </div>

                      {task.deliverables && task.deliverables.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-foreground">
                            Deliverables
                          </div>
                          <div className="mt-2 space-y-1">
                            {task.deliverables.map(deliverable => (
                              <div
                                key={deliverable}
                                className="text-xs text-muted-foreground"
                              >
                                {deliverable}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}
