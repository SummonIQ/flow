'use client';

import { RunControlButton } from '@/components/runtime/run-control-button';
import { useState } from 'react';
import { Database, Trash2, Plus, Eye, Settings, RefreshCw } from 'lucide-react';
import { Button, Input, Label, Badge } from '@summoniq/applab-ui';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface DatabaseConfig {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  status: 'running' | 'stopped' | 'error';
  createdAt: Date;
}

interface DatabaseManagerProps {
  projectName: string;
  databases?: DatabaseConfig[];
}

export function DatabaseManager({ projectName, databases = [] }: DatabaseManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [databaseList, setDatabaseList] = useState<DatabaseConfig[]>(databases);
  const [newDb, setNewDb] = useState({
    name: '',
    type: 'postgresql' as const,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: '',
  });

  const handleCreateDatabase = async () => {
    if (!newDb.name || !newDb.password || !newDb.database) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectName}/databases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDb),
      });

      if (!response.ok) throw new Error('Failed to create database');

      const created = await response.json();
      setDatabaseList([...databaseList, created]);
      toast.success(`Database "${newDb.name}" created successfully`);
      setShowCreateForm(false);
      setNewDb({
        name: '',
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: '',
      });
    } catch (error) {
      toast.error('Failed to create database');
      console.error(error);
    }
  };

  const handleStartDatabase = async (dbId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/databases/${dbId}/start`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to start database');

      setDatabaseList(databaseList.map(db => 
        db.id === dbId ? { ...db, status: 'running' as const } : db
      ));
      toast.success('Database started');
    } catch (error) {
      toast.error('Failed to start database');
    }
  };

  const handleStopDatabase = async (dbId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/databases/${dbId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to stop database');

      setDatabaseList(databaseList.map(db => 
        db.id === dbId ? { ...db, status: 'stopped' as const } : db
      ));
      toast.success('Database stopped');
    } catch (error) {
      toast.error('Failed to stop database');
    }
  };

  const handleDeleteDatabase = async (dbId: string) => {
    if (!confirm('Are you sure you want to delete this database? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectName}/databases/${dbId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete database');

      setDatabaseList(databaseList.filter(db => db.id !== dbId));
      toast.success('Database deleted');
    } catch (error) {
      toast.error('Failed to delete database');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Database Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage PostgreSQL databases for your project
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Database
        </Button>
      </div>

      {/* Create Database Form */}
      {showCreateForm && (
        <div className="p-6 border border-border rounded-lg bg-secondary/20">
          <h4 className="text-md font-semibold mb-4">Create New Database</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-name">Database Name *</Label>
              <Input
                id="db-name"
                placeholder="my-app-db"
                value={newDb.name}
                onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-database">Database Schema *</Label>
              <Input
                id="db-database"
                placeholder="myapp"
                value={newDb.database}
                onChange={(e) => setNewDb({ ...newDb, database: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-host">Host</Label>
              <Input
                id="db-host"
                value={newDb.host}
                onChange={(e) => setNewDb({ ...newDb, host: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-port">Port</Label>
              <Input
                id="db-port"
                type="number"
                value={newDb.port}
                onChange={(e) => setNewDb({ ...newDb, port: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-username">Username</Label>
              <Input
                id="db-username"
                value={newDb.username}
                onChange={(e) => setNewDb({ ...newDb, username: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-password">Password *</Label>
              <Input
                id="db-password"
                type="password"
                value={newDb.password}
                onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDatabase}>
              Create Database
            </Button>
          </div>
        </div>
      )}

      {/* Database List */}
      <div className="space-y-3">
        {databaseList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Database className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No databases configured</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first database to get started
            </p>
          </div>
        ) : (
          databaseList.map((db) => (
            <div
              key={db.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-lg ${
                  db.status === 'running' ? 'bg-green-500/10' :
                  db.status === 'error' ? 'bg-red-500/10' : 'bg-gray-500/10'
                }`}>
                  <Database className={`w-5 h-5 ${
                    db.status === 'running' ? 'text-green-500' :
                    db.status === 'error' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{db.name}</h4>
                    <Badge variant={
                      db.status === 'running' ? 'default' :
                      db.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {db.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {db.type.toUpperCase()} • {db.host}:{db.port} • {db.database}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/projects/${projectName}/database/${db.id}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Data
                </Button>

                <RunControlButton
                  state={db.status === 'running' ? 'running' : 'stopped'}
                  size="sm"
                  startLabel="Start"
                  stopLabel="Stop"
                  onClick={() =>
                    db.status === 'running'
                      ? handleStopDatabase(db.id)
                      : handleStartDatabase(db.id)
                  }
                  aria-label={
                    db.status === 'running' ? 'Stop database' : 'Start database'
                  }
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDatabase(db.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div className="flex gap-2 text-sm">
          <div className="text-blue-600 dark:text-blue-400 font-medium">ℹ️ Info:</div>
          <div className="text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Database Management:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
              <li>Databases are created using Docker containers</li>
              <li>Each database runs in isolation with its own port</li>
              <li>Click "View Data" to browse tables with a Prisma Studio-like interface</li>
              <li>Connection strings are automatically generated and saved to .env</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
