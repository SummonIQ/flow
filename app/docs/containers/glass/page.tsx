'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Glass } from '@summoniq/applab-ui';

export default function GlassPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/docs/containers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Containers
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Glass Component</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          A modern glass-morphism container with backdrop blur effects and customizable edges.
        </p>

        {/* Examples */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
            <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-8 rounded-lg">
              <Glass className="p-6">
                <h3 className="text-xl font-semibold mb-2">Glass Container</h3>
                <p className="text-muted-foreground">
                  This is a basic glass container with backdrop blur and subtle transparency.
                </p>
              </Glass>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">With Custom Edges</h2>
            <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 p-8 rounded-lg">
              <Glass className="p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-2">Rounded Edges</h3>
                <p className="text-muted-foreground">
                  Glass containers can have custom border radius and styling.
                </p>
              </Glass>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
