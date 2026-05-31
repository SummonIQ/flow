'use client';

import { Badge } from '@/components/ui/badge';
import { Search, Users, Target, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

interface Stat {
  value: string;
  label: string;
}

interface ProcessStep {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ServicesSectionProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
  services?: Service[];
  stats?: Stat[];
  processTitle?: string;
  processSteps?: ProcessStep[];
}

export function ServicesSection({
  badge = 'How We Work',
  headline = 'Built for speed and precision',
  subheadline = 'Modern solutions for modern challenges. We combine deep expertise with technology-forward processes to deliver exceptional results.',
  services = [
    {
      icon: Search,
      title: 'Discovery',
      description:
        'In-depth analysis to understand your needs, goals, and challenges. We start with thorough research.',
      features: ['Requirements analysis', 'Market research', 'Strategy planning'],
    },
    {
      icon: Users,
      title: 'Collaboration',
      description:
        'Work directly with our expert team. Transparent communication and regular updates throughout.',
      features: ['Dedicated team', 'Regular syncs', 'Fast turnaround'],
    },
    {
      icon: Target,
      title: 'Delivery',
      description:
        'Precision execution with measurable outcomes. We focus on delivering value at every stage.',
      features: ['Quality assurance', 'On-time delivery', 'Ongoing support'],
    },
  ],
  stats = [
    { value: '500+', label: 'Projects Completed' },
    { value: '92%', label: 'Success Rate' },
    { value: '21', label: 'Avg Days to Launch' },
    { value: '15+', label: 'Years Experience' },
  ],
  processTitle = 'From start to finish in weeks',
  processSteps = [
    {
      step: '01',
      icon: Search,
      title: 'Discovery',
      description: 'Deep-dive into your needs, goals, and constraints',
    },
    {
      step: '02',
      icon: Target,
      title: 'Planning',
      description: 'Strategic roadmap and resource allocation',
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: 'Execution',
      description: 'Rigorous implementation with quality checks',
    },
    {
      step: '04',
      icon: TrendingUp,
      title: 'Launch',
      description: 'Deployment, optimization, and ongoing support',
    },
  ],
}: ServicesSectionProps) {
  return (
    <section className="py-20 bg-background">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {services.map(service => (
            <div
              key={service.title}
              className="relative p-8 rounded-2xl border border-border bg-white/60 backdrop-blur-sm hover:border-electric-blue/50 hover:shadow-lg transition-all group dark:bg-slate-800/60"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-blue/10 flex items-center justify-center mb-6 group-hover:bg-electric-blue/20 transition-colors">
                <service.icon className="w-6 h-6 text-electric-blue" />
              </div>
              <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.features.map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-navy rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-electric-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Our Process
            </Badge>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              {processTitle}
            </h3>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-electric-blue/30 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {processSteps.map(item => (
                <div key={item.step} className="relative group">
                  <div className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-border p-6 h-full hover:border-electric-blue/40 hover:shadow-lg transition-all overflow-hidden">
                    <span className="absolute -top-4 -right-2 text-9xl font-display font-bold text-gray-700/5 select-none pointer-events-none">
                      {item.step}
                    </span>
                    <div className="relative z-10 w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-electric-blue" />
                    </div>
                    <h4 className="relative z-10 font-semibold text-foreground mb-2">
                      {item.title}
                    </h4>
                    <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
