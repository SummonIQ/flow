'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight, Code, Database, Server } from 'lucide-react';

const apiSections = [
  {
    name: 'Projects API',
    href: '/docs/api/projects',
    icon: Server,
    description: 'Endpoints for managing projects and their metadata',
    endpoints: ['GET /api/projects', 'POST /api/projects', 'PUT /api/projects/:id', 'DELETE /api/projects/:id'],
  },
  {
    name: 'Applications API',
    href: '/docs/api/applications',
    icon: Code,
    description: 'Endpoints for managing applications within projects',
    endpoints: ['GET /api/applications', 'POST /api/applications', 'PUT /api/applications/:id', 'DELETE /api/applications/:id'],
  },
  {
    name: 'Categories API',
    href: '/docs/api/categories',
    icon: Database,
    description: 'Endpoints for organizing and categorizing projects',
    endpoints: ['GET /api/categories', 'POST /api/categories', 'PUT /api/categories/:id', 'DELETE /api/categories/:id'],
  },
];

export default function APIReferencePage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">API Reference</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Comprehensive documentation for all API endpoints and data structures
      </p>

      {/* Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="text-sm bg-muted px-2 py-1 rounded">http://localhost:3000/api</code>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Most endpoints require authentication. Include your API key in the Authorization header:
            </p>
            <pre className="text-sm bg-muted p-3 rounded-lg mt-2 overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response Format</h3>
            <p className="text-sm text-muted-foreground">
              All responses are returned in JSON format with the following structure:
            </p>
            <pre className="text-sm bg-muted p-3 rounded-lg mt-2 overflow-x-auto">
{`{
  "success": true,
  "data": { /* response data */ },
  "error": null
}

// Error response
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Rate Limiting</h3>
            <p className="text-sm text-muted-foreground">
              API requests are limited to 100 requests per minute per API key.
            </p>
          </div>
        </div>
      </div>

      {/* API Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.name} href={section.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle>{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {section.endpoints.map((endpoint) => (
                        <div key={endpoint} className="text-xs font-mono text-muted-foreground">
                          {endpoint}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* HTTP Methods */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">HTTP Methods</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">GET</span>
                Retrieve Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used to retrieve resources. Should not modify any data on the server.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-mono bg-green-500/20 text-green-600 dark:text-green-400 rounded">POST</span>
                Create Resource
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used to create new resources. Returns the created resource with a 201 status code.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-mono bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">PUT</span>
                Update Resource
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used to update existing resources. Requires the full resource payload.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-mono bg-red-500/20 text-red-600 dark:text-red-400 rounded">DELETE</span>
                Remove Resource
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used to delete resources. Returns a 204 No Content status on success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Codes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">HTTP Status Codes</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">200</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">OK</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Request succeeded</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">201</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Created</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Resource created successfully</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">204</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">No Content</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Request succeeded, no content to return</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">400</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Bad Request</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Invalid request parameters</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">401</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Unauthorized</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Authentication required or failed</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">403</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Forbidden</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Insufficient permissions</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">404</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Not Found</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Resource not found</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">429</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Too Many Requests</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Rate limit exceeded</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">500</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">Internal Server Error</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">Server encountered an error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
