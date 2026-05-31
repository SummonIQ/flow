/**
 * Settings Store - Local storage management for environment variables and project config
 * Can be migrated to a database later
 */

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface SettingsData {
  envVariables: EnvVariable[];
  projectConfigs: ProjectConfig[];
}

const STORAGE_KEY = 'applab-settings';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to get current timestamp
const timestamp = () => new Date().toISOString();

/**
 * Get all settings from storage
 */
export function getSettings(): SettingsData {
  if (typeof window === 'undefined') {
    return { envVariables: [], projectConfigs: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { envVariables: [], projectConfigs: [] };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading settings:', error);
    return { envVariables: [], projectConfigs: [] };
  }
}

/**
 * Save settings to storage
 */
function saveSettings(data: SettingsData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
}

// Environment Variables CRUD
export function getEnvVariables(): EnvVariable[] {
  return getSettings().envVariables;
}

export function getEnvVariable(id: string): EnvVariable | undefined {
  return getSettings().envVariables.find((env) => env.id === id);
}

export function createEnvVariable(
  data: Omit<EnvVariable, 'id' | 'createdAt' | 'updatedAt'>
): EnvVariable {
  const settings = getSettings();
  const newVar: EnvVariable = {
    ...data,
    id: generateId(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };

  settings.envVariables.push(newVar);
  saveSettings(settings);
  return newVar;
}

export function updateEnvVariable(
  id: string,
  data: Partial<Omit<EnvVariable, 'id' | 'createdAt' | 'updatedAt'>>
): EnvVariable {
  const settings = getSettings();
  const index = settings.envVariables.findIndex((env) => env.id === id);

  if (index === -1) {
    throw new Error(`Environment variable with id ${id} not found`);
  }

  settings.envVariables[index] = {
    ...settings.envVariables[index],
    ...data,
    updatedAt: timestamp(),
  };

  saveSettings(settings);
  return settings.envVariables[index];
}

export function deleteEnvVariable(id: string): void {
  const settings = getSettings();
  settings.envVariables = settings.envVariables.filter((env) => env.id !== id);
  saveSettings(settings);
}

// Project Config CRUD
export function getProjectConfigs(): ProjectConfig[] {
  return getSettings().projectConfigs;
}

export function getProjectConfig(id: string): ProjectConfig | undefined {
  return getSettings().projectConfigs.find((config) => config.id === id);
}

export function createProjectConfig(
  data: Omit<ProjectConfig, 'id' | 'createdAt' | 'updatedAt'>
): ProjectConfig {
  const settings = getSettings();
  const newConfig: ProjectConfig = {
    ...data,
    id: generateId(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  };

  settings.projectConfigs.push(newConfig);
  saveSettings(settings);
  return newConfig;
}

export function updateProjectConfig(
  id: string,
  data: Partial<Omit<ProjectConfig, 'id' | 'createdAt' | 'updatedAt'>>
): ProjectConfig {
  const settings = getSettings();
  const index = settings.projectConfigs.findIndex((config) => config.id === id);

  if (index === -1) {
    throw new Error(`Project config with id ${id} not found`);
  }

  settings.projectConfigs[index] = {
    ...settings.projectConfigs[index],
    ...data,
    settings: {
      ...settings.projectConfigs[index].settings,
      ...(data.settings || {}),
    },
    updatedAt: timestamp(),
  };

  saveSettings(settings);
  return settings.projectConfigs[index];
}

export function deleteProjectConfig(id: string): void {
  const settings = getSettings();
  settings.projectConfigs = settings.projectConfigs.filter(
    (config) => config.id !== id
  );
  saveSettings(settings);
}

// Export all environment variables to a .env format
export function exportEnvToString(): string {
  const envVars = getEnvVariables();
  return envVars
    .map((env) => {
      const comment = env.description ? `# ${env.description}\n` : '';
      return `${comment}${env.key}=${env.value}`;
    })
    .join('\n\n');
}

// Import environment variables from .env format
export function importEnvFromString(envString: string): void {
  const lines = envString.split('\n');
  const settings = getSettings();
  let currentDescription = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      currentDescription = '';
      continue;
    }

    // Handle comments
    if (trimmed.startsWith('#')) {
      currentDescription = trimmed.substring(1).trim();
      continue;
    }

    // Parse key=value
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      const existingVar = settings.envVariables.find((v) => v.key === key.trim());

      if (existingVar) {
        // Update existing
        updateEnvVariable(existingVar.id, {
          value: value.trim(),
          description: currentDescription || existingVar.description,
        });
      } else {
        // Create new
        createEnvVariable({
          key: key.trim(),
          value: value.trim(),
          description: currentDescription,
          isSecret: false,
        });
      }

      currentDescription = '';
    }
  }
}
