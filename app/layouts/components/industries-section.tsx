'use client';

import { Badge } from '@/components/ui/badge';
import { Layers, Code, Cpu, Building2, Zap, Globe, type LucideIcon } from 'lucide-react';

interface Industry {
  icon: LucideIcon;
  name: string;
  items: string[];
}

interface IndustriesSectionProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
  industries?: Industry[];
  expertiseTitle?: string;
  expertiseDescription?: string;
  expertise?: string[];
  locationsLabel?: string;
  locations?: string[];
}

export function IndustriesSection({
  badge = 'Specialization',
  headline = 'Deep expertise where it matters',
  subheadline = 'We focus exclusively on key industries and verticals. This specialization means faster delivery, better results, and higher success rates.',
  industries = [
    {
      icon: Layers,
      name: 'Enterprise Software',
      items: ['SaaS Platforms', 'Business Intelligence', 'Cloud Infrastructure'],
    },
    {
      icon: Code,
      name: 'Developer Tools',
      items: ['Dev Platforms', 'CI/CD Solutions', 'API Management'],
    },
    {
      icon: Cpu,
      name: 'AI & Machine Learning',
      items: ['ML Platforms', 'Computer Vision', 'NLP Solutions'],
    },
    {
      icon: Building2,
      name: 'FinTech',
      items: ['Payment Systems', 'Banking APIs', 'Compliance Tools'],
    },
    {
      icon: Zap,
      name: 'E-Commerce',
      items: ['Marketplaces', 'Fulfillment', 'Customer Experience'],
    },
    {
      icon: Globe,
      name: 'Digital Media',
      items: ['Streaming', 'Content Platforms', 'Ad Tech'],
    },
  ],
  expertiseTitle = 'Functional Expertise',
  expertiseDescription = 'We deliver across all core functions, from engineering to operations to go-to-market.',
  expertise = [
    'Product Development',
    'Engineering & Architecture',
    'Data & Analytics',
    'DevOps & Infrastructure',
    'Security & Compliance',
    'UX & Design',
    'Sales & Marketing',
    'Strategy & Operations',
  ],
  locationsLabel = 'Primary markets we serve',
  locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'London', 'Remote-First'],
}: IndustriesSectionProps) {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {badge}
          </Badge>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            {subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {industries.map(industry => (
            <div
              key={industry.name}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-electric-blue/30 hover:shadow-md transition-all dark:bg-slate-800/60"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-electric-blue/10 flex items-center justify-center shrink-0">
                  <industry.icon className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {industry.name}
                  </h3>
                  <ul className="space-y-1">
                    {industry.items.map(item => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-border dark:bg-slate-800/60">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="lg:w-1/3">
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">
                {expertiseTitle}
              </h3>
              <p className="text-muted-foreground">{expertiseDescription}</p>
            </div>
            <div className="lg:w-2/3">
              <div className="flex flex-wrap gap-3">
                {expertise.map(item => (
                  <div
                    key={item}
                    className="px-4 py-2 rounded-full bg-muted border border-border text-sm text-foreground font-medium hover:border-teal/50 hover:bg-teal/5 transition-colors cursor-default"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">{locationsLabel}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {locations.map(location => (
              <Badge key={location} variant="outline" className="text-sm">
                {location}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
