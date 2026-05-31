'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Glass } from '@summoniq/applab-ui';

export default function GlassContainerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/design-system"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Design System
        </Link>

        <h1 className="text-4xl font-bold text-foreground mb-4">Glass Container</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Modern glass-morphism containers with backdrop blur effects for creating depth and visual hierarchy.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Examples</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 p-8 rounded-lg">
                <Glass className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Standard Glass</h3>
                  <p className="text-sm text-muted-foreground">
                    Basic glass effect with backdrop blur
                  </p>
                </Glass>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 via-teal-500/10 to-blue-500/20 p-8 rounded-lg">
                <Glass className="p-6 bg-card/60">
                  <h3 className="text-lg font-semibold mb-2">Enhanced Opacity</h3>
                  <p className="text-sm text-muted-foreground">
                    Glass with increased background opacity
                  </p>
                </Glass>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
