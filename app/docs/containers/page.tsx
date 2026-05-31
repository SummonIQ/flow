'use client';

import { ArrowLeft, Box, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Glass } from '@summoniq/applab-ui';

export default function ContainersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/docs"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Documentation
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Box className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Containers
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Container components that provide structure and visual effects for wrapping content.
            These components create visual hierarchy and modern aesthetics with glass-morphism effects.
          </p>
        </div>

        {/* Components Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/docs/containers/glass"
            className="group bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Glass Component
                </h3>
                <p className="text-muted-foreground mb-4">
                  Modern glass-morphism container with backdrop blur effects and customizable edges.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-primary/10 via-transparent to-accent/15 p-6 rounded-lg">
              <Glass className="p-4 bg-card/40 rounded-lg">
                <p className="text-sm text-foreground">Glass effect preview</p>
              </Glass>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">Backdrop Blur</span>
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">Customizable Edges</span>
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">Performance Optimized</span>
            </div>
          </Link>

          {/* Placeholder for future container components */}
          <div className="bg-card/50 p-6 rounded-lg border border-dashed border-border">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  More Containers Coming Soon
                </h3>
                <p className="text-sm text-muted-foreground">
                  Additional container components will be added here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
