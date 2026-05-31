'use client';

import { useCallback, useEffect, useState } from 'react';
import type { EnvVariable, ProjectConfig } from '@/lib/settings-store';

export function useEnvVariables() {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvVariables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/env');
      if (!res.ok) throw new Error('Failed to fetch environment variables');
      const data = await res.json();
      setEnvVariables(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEnvVariable = useCallback(
    async (data: {
      key: string;
      value: string;
      description?: string;
      isSecret?: boolean;
    }) => {
      try {
        const res = await fetch('/api/settings/env', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create environment variable');
        await fetchEnvVariables();
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchEnvVariables]
  );

  const updateEnvVariable = useCallback(
    async (
      id: string,
      data: Partial<{
        key: string;
        value: string;
        description: string;
        isSecret: boolean;
      }>
    ) => {
      try {
        const res = await fetch('/api/settings/env', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        });
        if (!res.ok) throw new Error('Failed to update environment variable');
        await fetchEnvVariables();
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchEnvVariables]
  );

  const deleteEnvVariable = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/settings/env?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete environment variable');
        await fetchEnvVariables();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchEnvVariables]
  );

  const getEnvValue = useCallback(
    (key: string): string | undefined => {
      return envVariables.find((env) => env.key === key)?.value;
    },
    [envVariables]
  );

  useEffect(() => {
    fetchEnvVariables();
  }, [fetchEnvVariables]);

  return {
    envVariables,
    loading,
    error,
    refresh: fetchEnvVariables,
    createEnvVariable,
    updateEnvVariable,
    deleteEnvVariable,
    getEnvValue,
  };
}

export function useProjectConfigs() {
  const [projectConfigs, setProjectConfigs] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/config');
      if (!res.ok) throw new Error('Failed to fetch project configurations');
      const data = await res.json();
      setProjectConfigs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProjectConfig = useCallback(
    async (data: {
      name: string;
      description?: string;
      settings: Record<string, any>;
    }) => {
      try {
        const res = await fetch('/api/settings/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create project configuration');
        await fetchProjectConfigs();
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchProjectConfigs]
  );

  const updateProjectConfig = useCallback(
    async (
      id: string,
      data: Partial<{
        name: string;
        description: string;
        settings: Record<string, any>;
      }>
    ) => {
      try {
        const res = await fetch('/api/settings/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        });
        if (!res.ok) throw new Error('Failed to update project configuration');
        await fetchProjectConfigs();
        return await res.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchProjectConfigs]
  );

  const deleteProjectConfig = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/settings/config?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete project configuration');
        await fetchProjectConfigs();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err;
      }
    },
    [fetchProjectConfigs]
  );

  const getConfigByName = useCallback(
    (name: string): ProjectConfig | undefined => {
      return projectConfigs.find((config) => config.name === name);
    },
    [projectConfigs]
  );

  useEffect(() => {
    fetchProjectConfigs();
  }, [fetchProjectConfigs]);

  return {
    projectConfigs,
    loading,
    error,
    refresh: fetchProjectConfigs,
    createProjectConfig,
    updateProjectConfig,
    deleteProjectConfig,
    getConfigByName,
  };
}
