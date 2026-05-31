'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@summoniq/applab-ui';
import { Code, Eye } from 'lucide-react';

interface ComponentPreviewProps {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}

export function ComponentPreview({
  title,
  description,
  code,
  children,
}: ComponentPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="w-4 h-4" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="p-6 rounded-lg border bg-muted/30 min-h-[200px] flex items-center justify-center">
              {children}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm">
                <code>{code}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

