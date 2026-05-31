'use client';

import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ResourcesPage() {
  const resources = [
    {
      title: 'Tailwind CSS',
      description: 'Utility-first CSS framework',
      url: 'https://tailwindcss.com',
    },
    {
      title: 'Radix UI',
      description: 'Unstyled, accessible components',
      url: 'https://radix-ui.com',
    },
    {
      title: 'Lucide Icons',
      description: 'Beautiful icon library',
      url: 'https://lucide.dev',
    },
    {
      title: 'Framer Motion',
      description: 'Animation library for React',
      url: 'https://framer.com/motion',
    },
  ];

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
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Resources</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
          External resources and libraries that power our design system.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground">{resource.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
