'use client';

import { ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';

export default function TokensPage() {
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

        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Design Tokens</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          Centralized design tokens for colors, spacing, typography, and other visual properties.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-primary rounded-lg" />
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-secondary rounded-lg" />
                <p className="text-sm font-medium">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-accent rounded-lg" />
                <p className="text-sm font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-muted rounded-lg" />
                <p className="text-sm font-medium">Muted</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Spacing Scale</h2>
            <div className="space-y-4">
              {[1, 2, 4, 6, 8, 12, 16, 24].map((size) => (
                <div key={size} className="flex items-center gap-4">
                  <div className={`bg-primary h-8 rounded`} style={{ width: `${size * 4}px` }} />
                  <span className="text-sm text-muted-foreground">{size} ({size * 4}px)</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Typography</h2>
            <div className="space-y-4">
              <div>
                <p className="text-4xl font-bold">Heading 1</p>
                <p className="text-sm text-muted-foreground">4xl / Bold</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Heading 2</p>
                <p className="text-sm text-muted-foreground">3xl / Bold</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">Heading 3</p>
                <p className="text-sm text-muted-foreground">2xl / Semibold</p>
              </div>
              <div>
                <p className="text-base">Body Text</p>
                <p className="text-sm text-muted-foreground">Base / Regular</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
