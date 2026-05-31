import { resolveProjectPath } from '@/lib/services/project-service';
import * as fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import * as path from 'path';

// Base path for projects
const PROJECTS_BASE =
  process.env.PROJECTS_BASE || path.join(os.homedir(), 'Projects');

// PUT - Update an app in the project config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; appName: string }> },
) {
  try {
    const { name, appName } = await params;
    const body = await request.json();

    const projectPath =
      (await resolveProjectPath(name)) ?? path.join(PROJECTS_BASE, name);
    const configPath = path.join(projectPath, 'applab.config.ts');

    // Check if config file exists
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json(
        { error: 'Project configuration not found' },
        { status: 404 },
      );
    }

    // Read current config
    let configContent = await fs.readFile(configPath, 'utf-8');

    // Find the app in the config
    const appRegex = new RegExp(`(${appName}:\\s*{[^}]*})`, 'g');
    const appMatch = configContent.match(appRegex);

    if (!appMatch) {
      return NextResponse.json(
        { error: `App "${appName}" not found in project configuration` },
        { status: 404 },
      );
    }

    // Build the updated app configuration
    const updatedApp = {
      name: body.name || appName,
      description: body.description || '',
      type: body.type || 'web-app',
      path: body.path || '',
      dev: {
        port: body.devPort || body.dev?.port || 3000,
        command: body.devCommand || body.dev?.command || 'bun dev',
      },
      build: {
        command: body.buildCommand || body.build?.command || 'bun build',
      },
    };

    // Format the app config
    const appConfig = `    ${updatedApp.name}: {
      name: '${updatedApp.name}',
      description: '${updatedApp.description}',
      type: '${updatedApp.type}',${
        updatedApp.path
          ? `
      path: '${updatedApp.path}',`
          : ''
      }
      dev: {
        port: ${updatedApp.dev.port},
        command: '${updatedApp.dev.command}',
      },
      build: {
        command: '${updatedApp.build.command}',
      },
    }`;

    // If the name changed, we need to replace the key as well
    if (appName !== updatedApp.name) {
      // Replace the entire app entry including the key
      const oldAppRegex = new RegExp(`    ${appName}:\\s*{[^}]*},?`, 'gs');
      configContent = configContent.replace(oldAppRegex, appConfig + ',');
    } else {
      // Just replace the app content
      const oldAppRegex = new RegExp(`(    ${appName}:\\s*{)[^}]*(})`, 'gs');
      const newAppContent = appConfig.substring(
        appConfig.indexOf('{'),
        appConfig.lastIndexOf('}') + 1,
      );
      configContent = configContent.replace(
        oldAppRegex,
        `    ${appName}: ${newAppContent}`,
      );
    }

    // Write the updated config
    await fs.writeFile(configPath, configContent, 'utf-8');

    console.log(`[API] Updated app ${appName} in project ${name}`);

    return NextResponse.json({
      success: true,
      app: updatedApp,
      message: `App "${appName}" updated successfully`,
    });
  } catch (error) {
    console.error('[API] Error updating app:', error);
    return NextResponse.json(
      {
        error: 'Failed to update app',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE - Remove an app from the project config
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; appName: string }> },
) {
  try {
    const { name, appName } = await params;

    const projectPath =
      (await resolveProjectPath(name)) ?? path.join(PROJECTS_BASE, name);
    const configPath = path.join(projectPath, 'applab.config.ts');

    // Check if config file exists
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json(
        { error: 'Project configuration not found' },
        { status: 404 },
      );
    }

    // Read current config
    let configContent = await fs.readFile(configPath, 'utf-8');

    // Remove the app from the config
    const appRegex = new RegExp(`    ${appName}:\\s*{[^}]*},?\\n?`, 'gs');
    const updatedContent = configContent.replace(appRegex, '');

    // Clean up any trailing commas in the apps object
    const cleanedContent = updatedContent.replace(/,(\s*})/, '$1');

    // Write the updated config
    await fs.writeFile(configPath, cleanedContent, 'utf-8');

    console.log(`[API] Deleted app ${appName} from project ${name}`);

    return NextResponse.json({
      success: true,
      message: `App "${appName}" deleted successfully`,
    });
  } catch (error) {
    console.error('[API] Error deleting app:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete app',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
