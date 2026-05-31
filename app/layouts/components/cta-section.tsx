'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Users } from 'lucide-react';

interface CTASectionProps {
  leftBadge?: string;
  leftHeadline?: string;
  leftDescription?: string;
  primaryCta?: { label: string; href: string; icon?: React.ReactNode };
  secondaryCta?: { label: string; href: string };
  rightBadge?: string;
  rightHeadline?: string;
  rightDescription?: string;
  rightFeatures?: string[];
  rightCta?: { label: string; href: string };
  contactLabel?: string;
  contactEmail?: string;
  socialLinks?: { label: string; href: string }[];
}

export function CTASection({
  leftBadge = 'For Businesses',
  leftHeadline = 'Ready to get started?',
  leftDescription = 'Schedule a 30-minute consultation to discuss your needs. We\'ll share relevant insights and outline a strategy.',
  primaryCta = { label: 'Book a Consultation', href: '/contact', icon: <Calendar className="w-5 h-5 mr-2" /> },
  secondaryCta = { label: 'Browse Solutions', href: '/solutions' },
  rightBadge = 'For Developers',
  rightHeadline = 'Exploring new tools?',
  rightDescription = 'Join our community to stay updated on the latest features and get early access to new releases.',
  rightFeatures = [
    'Access to beta features',
    'Technical support from experts',
    'Community forums and resources',
    'Regular workshops and events',
  ],
  rightCta = { label: 'Join Community', href: '/community' },
  contactLabel = 'Get in touch directly',
  contactEmail = 'hello@example.com',
  socialLinks = [
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
  ],
}: CTASectionProps) {
  return (
    <section className="py-20 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/20 text-electric-blue text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              {leftBadge}
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-4">
              {leftHeadline}
            </h2>
            <p className="text-muted-foreground text-base mb-6 max-w-lg">
              {leftDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-electric-blue text-foreground hover:bg-electric-blue/90"
                asChild
              >
                <Link href={primaryCta.href}>
                  {primaryCta.icon}
                  {primaryCta.label}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-foreground/10"
                asChild
              >
                <Link href={secondaryCta.href}>
                  {secondaryCta.label}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-border dark:bg-slate-800/60">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/20 text-teal text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              {rightBadge}
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-4">
              {rightHeadline}
            </h3>
            <p className="text-muted-foreground mb-6">{rightDescription}</p>
            <ul className="space-y-3 mb-8">
              {rightFeatures.map(item => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="w-full border-teal text-teal hover:bg-teal/10"
              asChild
            >
              <Link href={rightCta.href}>{rightCta.label}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">{contactLabel}</p>
              <a
                href={`mailto:${contactEmail}`}
                className="text-foreground font-medium hover:text-electric-blue transition-colors"
              >
                {contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-6">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
