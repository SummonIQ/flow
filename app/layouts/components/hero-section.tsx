'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  ShieldCheck,
  Unlock,
  Zap,
  Layers,
  Globe,
  Sparkles,
} from 'lucide-react';
import { DotGridHero } from './dot-grid-hero';

type FeatureCardData = {
  name: string;
  initials: string;
  title: string;
  subtitle: string;
  metric: string;
  location: string;
  tags: string[];
  color: string;
  ringColor: string;
  textColor: string;
};

const FeatureCard = ({ feature }: { feature: FeatureCardData }) => {
  const [localGlare, setLocalGlare] = useState({ x: 50, y: 50, active: false });

  return (
    <div
      className="group relative flex items-start gap-4 rounded-2xl border-t border-t-slate-200/20 border-x border-x-slate-300 dark:border-x-slate-800/70 border-b-[3px] border-b-slate-800/15 bg-white p-4 hover:shadow-xl hover:scale-[1.05] transition-all duration-300 ease-out cursor-pointer dark:border-t-slate-700/20 dark:border-x-slate-700 dark:border-b-slate-950 dark:bg-slate-900 overflow-hidden"
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setLocalGlare({ x, y, active: true });
      }}
      onMouseLeave={() => setLocalGlare({ x: 50, y: 50, active: false })}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${localGlare.x}% ${localGlare.y}%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)`,
          filter: 'blur(8px)',
          opacity: localGlare.active ? 1 : 0,
        }}
      />
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${feature.color} ${feature.textColor} ${feature.ringColor} text-sm font-bold shadow-lg ring-2 group-hover:opacity-100 transition-all duration-300`}
      >
        {feature.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-foreground truncate">
            {feature.name}
          </span>
          <span className="text-[11px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full shrink-0">
            {feature.metric}
          </span>
        </div>
        <div className="text-sm font-semibold text-foreground/60 dark:text-foreground/50 truncate mt-1 mb-1">
          {feature.title}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {feature.subtitle} · {feature.location}
        </div>
        <div className="flex gap-1.5 mt-3">
          {feature.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-electric-blue/10 border border-electric-blue/20 px-2.5 py-0.5 text-[10px] font-semibold text-electric-blue dark:bg-electric-blue/20 dark:text-electric-blue"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface HeroSectionProps {
  children?: React.ReactNode;
  badge?: string;
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: { value: string; label: string }[];
  categories?: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  cardTitle?: string;
  cardSubtitle?: string;
  features?: FeatureCardData[];
  unlockLabel?: string;
  unlockHref?: string;
}

export function HeroSection({
  children,
  badge = 'Now available',
  headline = 'Build something amazing today.',
  subheadline = 'A modern platform designed to help you create, scale, and succeed. Get started in minutes with our intuitive tools.',
  primaryCta = { label: 'Get Started', href: '/get-started' },
  secondaryCta = { label: 'Learn More', href: '/learn-more' },
  stats = [{ value: '500+', label: 'customers' }],
  categories = [
    { icon: Zap, label: 'Fast' },
    { icon: Layers, label: 'Scalable' },
    { icon: Sparkles, label: 'Modern' },
    { icon: Globe, label: 'Global' },
  ],
  cardTitle = 'Featured',
  cardSubtitle = 'Discover what you can build',
  features = [
    {
      name: 'Feature One',
      initials: 'F1',
      title: 'Primary Feature',
      subtitle: 'Enterprise Ready',
      metric: 'New',
      location: 'Available Now',
      tags: ['Tag 1', 'Tag 2'],
      color: 'bg-blue-500/20',
      ringColor: 'ring-blue-500/30',
      textColor: 'text-blue-500',
    },
    {
      name: 'Feature Two',
      initials: 'F2',
      title: 'Secondary Feature',
      subtitle: 'Production Ready',
      metric: 'Popular',
      location: 'Available Now',
      tags: ['Tag 3', 'Tag 4'],
      color: 'bg-teal/20',
      ringColor: 'ring-teal/30',
      textColor: 'text-teal',
    },
    {
      name: 'Feature Three',
      initials: 'F3',
      title: 'Advanced Feature',
      subtitle: 'Beta',
      metric: 'Coming',
      location: 'Q1 2025',
      tags: ['Tag 5', 'Tag 6'],
      color: 'bg-purple-500/20',
      ringColor: 'ring-purple-500/30',
      textColor: 'text-purple-500',
    },
  ],
  unlockLabel = 'Explore Features',
  unlockHref = '/features',
}: HeroSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 6, y: -8 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const isInsideCard =
      x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

    const maxDistance = 400;
    const outsideDistX = Math.max(0, -x, x - rect.width);
    const outsideDistY = Math.max(0, -y, y - rect.height);
    const outsideDist = Math.sqrt(outsideDistX ** 2 + outsideDistY ** 2);
    const scaleFactor = isInsideCard
      ? 1
      : Math.max(0.1, 1 - outsideDist / maxDistance);

    const tiltX = ((y - centerY) / centerY) * -12 * scaleFactor;
    const tiltY = ((x - centerX) / centerX) * 12 * scaleFactor;

    const glareX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const glareY = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const glareOpacity = isInsideCard ? 0.08 + (1 - x / rect.width) * 0.1 : 0;

    setTilt({ x: tiltX, y: tiltY });
    setGlare({ x: glareX, y: glareY, opacity: glareOpacity });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 6, y: -8 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20"
    >
      <div className="absolute inset-0">{children}</div>

      <div className="absolute inset-0 opacity-60">
        <DotGridHero />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/40 via-transparent to-background/60" />

      <div className="relative z-10 isolate">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-7 pt-16">
              <div className="inline-flex items-center gap-2.5 rounded-full border-b border-b-teal-500/20 dark:border-b-teal-950/55 border border-teal-500/10 dark:border-t-teal-400/15 border-t-teal-200/40 border-t bg-electric-blue/5 px-4 py-1.5 backdrop-blur-sm drop-shadow-lg drop-shadow-teal-500/80 shadow-2xl shadow-teal-900/75">
                <span className="flex h-2 w-2 rounded-full bg-teal animate-pulse" />
                <span className="text-sm font-medium text-foreground/80">
                  {badge}
                </span>
              </div>

              <h1 className="mt-8 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                {headline}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
                {subheadline}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs">
                {categories.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm text-slate-500"
                  >
                    <Icon className="h-4 w-4 text-electric-blue" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="bg-electric-blue px-10 py-6 text-base font-semibold text-white hover:bg-sky-600 rounded-xl"
                  asChild
                >
                  <Link href={primaryCta.href}>
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 backdrop-blur-sm dark:bg-slate-800/70 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white rounded-xl"
                  asChild
                >
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-4 text-sm text-slate-400">
                {stats.map((stat, idx) => (
                  <span key={stat.label} className="inline-flex items-center gap-1.5">
                    {idx === 0 && <ShieldCheck className="h-4 w-4 text-teal" />}
                    {stat.value} {stat.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 pt-8">
              <div
                ref={cardRef}
                className="relative mx-auto max-w-md md:max-w-none"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute -inset-16 -z-10 overflow-visible">
                  <div
                    className="absolute top-0 -left-8 w-72 h-72 bg-electric-blue/30 rounded-full blur-[80px]"
                    style={{ animation: 'float1 20s ease-in-out infinite' }}
                  />
                  <div
                    className="absolute -top-12 right-0 w-64 h-64 bg-fuchsia-500/25 rounded-full blur-[100px]"
                    style={{ animation: 'float2 25s ease-in-out infinite' }}
                  />
                  <div
                    className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal/20 rounded-full blur-[90px]"
                    style={{ animation: 'float3 22s ease-in-out infinite' }}
                  />
                  <div
                    className="absolute -bottom-8 -right-8 w-56 h-56 bg-cyan-400/20 rounded-full blur-[70px]"
                    style={{
                      animation: 'float1 18s ease-in-out infinite reverse',
                    }}
                  />
                </div>
                <Card
                  className="relative border-x-0 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--card) / 0.85) 0%, hsl(var(--card) / 0.80) 40%, hsl(var(--card) / 0.75) 70%, hsl(var(--card) / 0.68) 100%)',
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                    style={{
                      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.12) 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                      opacity: glare.opacity > 0 ? 1 : 0,
                      transition:
                        'opacity 500ms ease-out, background 200ms ease-out',
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.6), rgba(232, 121, 249, 0.5), rgba(94, 234, 212, 0.6), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 8s linear infinite',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] opacity-60"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), rgba(168, 85, 247, 0.7), rgba(20, 184, 166, 0.8), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 8s linear infinite reverse',
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-foreground">
                      {cardTitle}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-transparent text-red-500 bg-transparent"
                    >
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground/60 dark:text-muted-foreground/50 mt-1 mb-6">
                    {cardSubtitle}
                  </p>
                  <div className="space-y-3">
                    {features.map(feature => (
                      <FeatureCard key={feature.name} feature={feature} />
                    ))}
                  </div>
                  <div className="mt-5">
                    <Button
                      className="w-full bg-teal text-white text-base font-bold hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg py-6 rounded-xl hover:shadow-xl dark:text-teal-950 dark:hover:text-emerald-950"
                      size="lg"
                      asChild
                    >
                      <Link href={unlockHref}>
                        <Unlock className="mr-2 h-5 w-5" />
                        {unlockLabel}
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
